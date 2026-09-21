import { prisma } from "./db";
import { collectAxeIssues } from "./axe";
import { launchBrowser, gotoRendered, collectHrefs } from "./browser";
import { COPY } from "./copy";
import { diffIssues } from "./diff";
import {
  buildInitialTargets,
  commonFallbackPaths,
  inferPathKind,
  pageLabel,
  pickDiscoveredTargets,
  shouldDiscover,
} from "./paths";
import { compareIssues } from "./rank";
import { draftStatement } from "./statement";
import type { MoneyPages, PathKind, Target } from "./types";
import {
  buildUncheckedSurfaces,
  checkoutLooksRendered,
  detectShopify,
} from "./unchecked";
import { canonicalSiteUrl, pathnameOf } from "./urls";

const globalQueue = globalThis as unknown as {
  __recheckLocks?: Set<string>;
  __recheckTail?: Promise<void>;
};

function locks(): Set<string> {
  if (!globalQueue.__recheckLocks) globalQueue.__recheckLocks = new Set();
  return globalQueue.__recheckLocks;
}

export function enqueueScan(scanId: string): void {
  const run = async () => {
    if (locks().has(scanId)) return;
    locks().add(scanId);
    try {
      await runScan(scanId);
    } finally {
      locks().delete(scanId);
    }
  };
  globalQueue.__recheckTail = (globalQueue.__recheckTail ?? Promise.resolve())
    .then(run)
    .catch((error) => {
      console.error("Scan queue error", error);
    });
}

export async function runScan(scanId: string): Promise<void> {
  const claimed = await prisma.scan.updateMany({
    where: { id: scanId, status: "queued" },
    data: { status: "running" },
  });
  if (claimed.count === 0) {
    const existing = await prisma.scan.findUnique({ where: { id: scanId } });
    if (!existing || existing.status !== "queued") return;
  }

  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: { site: true, pages: true },
  });
  if (!scan) return;

  let requested: { storefrontUrl: string; moneyPages: MoneyPages };
  try {
    requested = JSON.parse(scan.requestedUrlsJson) as {
      storefrontUrl: string;
      moneyPages: MoneyPages;
    };
  } catch {
    await failScan(scanId, "Could not read requested URLs.");
    return;
  }

  const targets = buildInitialTargets(
    requested.storefrontUrl,
    requested.moneyPages || {},
  );
  await ensurePageRows(scanId, targets);

  let browser;
  try {
    browser = await launchBrowser();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Browser failed to start";
    await failScan(scanId, message);
    return;
  }

  const context = await browser.newContext({
    userAgent:
      "RecheckAccessibilityScan/1.0 (honest automated re-check; not a certification)",
    viewport: { width: 1366, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  let isShopify = scan.isShopify;
  let checkoutRendered = false;
  const attempted = new Set(targets.map((t) => t.url));
  const queue: Target[] = [...targets];
  let discovered = false;
  const maxPages = 8;

  try {
    while (queue.length > 0 && attempted.size <= maxPages) {
      const target = queue.shift();
      if (!target) break;

      const row = await prisma.page.findFirst({
        where: { scanId, url: target.url },
      });
      const pageId =
        row?.id ??
        (
          await prisma.page.create({
            data: {
              scanId,
              url: target.url,
              pathname: pathnameOf(target.url),
              pathKind: target.pathKind,
              status: "pending",
            },
          })
        ).id;

      const result = await gotoRendered(page, target.url);
      const finalKind = inferPathKind(result.finalUrl || target.url, target.pathKind);

      if (!result.ok) {
        await prisma.page.update({
          where: { id: pageId },
          data: {
            status: "failed",
            pathKind: finalKind,
            failReason: COPY.partialFail(pageLabel(target.url, finalKind)),
            scannedAt: new Date(),
            url: result.finalUrl || target.url,
            pathname: pathnameOf(result.finalUrl || target.url),
          },
        });
        continue;
      }

      if (detectShopify(result.finalUrl, result.html)) isShopify = true;
      if (checkoutLooksRendered(result.finalUrl, result.html, finalKind)) {
        checkoutRendered = true;
      }

      let issues;
      try {
        issues = await collectAxeIssues({
          page,
          siteUrl: scan.site.url,
          pageUrl: result.finalUrl,
          pathKind: finalKind,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "axe-core failed";
        await prisma.page.update({
          where: { id: pageId },
          data: {
            status: "failed",
            pathKind: finalKind,
            failReason: COPY.partialFail(pageLabel(target.url, finalKind)),
            scannedAt: new Date(),
            title: message,
          },
        });
        continue;
      }

      const title = await page.title().catch(() => "");
      await prisma.page.update({
        where: { id: pageId },
        data: {
          status: "reached",
          pathKind: finalKind,
          failReason: null,
          scannedAt: new Date(),
          title,
          url: result.finalUrl,
          pathname: pathnameOf(result.finalUrl),
        },
      });

      if (issues.length > 0) {
        await prisma.issue.createMany({
          data: issues.map((issue) => ({
            scanId,
            pageId,
            stableId: issue.stableId,
            ruleId: issue.ruleId,
            title: issue.title,
            description: issue.description,
            helpUrl: issue.helpUrl,
            severity: issue.severity,
            selector: issue.selector,
            htmlSnippet: issue.htmlSnippet,
            rankScore: issue.rankScore,
          })),
        });
      }

      if (!discovered && finalKind === "home" && shouldDiscover(requested.moneyPages || {})) {
        discovered = true;
        const hrefs = await collectHrefs(page);
        const extra = pickDiscoveredTargets(hrefs, scan.site.url, [
          ...targets,
          ...queue,
        ]);
        const fallbacks = commonFallbackPaths(scan.site.url).filter((t) => {
          const alreadyHaveKind = [...targets, ...queue, ...extra].some(
            (x) => x.pathKind === t.pathKind,
          );
          return !alreadyHaveKind;
        });
        for (const t of [...extra, ...fallbacks]) {
          if (attempted.has(t.url)) continue;
          if (queue.length + attempted.size >= maxPages) break;
          attempted.add(t.url);
          queue.push(t);
          await prisma.page.create({
            data: {
              scanId,
              url: t.url,
              pathname: pathnameOf(t.url),
              pathKind: t.pathKind,
              status: "pending",
            },
          });
        }
      }
    }
  } finally {
    await context.close().catch(() => undefined);
    await browser.close().catch(() => undefined);
  }

  await finalizeScan(scanId, { isShopify, checkoutRendered });
}

async function ensurePageRows(scanId: string, targets: Target[]): Promise<void> {
  const existing = await prisma.page.findMany({ where: { scanId } });
  const have = new Set(existing.map((p) => p.url));
  for (const t of targets) {
    if (have.has(t.url)) continue;
    await prisma.page.create({
      data: {
        scanId,
        url: t.url,
        pathname: pathnameOf(t.url),
        pathKind: t.pathKind,
        status: "pending",
      },
    });
  }
}

async function failScan(scanId: string, errorMessage: string): Promise<void> {
  await prisma.scan.update({
    where: { id: scanId },
    data: {
      status: "failed",
      finishedAt: new Date(),
      errorMessage,
      softError: false,
    },
  });
}

async function finalizeScan(
  scanId: string,
  flags: { isShopify: boolean; checkoutRendered: boolean },
): Promise<void> {
  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: {
      site: true,
      pages: true,
      issues: { include: { page: true } },
    },
  });
  if (!scan) return;

  const reached = scan.pages.filter((p) => p.status === "reached");
  const failed = scan.pages.filter((p) => p.status === "failed");

  if (reached.length === 0) {
    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: "failed",
        finishedAt: new Date(),
        errorMessage: COPY.hardError,
        pagesReached: 0,
        checkoutRendered: false,
        isShopify: flags.isShopify,
        softError: false,
      },
    });
    return;
  }

  const previous = await prisma.scan.findFirst({
    where: {
      siteId: scan.siteId,
      id: { not: scanId },
      status: { in: ["completed", "incomplete"] },
    },
    orderBy: { startedAt: "desc" },
    include: { issues: { include: { page: true } }, pages: true },
  });

  const currentIssues = scan.issues.map((issue) => ({
    stableId: issue.stableId,
    pathname: issue.page.pathname,
  }));
  const previousIssues =
    previous?.issues.map((issue) => ({
      stableId: issue.stableId,
      pathname: issue.page.pathname,
    })) ?? null;

  const diff = diffIssues({
    previous: previousIssues,
    current: currentIssues,
    currentReachedPathnames: reached.map((p) => p.pathname),
    previousPagesReached: previous?.pagesReached ?? null,
    currentPagesReached: reached.length,
  });

  const checkoutRendered = flags.checkoutRendered;

  const unchecked = buildUncheckedSurfaces({
    checkoutRendered,
    isShopify: flags.isShopify,
    failedPages: failed.map((p) => ({
      label: pageLabel(p.url, p.pathKind as PathKind),
      pathKind: p.pathKind as PathKind,
    })),
  });

  const rankedIssues = [...scan.issues]
    .map((issue) => ({
      title: issue.title,
      pathname: issue.page.pathname,
      stableId: issue.stableId,
      severity: issue.severity as "critical" | "serious" | "moderate" | "minor",
      rankScore: issue.rankScore,
      pathKind: issue.page.pathKind as PathKind,
    }))
    .sort(compareIssues);

  const body = draftStatement({
    scannedAt: new Date(),
    reachedPages: reached.map((p) => ({
      url: p.url,
      pathname: p.pathname,
      pathKind: p.pathKind as PathKind,
    })),
    checkoutRendered,
    unchecked,
    issues: rankedIssues,
    coverageShrunk: diff.coverageShrunk,
    priorScanDate: previous?.finishedAt ?? previous?.startedAt ?? null,
  });

  const incomplete = failed.length > 0;
  await prisma.$transaction([
    prisma.statementDraft.upsert({
      where: { scanId },
      update: { body },
      create: { scanId, body },
    }),
    prisma.scan.update({
      where: { id: scanId },
      data: {
        status: incomplete ? "incomplete" : "completed",
        finishedAt: new Date(),
        checkoutRendered,
        pagesReached: reached.length,
        coverageWarning: diff.coverageShrunk,
        priorScanDate: previous?.finishedAt ?? previous?.startedAt ?? null,
        priorPagesReached: previous?.pagesReached ?? null,
        newIssueCount: diff.newCount,
        clearedIssueCount: diff.clearedCount,
        errorMessage: incomplete ? COPY.softError : null,
        softError: incomplete,
        uncheckedJson: JSON.stringify(unchecked),
        isShopify: flags.isShopify,
      },
    }),
  ]);
}

export async function createScanRecord(input: {
  storefrontUrl: string;
  moneyPages: MoneyPages;
}) {
  const url = canonicalSiteUrl(input.storefrontUrl);
  const site = await prisma.site.upsert({
    where: { url },
    update: {},
    create: {
      url,
      host: new URL(url).host.toLowerCase(),
    },
  });

  const targets = buildInitialTargets(url, input.moneyPages);
  const scan = await prisma.scan.create({
    data: {
      siteId: site.id,
      status: "queued",
      requestedUrlsJson: JSON.stringify({
        storefrontUrl: url,
        moneyPages: input.moneyPages,
      }),
      pages: {
        create: targets.map((t) => ({
          url: t.url,
          pathname: pathnameOf(t.url),
          pathKind: t.pathKind,
          status: "pending",
        })),
      },
    },
  });
  return scan;
}

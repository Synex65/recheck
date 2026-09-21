import { COPY } from "./copy";
import { formatScanDate } from "./format";
import type { ReachedPage, Severity, StatementInput } from "./types";
import { SEVERITIES } from "./types";

const KNOWN_GAPS_CAP = 80;

const CHECKOUT_WIDGET_UNCHECKED_RE =
  /payment (provider )?iframes?|shop pay|checkout widgets?|hosted payment/i;

export function checkoutUrlReached(pages: ReachedPage[]): boolean {
  return pages.some((page) => {
    if (page.pathKind === "checkout") return true;
    const hay = `${page.url}\n${page.pathname}`.toLowerCase();
    return (
      hay.includes("checkout.shopify") ||
      hay.includes("shop.app") ||
      /\/checkouts?\b/.test(hay) ||
      /\/kasse\b/.test(hay) ||
      /\/zahlung/.test(hay) ||
      /\/paiement/.test(hay)
    );
  });
}

export function uncheckedIncludesPaymentWidgets(items: string[]): boolean {
  return items.some((item) => CHECKOUT_WIDGET_UNCHECKED_RE.test(item));
}

export function countBySeverity(
  issues: Array<{ severity: Severity }>,
): Record<Severity, number> {
  const counts: Record<Severity, number> = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
  };
  for (const issue of issues) {
    counts[issue.severity] += 1;
  }
  return counts;
}

export function formatAutomatedFindingsLabel(
  counts: Record<Severity, number>,
): string {
  return SEVERITIES.map((s) => `${s}: ${counts[s]}`).join(" / ");
}

export function draftStatement(input: StatementInput): string {
  const lines: string[] = [];
  lines.push(COPY.statementTitle);
  lines.push("");

  const date = formatScanDate(input.scannedAt);
  const urls =
    input.reachedPages.length > 0
      ? input.reachedPages.map((p) => p.url).join(", ")
      : "no pages reached";
  let lastScan = `Last scan: ${date} — ${urls}`;
  if (!input.checkoutRendered) {
    lastScan += " (checkout not rendered)";
  }
  lines.push(lastScan);
  if (
    checkoutUrlReached(input.reachedPages) &&
    uncheckedIncludesPaymentWidgets(input.unchecked)
  ) {
    lines.push(COPY.checkoutWidgetsUnchecked);
  }
  lines.push("");

  lines.push(COPY.uncheckedHeading);
  for (const item of input.unchecked) {
    lines.push(`- ${item}`);
  }
  lines.push("");

  const counts = countBySeverity(input.issues);
  lines.push(
    `Automated findings still open: ${formatAutomatedFindingsLabel(counts)}`,
  );
  lines.push("");

  lines.push("Known gaps:");
  if (input.issues.length === 0) {
    lines.push(
      "- None from automated checks on pages we reached. Unchecked surfaces still apply; silence is not a pass.",
    );
  } else {
    const listed = input.issues.slice(0, KNOWN_GAPS_CAP);
    for (const issue of listed) {
      lines.push(
        `- ${issue.title} — ${issue.pathname} (${issue.stableId})`,
      );
    }
    const remaining = input.issues.length - listed.length;
    if (remaining > 0) {
      lines.push(
        `- and ${remaining} more automated findings; see the ranked issue list or CSV export`,
      );
    }
  }
  lines.push("");

  if (input.coverageShrunk && input.priorScanDate) {
    lines.push(COPY.coverageNote(formatScanDate(input.priorScanDate)));
    lines.push("");
  }

  lines.push(COPY.closingLine);
  return lines.join("\n");
}

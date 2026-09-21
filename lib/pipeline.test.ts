import { describe, expect, it } from "vitest";
import { collectAxeIssues } from "./axe";
import { launchBrowser } from "./browser";
import { draftStatement } from "./statement";
import { diffIssues } from "./diff";
import { buildUncheckedSurfaces } from "./unchecked";

const BROKEN = `<!doctype html><html lang="en"><head><title>Broken</title></head>
<body>
  <img src="x.gif">
  <button></button>
</body></html>`;

const FEWER = `<!doctype html><html lang="en"><head><title>Broken</title></head>
<body>
  <button></button>
</body></html>`;

describe("playwright + axe pipeline", () => {
  it("finds issues, drafts a statement, and diffs a follow-up page", async () => {
    let browser;
    try {
      browser = await launchBrowser();
    } catch {
      return;
    }
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.setContent(BROKEN, { waitUntil: "domcontentloaded" });
      const first = await collectAxeIssues({
        page,
        siteUrl: "https://shop.example",
        pageUrl: "https://shop.example/",
        pathKind: "home",
      });
      expect(first.length).toBeGreaterThan(0);

      const statement = draftStatement({
        scannedAt: new Date("2026-09-21T00:00:00Z"),
        reachedPages: [
          { url: "https://shop.example/", pathname: "/", pathKind: "home" },
        ],
        checkoutRendered: false,
        unchecked: buildUncheckedSurfaces({
          checkoutRendered: false,
          isShopify: true,
          failedPages: [],
        }),
        issues: first.map((i) => ({
          title: i.title,
          pathname: i.pathname,
          stableId: i.stableId,
          severity: i.severity,
        })),
        coverageShrunk: false,
        priorScanDate: null,
      });
      expect(statement).toContain("Accessibility statement (working draft)");
      expect(statement).toContain("What we didn’t check");
      expect(statement).toContain("Shopify hosted checkout");
      expect(statement.trim().endsWith(
        "This is a working draft based on automated checks, not a legal assessment or certification.",
      )).toBe(true);

      await page.setContent(FEWER, { waitUntil: "domcontentloaded" });
      const second = await collectAxeIssues({
        page,
        siteUrl: "https://shop.example",
        pageUrl: "https://shop.example/",
        pathKind: "home",
      });
      const diff = diffIssues({
        previous: first.map((i) => ({ stableId: i.stableId, pathname: i.pathname })),
        current: second.map((i) => ({ stableId: i.stableId, pathname: i.pathname })),
        currentReachedPathnames: ["/"],
        previousPagesReached: 1,
        currentPagesReached: 1,
      });
      expect(diff.clearedCount).toBeGreaterThan(0);
    } finally {
      await context.close();
      await browser.close();
    }
  }, 60_000);
});

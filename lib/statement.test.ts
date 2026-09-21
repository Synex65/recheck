import { describe, expect, it } from "vitest";
import { COPY } from "./copy";
import { BANNED_COPY_PATTERNS } from "./copy";
import { draftStatement, formatAutomatedFindingsLabel } from "./statement";

describe("accessibility statement", () => {
  const base = {
    scannedAt: new Date("2026-09-21T12:00:00Z"),
    reachedPages: [
      {
        url: "https://shop.example/",
        pathname: "/",
        pathKind: "home" as const,
      },
      {
        url: "https://shop.example/cart",
        pathname: "/cart",
        pathKind: "cart" as const,
      },
    ],
    checkoutRendered: false,
    unchecked: [
      "Checkout, especially Shopify hosted checkout / Shop Pay — not rendered in this scan",
      "PDFs and other downloadable documents",
      "Video, audio, and other timed media (captions, audio description)",
      "Third-party app widgets (reviews, chat, upsells, loyalty, live help, cookie tools)",
    ],
    issues: [
      {
        title: "Images must have alternate text",
        pathname: "/",
        stableId: "image-alt-aaa111bbbb",
        severity: "critical" as const,
      },
    ],
    coverageShrunk: true,
    priorScanDate: new Date("2026-09-14T12:00:00Z"),
  };

  it("wires the required template sections in order", () => {
    const body = draftStatement(base);
    const titleAt = body.indexOf(COPY.statementTitle);
    const uncheckedAt = body.indexOf(COPY.uncheckedHeading);
    const findingsAt = body.indexOf("Automated findings still open:");
    const gapsAt = body.indexOf("Known gaps:");
    const coverageAt = body.indexOf(
      "This scan reached fewer pages than 14 September 2026 — comparisons may understate issues.",
    );
    const closeAt = body.indexOf(COPY.closingLine);

    expect(titleAt).toBe(0);
    expect(uncheckedAt).toBeGreaterThan(titleAt);
    expect(findingsAt).toBeGreaterThan(uncheckedAt);
    expect(gapsAt).toBeGreaterThan(findingsAt);
    expect(coverageAt).toBeGreaterThan(gapsAt);
    expect(closeAt).toBeGreaterThan(coverageAt);
    expect(body.trimEnd().endsWith(COPY.closingLine)).toBe(true);
    expect(body).toContain("Last scan: 21 September 2026 — ");
    expect(body).toContain("(checkout not rendered)");
    expect(body).toContain("PDFs and other downloadable documents");
    expect(body).toContain("Third-party app widgets");
    expect(body).toContain(
      "Images must have alternate text — / (image-alt-aaa111bbbb)",
    );
    expect(body).toContain(
      "Automated findings still open: critical: 1 / serious: 0 / moderate: 0 / minor: 0",
    );
    expect(body).not.toContain("automated findings (");
  });

  it("never claims conformity and still lists unchecked when findings are zero", () => {
    const body = draftStatement({ ...base, issues: [], coverageShrunk: false });
    expect(body).toContain("silence is not a pass");
    expect(body).toContain(COPY.uncheckedHeading);
    expect(body).toContain("PDFs and other downloadable documents");
    expect(formatAutomatedFindingsLabel({
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
    })).toBe("critical: 0 / serious: 0 / moderate: 0 / minor: 0");
    expect(body).toContain(
      "Automated findings still open: critical: 0 / serious: 0 / moderate: 0 / minor: 0",
    );
    expect(body).not.toContain("automated findings (");
    for (const pattern of BANNED_COPY_PATTERNS) {
      expect(body).not.toMatch(pattern);
    }
    expect(body.toLowerCase()).not.toContain("non-compliance");
    expect(body.toLowerCase()).not.toContain("eaa-ready");
    expect(body.toLowerCase()).not.toContain("partially compliant");
  });
});

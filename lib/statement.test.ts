import { describe, expect, it } from "vitest";
import { COPY } from "./copy";
import { BANNED_COPY_PATTERNS } from "./copy";
import {
  checkoutUrlReached,
  draftStatement,
  formatAutomatedFindingsLabel,
  uncheckedIncludesPaymentWidgets,
} from "./statement";

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
    expect(body).not.toContain(COPY.checkoutWidgetsUnchecked);
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
    expect(body).not.toContain(COPY.checkoutWidgetsUnchecked);
  });

  it("adds a last-scan one-liner when checkout was reached but payment widgets remain unchecked", () => {
    const body = draftStatement({
      ...base,
      checkoutRendered: true,
      reachedPages: [
        ...base.reachedPages,
        {
          url: "https://shop.example/checkout",
          pathname: "/checkout",
          pathKind: "checkout",
        },
      ],
      unchecked: [
        "Payment provider iframes, Shop Pay, and other checkout widgets hosted by third parties",
        "PDFs and other downloadable documents",
      ],
    });

    const lastScanAt = body.indexOf("Last scan: 21 September 2026 — ");
    const noteAt = body.indexOf(COPY.checkoutWidgetsUnchecked);
    const uncheckedAt = body.indexOf(COPY.uncheckedHeading);
    const lines = body.split("\n");
    const lastScanLine = lines.findIndex((line) => line.startsWith("Last scan:"));

    expect(body).toContain("https://shop.example/checkout");
    expect(noteAt).toBeGreaterThan(lastScanAt);
    expect(uncheckedAt).toBeGreaterThan(noteAt);
    expect(lastScanLine).toBeGreaterThanOrEqual(0);
    expect(lines[lastScanLine + 1]).toBe(COPY.checkoutWidgetsUnchecked);
    expect(body).toContain(
      "Payment provider iframes, Shop Pay, and other checkout widgets hosted by third parties",
    );
    expect(body).not.toContain("(checkout not rendered)");
    for (const pattern of BANNED_COPY_PATTERNS) {
      expect(body).not.toMatch(pattern);
    }
  });

  it("does not add the payment-widget note unless checkout URL is in reached pages", () => {
    const body = draftStatement({
      ...base,
      checkoutRendered: true,
      unchecked: [
        "Payment provider iframes, Shop Pay, and other checkout widgets hosted by third parties",
      ],
    });
    expect(checkoutUrlReached(base.reachedPages)).toBe(false);
    expect(
      uncheckedIncludesPaymentWidgets([
        "Payment provider iframes, Shop Pay, and other checkout widgets hosted by third parties",
      ]),
    ).toBe(true);
    expect(body).not.toContain(COPY.checkoutWidgetsUnchecked);
  });

  it("does not add the payment-widget note when checkout was reached but widgets were not listed unchecked", () => {
    const body = draftStatement({
      ...base,
      checkoutRendered: true,
      reachedPages: [
        ...base.reachedPages,
        {
          url: "https://shop.example/checkouts/cn/abc",
          pathname: "/checkouts/cn/abc",
          pathKind: "checkout",
        },
      ],
      unchecked: [
        "PDFs and other downloadable documents",
        "Third-party app widgets (reviews, chat, upsells, loyalty, live help, cookie tools)",
      ],
    });
    expect(checkoutUrlReached([
      {
        url: "https://shop.example/checkouts/cn/abc",
        pathname: "/checkouts/cn/abc",
        pathKind: "checkout",
      },
    ])).toBe(true);
    expect(
      uncheckedIncludesPaymentWidgets([
        "PDFs and other downloadable documents",
      ]),
    ).toBe(false);
    expect(body).toContain("https://shop.example/checkouts/cn/abc");
    expect(body).not.toContain(COPY.checkoutWidgetsUnchecked);
  });
});

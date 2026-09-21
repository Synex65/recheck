import { describe, expect, it } from "vitest";
import { BANNED_COPY_PATTERNS, COPY } from "./copy";

describe("product copy", () => {
  it("uses the required empty, loading, and error strings", () => {
    expect(COPY.empty).toBe("No scan yet — paste a storefront URL to start.");
    expect(COPY.emptyNote).toBe("Silence is not a pass.");
    expect(COPY.loading).toBe(
      "Crawling pages… issues appear as we finish each path.",
    );
    expect(COPY.softError).toBe(
      "Scan incomplete — statement will only cover pages we reached.",
    );
    expect(COPY.hardError).toBe("Scan failed — no statement generated.");
    expect(COPY.partialFail("checkout")).toBe(
      "Couldn’t render checkout — listed under unchecked.",
    );
    expect(COPY.diffSummary(3, 2)).toBe("3 new, 2 cleared since last scan");
    expect(COPY.coverageNote("21 September 2026")).toBe(
      "This scan reached fewer pages than 21 September 2026 — comparisons may understate issues.",
    );
    expect(COPY.closingLine).toBe(
      "This is a working draft based on automated checks, not a legal assessment or certification.",
    );
    expect(COPY.checkoutWidgetsUnchecked).toBe(
      "Checkout URL reached — payment iframes / Shop Pay still unchecked.",
    );
  });

  it("does not use banned overlay or conformity phrasing", () => {
    const blob = [
      COPY.empty,
      COPY.emptyNote,
      COPY.loading,
      COPY.softError,
      COPY.hardError,
      COPY.zeroFindings,
      COPY.statementPending,
      COPY.coverageNote("21 September 2026"),
      COPY.diffSummary(3, 2),
      COPY.partialFail("checkout"),
      COPY.closingLine,
      COPY.statementTitle,
      COPY.uncheckedHeading,
      COPY.checkoutWidgetsUnchecked,
    ].join("\n");
    for (const pattern of BANNED_COPY_PATTERNS) {
      expect(blob).not.toMatch(pattern);
    }
    expect(blob.toLowerCase()).not.toContain("looking good");
    expect(blob.toLowerCase()).not.toContain("now compliant");
  });
});

import { describe, expect, it } from "vitest";
import { diffIssues } from "./diff";

describe("scan diffs", () => {
  it("does not treat first scan as a diff", () => {
    const diff = diffIssues({
      previous: null,
      current: [{ stableId: "a", pathname: "/" }],
      currentReachedPathnames: ["/"],
      previousPagesReached: null,
      currentPagesReached: 1,
    });
    expect(diff.newCount).toBe(0);
    expect(diff.clearedCount).toBe(0);
    expect(diff.coverageShrunk).toBe(false);
  });

  it("counts new and cleared only on pages reached this scan", () => {
    const diff = diffIssues({
      previous: [
        { stableId: "keep", pathname: "/" },
        { stableId: "gone", pathname: "/" },
        { stableId: "cart-only", pathname: "/cart" },
      ],
      current: [
        { stableId: "keep", pathname: "/" },
        { stableId: "fresh", pathname: "/" },
      ],
      currentReachedPathnames: ["/"],
      previousPagesReached: 2,
      currentPagesReached: 1,
    });
    expect(diff.newIds).toEqual(["fresh"]);
    expect(diff.clearedIds).toEqual(["gone"]);
    expect(diff.clearedIds).not.toContain("cart-only");
    expect(diff.coverageShrunk).toBe(true);
  });
});

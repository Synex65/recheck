import { describe, expect, it } from "vitest";
import { compareIssues, rankScore } from "./rank";

describe("ranking", () => {
  it("ranks checkout critical above home minor", () => {
    expect(rankScore("critical", "checkout")).toBeGreaterThan(
      rankScore("minor", "home"),
    );
    expect(rankScore("serious", "cart")).toBeGreaterThan(rankScore("serious", "plp"));
  });

  it("sorts by score then path criticality", () => {
    const issues = [
      {
        rankScore: rankScore("serious", "home"),
        severity: "serious" as const,
        pathKind: "home" as const,
        title: "B",
      },
      {
        rankScore: rankScore("serious", "checkout"),
        severity: "serious" as const,
        pathKind: "checkout" as const,
        title: "A",
      },
    ];
    const sorted = [...issues].sort(compareIssues);
    expect(sorted[0].pathKind).toBe("checkout");
  });
});

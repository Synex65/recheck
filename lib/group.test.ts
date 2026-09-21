import { describe, expect, it } from "vitest";
import { groupIssues } from "./group";
import type { IssueDTO } from "./serialize";

function issue(partial: Partial<IssueDTO> & Pick<IssueDTO, "ruleId" | "rankScore">): IssueDTO {
  return {
    id: partial.id ?? partial.ruleId,
    stableId: partial.stableId ?? `${partial.ruleId}-1`,
    ruleId: partial.ruleId,
    title: partial.title ?? partial.ruleId,
    description: "",
    helpUrl: "",
    severity: partial.severity ?? "serious",
    selector: "img",
    htmlSnippet: "",
    rankScore: partial.rankScore,
    pathname: partial.pathname ?? "/",
    pathKind: partial.pathKind ?? "home",
    url: "https://s.example/",
  };
}

describe("groupIssues", () => {
  it("groups by rule and keeps checkout instances first", () => {
    const groups = groupIssues([
      issue({ ruleId: "image-alt", title: "Images", rankScore: 416, pathKind: "home" }),
      issue({
        ruleId: "button-name",
        title: "Buttons",
        rankScore: 450,
        pathKind: "checkout",
        severity: "critical",
        stableId: "button-name-a",
      }),
      issue({
        ruleId: "button-name",
        title: "Buttons",
        rankScore: 430,
        pathKind: "pdp",
        severity: "critical",
        stableId: "button-name-b",
      }),
    ]);
    expect(groups[0].ruleId).toBe("button-name");
    expect(groups[0].count).toBe(2);
    expect(groups[0].items[0].pathKind).toBe("checkout");
  });
});

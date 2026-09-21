import { compareIssues } from "./rank";
import type { IssueDTO } from "./serialize";

export type IssueGroup = {
  ruleId: string;
  title: string;
  severity: IssueDTO["severity"];
  rankScore: number;
  count: number;
  items: IssueDTO[];
};

export function groupIssues(issues: IssueDTO[]): IssueGroup[] {
  const map = new Map<string, IssueDTO[]>();
  for (const issue of issues) {
    const list = map.get(issue.ruleId) ?? [];
    list.push(issue);
    map.set(issue.ruleId, list);
  }
  return [...map.values()]
    .map((items) => {
      const sorted = [...items].sort(compareIssues);
      const top = sorted[0];
      return {
        ruleId: top.ruleId,
        title: top.title,
        severity: top.severity,
        rankScore: top.rankScore,
        count: sorted.length,
        items: sorted,
      };
    })
    .sort((a, b) => b.rankScore - a.rankScore || a.title.localeCompare(b.title));
}

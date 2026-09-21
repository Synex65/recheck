import type { IssueDTO } from "./serialize";

function csvEscape(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function issuesToCsv(issues: IssueDTO[]): string {
  const header = [
    "stableId",
    "severity",
    "title",
    "pathKind",
    "pathname",
    "url",
    "ruleId",
    "helpUrl",
    "selector",
    "rankScore",
  ];
  const rows = issues.map((issue) =>
    [
      issue.stableId,
      issue.severity,
      issue.title,
      issue.pathKind,
      issue.pathname,
      issue.url,
      issue.ruleId,
      issue.helpUrl,
      issue.selector,
      issue.rankScore,
    ]
      .map(csvEscape)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n") + "\n";
}

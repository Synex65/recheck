"use client";

import type { IssueDTO } from "@/lib/serialize";

const SEVERITY_CLASS: Record<string, string> = {
  critical: "text-critical",
  serious: "text-serious",
  moderate: "text-moderate",
  minor: "text-minor",
};

export function IssueList({
  issues,
  zeroMessage,
  sharePath,
  csvPath,
}: {
  issues: IssueDTO[];
  zeroMessage: string;
  sharePath: string;
  csvPath: string;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl">Ranked automated findings</h2>
          <p className="mt-1 text-sm text-muted">
            Ordered by severity and path criticality (checkout / cart / PDP first).
            Not a WCAG dump, and not a pass/fail certificate.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <a href={csvPath} className="border border-rule px-3 py-2 hover:bg-card">
            Export CSV
          </a>
          <a href={sharePath} className="border border-rule px-3 py-2 hover:bg-card">
            Shareable list
          </a>
        </div>
      </div>

      {issues.length === 0 ? (
        <p className="border border-rule bg-card px-4 py-4 text-sm">{zeroMessage}</p>
      ) : (
        <ol className="divide-y divide-rule border border-rule bg-card">
          {issues.slice(0, 60).map((issue, index) => (
            <li key={issue.id} className="grid gap-2 px-4 py-3 md:grid-cols-[7rem_1fr_auto]">
              <div>
                <span className="font-mono text-xs text-muted">{index + 1}</span>
                <div className={`text-sm font-medium ${SEVERITY_CLASS[issue.severity]}`}>
                  {issue.severity}
                </div>
                <div className="text-xs uppercase tracking-wide text-muted">
                  {issue.pathKind}
                </div>
              </div>
              <div>
                <p className="font-medium">{issue.title}</p>
                <p className="mt-1 text-sm text-muted">
                  {issue.pathname}
                  <span className="mx-2 text-rule">·</span>
                  <span className="font-mono text-xs">{issue.stableId}</span>
                </p>
              </div>
              <a
                href={issue.url}
                className="text-sm text-navy underline-offset-2 hover:underline"
              >
                Open path
              </a>
            </li>
          ))}
        </ol>
      )}
      {issues.length > 60 ? (
        <p className="text-sm text-muted">
          Showing 60 of {issues.length} by rank. Export CSV for the full list.
        </p>
      ) : null}
    </section>
  );
}

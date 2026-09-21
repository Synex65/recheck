"use client";

import { useState } from "react";
import { groupIssues } from "@/lib/group";
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
  isRunning = false,
}: {
  issues: IssueDTO[];
  zeroMessage: string;
  sharePath: string;
  csvPath: string;
  isRunning?: boolean;
}) {
  const groups = groupIssues(issues);
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl">Ranked automated findings</h2>
          <p className="mt-1 text-sm text-muted">
            Grouped by rule, ordered by severity and path criticality (checkout /
            cart / PDP first). Not a WCAG dump, and not a pass/fail certificate.
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
        isRunning ? null : (
          <p className="border border-rule bg-card px-4 py-4 text-sm">{zeroMessage}</p>
        )
      ) : (
        <ol className="divide-y divide-rule border border-rule bg-card">
          {groups.map((group, index) => (
            <GroupRow key={group.ruleId} group={group} index={index} />
          ))}
        </ol>
      )}
    </section>
  );
}

function GroupRow({
  group,
  index,
}: {
  group: ReturnType<typeof groupIssues>[number];
  index: number;
}) {
  const extra = group.items.length - 3;
  const [open, setOpen] = useState(false);
  const shown = open ? group.items : group.items.slice(0, 3);

  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <span className="font-mono text-xs text-muted">{index + 1}</span>
          <h3 className="font-medium">{group.title}</h3>
        </div>
        <div className="text-sm">
          <span className={`font-medium ${SEVERITY_CLASS[group.severity]}`}>
            {group.severity}
          </span>
          <span className="mx-2 text-muted">·</span>
          <span className="text-muted">
            {group.count} {group.count === 1 ? "instance" : "instances"}
          </span>
        </div>
      </div>
      <ul className="mt-2 space-y-1 text-sm">
        {shown.map((issue) => (
          <li key={issue.id} className="flex flex-wrap items-baseline gap-x-3">
            <span className="uppercase tracking-wide text-muted">{issue.pathKind}</span>
            <span>{issue.pathname}</span>
            <span className="font-mono text-xs">{issue.stableId}</span>
            <a href={issue.url} className="text-navy underline-offset-2 hover:underline">
              Open
            </a>
          </li>
        ))}
      </ul>
      {extra > 0 ? (
        <button
          type="button"
          className="mt-2 text-sm text-navy underline-offset-2 hover:underline"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Show fewer" : `${extra} more on other paths`}
        </button>
      ) : null}
    </li>
  );
}

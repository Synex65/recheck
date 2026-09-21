"use client";

import { useState } from "react";
import { COPY } from "@/lib/copy";
import { groupIssues } from "@/lib/group";
import type { IssueDTO } from "@/lib/serialize";

export function IssueList({
  issues,
  zeroMessage,
  sharePath,
  csvPath,
  unchecked = [],
  isRunning = false,
}: {
  issues: IssueDTO[];
  zeroMessage: string;
  sharePath: string;
  csvPath: string;
  unchecked?: string[];
  isRunning?: boolean;
}) {
  const groups = groupIssues(issues);
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold tracking-tight">Ranked automated findings</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Grouped by rule, ordered by severity and path criticality (checkout /
            cart / PDP first). Not a WCAG dump, and not a pass/fail certificate.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <a href={csvPath} className="btn btn-secondary btn-sm">
            Export CSV
          </a>
          <a href={sharePath} className="btn btn-secondary btn-sm">
            Shareable list
          </a>
        </div>
      </div>

      {issues.length === 0 ? (
        isRunning ? null : (
          <div
            className={
              unchecked.length > 0 ? "grid gap-4 md:grid-cols-2 md:items-start" : undefined
            }
          >
            {unchecked.length > 0 ? (
              <div className="panel px-4 py-4 sm:px-5">
                <h3 className="text-lg font-semibold">{COPY.uncheckedHeading}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6">
                  {unchecked.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="unchecked-box" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="panel px-4 py-4 text-sm leading-6 sm:px-5">{zeroMessage}</p>
          </div>
        )
      ) : (
        <ol className="panel divide-y divide-rule">
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
    <li className="px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0">
          <span className="font-mono text-xs text-muted">{index + 1}</span>
          <h3 className="font-semibold">{group.title}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="severity-tag">{group.severity}</span>
          <span className="text-muted">
            {group.count} {group.count === 1 ? "instance" : "instances"}
          </span>
        </div>
      </div>
      <ul className="mt-2 space-y-1.5 text-sm">
        {shown.map((issue) => (
          <li key={issue.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              {issue.pathKind}
            </span>
            <span className="break-words">{issue.pathname}</span>
            <span className="font-mono text-xs text-muted">{issue.stableId}</span>
            <a href={issue.url} className="link-action">
              Open
            </a>
          </li>
        ))}
      </ul>
      {extra > 0 ? (
        <button
          type="button"
          className="link-action mt-2 text-sm"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Show fewer" : `${extra} more on other paths`}
        </button>
      ) : null}
    </li>
  );
}

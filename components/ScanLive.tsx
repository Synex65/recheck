"use client";

import { useEffect, useState } from "react";
import { COPY } from "@/lib/copy";
import type { ScanDTO } from "@/lib/serialize";
import { IssueList } from "./IssueList";
import { StatementView } from "./StatementView";

export function ScanLive({ initial }: { initial: ScanDTO }) {
  const [scan, setScan] = useState(initial);

  useEffect(() => {
    if (scan.status !== "queued" && scan.status !== "running") return;
    const timer = setInterval(async () => {
      const res = await fetch(`/api/scans/${scan.id}`, { cache: "no-store" });
      if (!res.ok) return;
      const next = (await res.json()) as ScanDTO;
      setScan(next);
    }, 1000);
    return () => clearInterval(timer);
  }, [scan.id, scan.status]);

  const running = scan.status === "queued" || scan.status === "running";
  const failedPages = scan.pages.filter((p) => p.status === "failed");

  return (
    <div className="space-y-8">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Scan</p>
          <span className="status-pill">{scan.status}</span>
        </div>
        <h1 className="mt-2 break-words text-3xl font-bold tracking-tight md:text-4xl">
          {scan.siteUrl}
        </h1>
      </header>

      {running ? (
        <p className="note" role="status">
          <span className="inline-flex items-start gap-2.5">
            <span className="pulse-dot mt-1.5" aria-hidden="true" />
            <span>{scan.loadingMessage}</span>
          </span>
        </p>
      ) : null}

      {scan.status === "failed" ? (
        <p className="note note-error" role="alert">
          {COPY.hardError}
        </p>
      ) : null}

      {scan.status === "incomplete" ? (
        <p className="note" role="status">
          {COPY.softError}
        </p>
      ) : null}

      {failedPages.map((page) => (
        <p key={page.id} className="note text-sm" role="status">
          {page.failReason || COPY.partialFail(page.pathKind)}
        </p>
      ))}

      {scan.diffSummary ? <p className="note text-sm">{scan.diffSummary}</p> : null}

      {scan.coverageNote ? <p className="note text-sm">{scan.coverageNote}</p> : null}

      <section>
        <h2 className="text-xl font-bold tracking-tight">Paths</h2>
        <ul className="panel mt-3 divide-y divide-rule">
          {scan.pages.map((page) => (
            <li
              key={page.id}
              className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm"
            >
              <span className="min-w-0 break-words">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {page.pathKind}
                </span>
                <span className="mx-2 text-rule">·</span>
                {page.pathname}
              </span>
              <span className="status-pill">{page.status}</span>
            </li>
          ))}
        </ul>
      </section>

      <IssueList
        issues={scan.issues}
        zeroMessage={scan.zeroFindingsMessage}
        sharePath={scan.sharePath}
        csvPath={scan.csvPath}
        unchecked={scan.unchecked}
        isRunning={running}
      />

      {scan.status === "failed" ? (
        <p className="text-sm text-muted">{COPY.hardError}</p>
      ) : (
        <StatementView body={scan.statement} />
      )}
    </div>
  );
}

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
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Scan</p>
        <h1 className="mt-1 font-serif text-3xl md:text-4xl">{scan.siteUrl}</h1>
      </div>

      {running ? (
        <p className="border border-rule bg-banner px-4 py-3" role="status">
          {scan.loadingMessage}
        </p>
      ) : null}

      {scan.status === "failed" ? (
        <p className="border border-fail/40 bg-fail/5 px-4 py-3 text-fail" role="alert">
          {COPY.hardError}
        </p>
      ) : null}

      {scan.status === "incomplete" ? (
        <p className="border border-rule bg-banner px-4 py-3" role="status">
          {COPY.softError}
        </p>
      ) : null}

      {failedPages.map((page) => (
        <p
          key={page.id}
          className="border border-rule bg-banner px-4 py-3 text-sm"
          role="status"
        >
          {page.failReason || COPY.partialFail(page.pathKind)}
        </p>
      ))}

      {scan.diffSummary ? (
        <p className="text-sm">
          {scan.diffSummary}
        </p>
      ) : null}

      {scan.coverageNote ? (
        <p className="border border-rule bg-banner px-4 py-3 text-sm">
          {scan.coverageNote}
        </p>
      ) : null}

      <section>
        <h2 className="font-serif text-2xl">Paths</h2>
        <ul className="mt-3 divide-y divide-rule border border-rule bg-card">
          {scan.pages.map((page) => (
            <li key={page.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2 text-sm">
              <span>
                <span className="uppercase tracking-wide text-muted">{page.pathKind}</span>
                <span className="mx-2 text-rule">·</span>
                {page.pathname}
              </span>
              <span className="text-muted">{page.status}</span>
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

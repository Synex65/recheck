"use client";

import { useState } from "react";
import { COPY } from "@/lib/copy";

export function StatementView({ body }: { body: string | null }) {
  const [copied, setCopied] = useState(false);

  if (!body) {
    return (
      <section className="panel px-5 py-5 sm:px-6">
        <h2 className="text-xl font-bold tracking-tight">{COPY.statementTitle}</h2>
        <p className="mt-3 rounded-xl bg-mist px-4 py-4 text-sm leading-6 text-muted">
          {COPY.statementPending}
        </p>
      </section>
    );
  }

  async function copy() {
    await navigator.clipboard.writeText(body ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="panel px-5 py-5 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight">{COPY.statementTitle}</h2>
        <button type="button" onClick={copy} className="btn btn-secondary btn-sm">
          {copied ? "Copied" : "Copy draft"}
        </button>
      </div>
      <pre className="mt-4 overflow-auto whitespace-pre-wrap rounded-xl bg-mist p-4 font-sans text-sm leading-7 text-ink">
        {body}
      </pre>
    </section>
  );
}

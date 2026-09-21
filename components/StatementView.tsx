"use client";

import { useState } from "react";
import { COPY } from "@/lib/copy";

export function StatementView({ body }: { body: string | null }) {
  const [copied, setCopied] = useState(false);

  if (!body) {
    return (
      <section className="border border-rule bg-card px-5 py-5">
        <h2 className="font-serif text-2xl">{COPY.statementTitle}</h2>
        <p className="mt-3 text-sm text-muted">{COPY.statementPending}</p>
      </section>
    );
  }

  async function copy() {
    await navigator.clipboard.writeText(body ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="border border-rule bg-card px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-serif text-2xl">{COPY.statementTitle}</h2>
        <button
          type="button"
          onClick={copy}
          className="border border-rule px-3 py-1.5 text-sm hover:bg-paper"
        >
          {copied ? "Copied" : "Copy draft"}
        </button>
      </div>
      <pre className="mt-4 overflow-auto whitespace-pre-wrap font-sans text-sm leading-6">
        {body}
      </pre>
    </section>
  );
}

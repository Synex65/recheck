import { ScanForm } from "@/components/ScanForm";
import { COPY } from "@/lib/copy";
import { MARKETING } from "@/lib/marketing";
import Link from "next/link";

export type RecentScan = {
  id: string;
  url: string;
  status: string;
  findings: number;
};

export function HomeView({ scans }: { scans: RecentScan[] }) {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 pb-8 pt-8 text-center md:pt-20">
        <p className="badge">{MARKETING.badge}</p>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-[-0.035em] text-ink sm:text-5xl md:text-6xl">
          {MARKETING.headlineLead}
          <span className="mt-1 block">{MARKETING.headlineRest}</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted md:text-lg">
          {MARKETING.subcopy}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="#scan" className="btn btn-primary w-full sm:w-auto">
            {MARKETING.primaryCta}
          </a>
          <a href="#how" className="btn btn-secondary w-full sm:w-auto">
            {MARKETING.secondaryCta}
          </a>
        </div>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-ink">
          {MARKETING.trust.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-ink/40" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto grid max-w-6xl items-start gap-5 px-5 pb-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.72fr)]">
        <div id="scan" className="panel scroll-mt-24 p-5 sm:p-7">
          <h2 className="text-xl font-bold tracking-tight">{MARKETING.formTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{MARKETING.formLede}</p>
          <div className="mt-6">
            <ScanForm emptyMessage={COPY.empty} />
          </div>
        </div>
        <aside className="panel p-5 sm:p-6">
          <h2 className="text-xl font-bold tracking-tight">{MARKETING.recentTitle}</h2>
          {scans.length === 0 ? (
            <p className="mt-4 rounded-xl bg-mist px-4 py-4 text-sm leading-6 text-muted">
              {COPY.empty}
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-rule">
              {scans.map((scan) => (
                <li key={scan.id}>
                  <Link
                    href={`/scans/${scan.id}`}
                    className="block rounded-xl px-2 py-3 no-underline hover:bg-mist"
                  >
                    <span className="block break-words text-sm font-medium">{scan.url}</span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="status-pill">{scan.status}</span>
                      <span>{scan.findings} automated findings</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>

      <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {MARKETING.howKicker}
        </p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.03em]">
          {MARKETING.howTitle}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{MARKETING.howLede}</p>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MARKETING.steps.map((step) => (
            <li key={step.n} className="panel p-5">
              <p className="font-mono text-xs text-muted">{step.n}</p>
              <h3 className="mt-2 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="panel p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                {MARKETING.honestKicker}
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.03em]">
                {MARKETING.honestTitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">{MARKETING.honestLede}</p>
            </div>
            <ul className="space-y-3">
              {MARKETING.honestPoints.map((point) => (
                <li key={point} className="rounded-2xl bg-mist px-4 py-3 text-sm leading-6">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

import { COPY } from "@/lib/copy";
import { prisma } from "@/lib/db";
import { ScanForm } from "@/components/ScanForm";
import { SiteHeader } from "@/components/SiteHeader";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const scans = await prisma.scan.findMany({
    orderBy: { startedAt: "desc" },
    take: 8,
    include: { site: true, _count: { select: { issues: true } } },
  });

  return (
    <div className="min-h-full">
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-12 px-5 py-12 lg:grid-cols-[1.2fr_0.8fr]">
        <section>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            EAA / BFSG working drafts
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
            Re-check the shop. Draft an honest statement.
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Recheck crawls money pages, runs axe-core on rendered HTML, and ranks
            what it found. It will not say you meet EAA or BFSG. It will not sell
            an overlay. Silence is not a pass.
          </p>
          <div className="mt-10">
            <ScanForm emptyMessage={COPY.empty} />
          </div>
        </section>

        <aside className="space-y-6">
          <section className="border border-rule bg-card px-5 py-5">
            <h2 className="font-serif text-2xl">What v1 does</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6">
              <li>Paste a storefront URL and optional money pages.</li>
              <li>Crawl with a headless browser and run axe-core.</li>
              <li>Rank issues by severity and path criticality.</li>
              <li>Export CSV or share a list with stable IDs.</li>
              <li>Draft a statement from open gaps and unchecked surfaces.</li>
              <li>Re-scan to see new vs cleared since last time.</li>
            </ol>
          </section>

          <section className="border border-rule px-5 py-5">
            <h2 className="font-serif text-2xl">Recent scans</h2>
            {scans.length === 0 ? (
              <p className="mt-3 text-sm text-muted">{COPY.empty}</p>
            ) : (
              <ul className="mt-4 divide-y divide-rule">
                {scans.map((scan) => (
                  <li key={scan.id} className="py-3">
                    <Link href={`/scans/${scan.id}`} className="hover:underline">
                      <span className="block text-sm">{scan.site.url}</span>
                      <span className="text-xs text-muted">
                        {scan.status}
                        <span className="mx-2">·</span>
                        {scan._count.issues} automated findings
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </main>
      <footer className="mx-auto max-w-6xl px-5 pb-12 text-sm text-muted">
        Recheck does not declare EAA/BFSG conformity, does not certify WCAG, and
        does not apply overlay “fixes”. This is a working draft tool.
      </footer>
    </div>
  );
}

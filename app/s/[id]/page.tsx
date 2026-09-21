import { AppShell } from "@/components/AppShell";
import { IssueList } from "@/components/IssueList";
import { prisma } from "@/lib/db";
import { serializeScan } from "@/lib/serialize";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scan = await prisma.scan.findUnique({
    where: { id },
    include: {
      site: true,
      pages: true,
      issues: { include: { page: true } },
      statement: true,
    },
  });
  if (!scan) notFound();
  const dto = serializeScan(scan);

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl space-y-8 px-5 py-10">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Shareable issue list
          </p>
          <h1 className="mt-2 break-words text-3xl font-bold tracking-tight">{dto.siteUrl}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Stable IDs stay the same across re-scans of the same path and selector.
            Mark-fixed is not in v1 — use the CSV if you need a working list.
          </p>
          <p className="mt-3 text-sm">
            <Link href={`/scans/${dto.id}`} className="link-action">
              Full scan and statement draft
            </Link>
          </p>
        </header>
        <IssueList
          issues={dto.issues}
          zeroMessage={dto.zeroFindingsMessage}
          sharePath={dto.sharePath}
          csvPath={dto.csvPath}
          unchecked={dto.unchecked}
        />
      </main>
    </AppShell>
  );
}

import { ScanLive } from "@/components/ScanLive";
import { SiteHeader } from "@/components/SiteHeader";
import { prisma } from "@/lib/db";
import { enqueueScan } from "@/lib/scan-runner";
import { serializeScan } from "@/lib/serialize";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ScanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scan = await prisma.scan.findUnique({
    where: { id },
    include: {
      site: true,
      pages: { orderBy: { id: "asc" } },
      issues: { include: { page: true } },
      statement: true,
    },
  });
  if (!scan) notFound();
  if (scan.status === "queued") enqueueScan(scan.id);

  return (
    <div className="min-h-full">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <ScanLive initial={serializeScan(scan)} />
      </main>
    </div>
  );
}

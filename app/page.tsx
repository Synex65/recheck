import { AppShell } from "@/components/AppShell";
import { HomeView, type RecentScan } from "@/components/HomeView";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const scans = await prisma.scan.findMany({
    orderBy: { startedAt: "desc" },
    take: 8,
    include: { site: true, _count: { select: { issues: true } } },
  });

  const recent: RecentScan[] = scans.map((scan) => ({
    id: scan.id,
    url: scan.site.url,
    status: scan.status,
    findings: scan._count.issues,
  }));

  return (
    <AppShell>
      <HomeView scans={recent} />
    </AppShell>
  );
}

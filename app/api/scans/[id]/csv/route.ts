import { issuesToCsv } from "@/lib/csv";
import { prisma } from "@/lib/db";
import { serializeScan } from "@/lib/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const scan = await prisma.scan.findUnique({
    where: { id },
    include: {
      site: true,
      pages: true,
      issues: { include: { page: true } },
      statement: true,
    },
  });
  if (!scan) {
    return new Response("Scan not found.", { status: 404 });
  }
  const dto = serializeScan(scan);
  const csv = issuesToCsv(dto.issues);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="recheck-${id}.csv"`,
    },
  });
}

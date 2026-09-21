import { prisma } from "@/lib/db";
import { enqueueScan } from "@/lib/scan-runner";
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
      pages: { orderBy: { id: "asc" } },
      issues: { include: { page: true } },
      statement: true,
    },
  });
  if (!scan) {
    return Response.json({ error: "Scan not found." }, { status: 404 });
  }
  if (scan.status === "queued") {
    enqueueScan(scan.id);
  }
  return Response.json(serializeScan(scan));
}

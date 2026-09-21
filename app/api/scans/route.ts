import { after } from "next/server";
import { createScanRecord, enqueueScan } from "@/lib/scan-runner";
import { scanRequestSchema } from "@/lib/schema";
import { moneyPagesFromUnknown } from "@/lib/urls";
import { parseHttpUrl } from "@/lib/urls";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Expected JSON body." }, { status: 400 });
  }

  const parsed = scanRequestSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Storefront URL is required." }, { status: 400 });
  }

  try {
    parseHttpUrl(parsed.data.storefrontUrl);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Invalid URL." },
      { status: 400 },
    );
  }

  const moneyPages = moneyPagesFromUnknown(parsed.data.moneyPages);
  try {
    const scan = await createScanRecord({
      storefrontUrl: parsed.data.storefrontUrl,
      moneyPages,
    });
    after(() => {
      enqueueScan(scan.id);
    });
    enqueueScan(scan.id);
    return Response.json({ id: scan.id });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not start scan." },
      { status: 400 },
    );
  }
}

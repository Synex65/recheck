const BASE = process.env.BASE_URL || "http://localhost:3000";

type ScanDTO = {
  id: string;
  status: string;
  issues: Array<{ stableId: string; title: string; pathname: string }>;
  statement: string | null;
  pagesReached: number;
  coverageWarning: boolean;
  coverageNote: string | null;
  diffSummary: string | null;
  newIssueCount: number;
  clearedIssueCount: number;
  checkoutRendered: boolean;
  pages: Array<{ pathKind: string; status: string; failReason: string | null }>;
  errorMessage: string | null;
};

async function waitForServer(): Promise<void> {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE, { redirect: "manual" });
      if (res.status < 500) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server not reachable at ${BASE}`);
}

async function startScan(body: unknown): Promise<string> {
  const res = await fetch(`${BASE}/api/scans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { id?: string; error?: string };
  if (!res.ok || !data.id) {
    throw new Error(data.error || `POST /api/scans failed (${res.status})`);
  }
  return data.id;
}

async function poll(id: string): Promise<ScanDTO> {
  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    const res = await fetch(`${BASE}/api/scans/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`GET scan failed (${res.status})`);
    const scan = (await res.json()) as ScanDTO;
    if (["completed", "incomplete", "failed"].includes(scan.status)) return scan;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Timed out waiting for scan");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  await waitForServer();
  const money = {
    home: `${BASE}/demo-shop`,
    plp: `${BASE}/demo-shop/products`,
    pdp: `${BASE}/demo-shop/products/linen-overshirt`,
    cart: `${BASE}/demo-shop/cart`,
    checkout: `${BASE}/demo-shop/checkout`,
  };

  const firstId = await startScan({
    storefrontUrl: `${BASE}/demo-shop`,
    moneyPages: money,
  });
  const first = await poll(firstId);
  assert(first.status !== "failed", `First scan failed: ${first.errorMessage}`);
  assert(first.statement, "First scan produced no statement");
  assert(
    first.statement.startsWith("Accessibility statement (working draft)"),
    "Statement title mismatch",
  );
  assert(first.statement.includes("What we didn’t check"), "Missing unchecked heading");
  assert(first.statement.includes("PDFs and other downloadable documents"), "Missing PDFs");
  assert(first.statement.includes("Third-party app widgets"), "Missing third-party widgets");
  assert(
    /Automated findings still open: critical: \d+ \/ serious: \d+ \/ moderate: \d+ \/ minor: \d+/.test(
      first.statement,
    ),
    "Findings label mismatch",
  );
  assert(
    !first.statement.includes("Automated findings still open: automated findings ("),
    "Doubled findings label",
  );
  assert(first.statement.includes("Known gaps:"), "Missing known gaps");
  assert(
    first.statement.trim().endsWith(
      "This is a working draft based on automated checks, not a legal assessment or certification.",
    ),
    "Closing line mismatch",
  );
  assert(
    !/EAA-ready|WCAG-passed|partially compliant|high risk of non-compliance/i.test(
      first.statement,
    ),
    "Banned phrasing in statement",
  );
  assert(first.issues.length > 0, "Expected automated findings on the demo shop");
  assert(first.checkoutRendered, "Demo checkout should have rendered");

  const csv = await fetch(`${BASE}/api/scans/${firstId}/csv`);
  assert(csv.ok, "CSV export failed");
  const csvText = await csv.text();
  assert(csvText.startsWith("stableId,"), "CSV header mismatch");

  const secondId = await startScan({
    storefrontUrl: `${BASE}/demo-shop`,
    moneyPages: {
      home: money.home,
      plp: money.plp,
    },
  });
  const second = await poll(secondId);
  assert(second.status !== "failed", `Second scan failed: ${second.errorMessage}`);
  assert(second.diffSummary, "Second scan missing diff summary");
  assert(
    second.diffSummary.includes("cleared since last scan"),
    "Diff copy mismatch",
  );
  assert(!second.diffSummary.includes("compliant"), "Banned diff copy");
  assert(second.coverageWarning, "Expected coverage-shrink warning");
  assert(second.coverageNote, "Missing coverage note");
  assert(
    second.statement?.includes("comparisons may understate issues") ?? false,
    "Statement missing coverage note",
  );
  assert(
    second.pagesReached < first.pagesReached,
    "Second scan should reach fewer pages",
  );

  const blockedId = await startScan({
    storefrontUrl: `${BASE}/demo-shop`,
    moneyPages: {
      home: money.home,
      checkout: `${BASE}/demo-shop/checkout-unavailable`,
    },
  });
  const blocked = await poll(blockedId);
  const checkoutPage = blocked.pages.find((p) => p.pathKind === "checkout");
  assert(checkoutPage?.status === "failed", "Unavailable checkout should fail");
  assert(
    checkoutPage?.failReason?.includes("Couldn’t render checkout"),
    "Partial-fail copy mismatch",
  );
  assert(blocked.statement, "Incomplete scan should still draft a statement");
  assert(
    blocked.statement?.includes("checkout not rendered") ?? false,
    "Statement should note checkout was not rendered",
  );

  console.log("verify-core-loop: ok");
  console.log(`  first=${firstId} findings=${first.issues.length} pages=${first.pagesReached}`);
  console.log(
    `  second=${secondId} ${second.diffSummary} coverageWarning=${second.coverageWarning}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

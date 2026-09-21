import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = process.env.SCREENSHOT_DIR || "/opt/cursor/artifacts";

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    headless: false,
    slowMo: 200,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(120_000);

  await page.goto(BASE);
  await page.getByRole("heading", { name: /Re-check the shop/i }).waitFor();
  await page.getByText("No scan yet — paste a storefront URL to start.").first().waitFor();
  await page.screenshot({
    path: path.join(OUT, "recheck_home_form.png"),
    fullPage: true,
  });

  await page.getByRole("button", { name: "Fill local demo shop" }).click();
  await page.getByRole("button", { name: "Start scan" }).click();
  await page.waitForURL(/\/scans\//);
  await page.getByText("Crawling pages… issues appear as we finish each path.").waitFor();
  await page.screenshot({
    path: path.join(OUT, "recheck_scan_crawling.png"),
  });

  await page.getByRole("heading", { name: "Ranked automated findings" }).waitFor({
    timeout: 120_000,
  });
  await page.getByRole("heading", { name: "Accessibility statement (working draft)" }).waitFor();
  await page.getByText(
    "This is a working draft based on automated checks, not a legal assessment or certification.",
  ).waitFor();
  await page.screenshot({
    path: path.join(OUT, "recheck_scan_results.png"),
    fullPage: true,
  });

  const statementHeading = page.getByRole("heading", {
    name: "Accessibility statement (working draft)",
  });
  await statementHeading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(OUT, "recheck_statement_template.png"),
  });

  await page.getByRole("link", { name: "Shareable list" }).first().click();
  await page.waitForURL(/\/s\//);
  await page.getByText("Shareable issue list").waitFor();
  await page.screenshot({
    path: path.join(OUT, "recheck_shareable_issue_list.png"),
    fullPage: true,
  });

  const second = await fetch(`${BASE}/api/scans`, { method: "GET" }).catch(() => null);
  void second;
  // Coverage-shrink scan from verify-core-loop
  const known = process.env.DIFF_SCAN_ID;
  if (known) {
    await page.goto(`${BASE}/scans/${known}`);
    await page.getByText("cleared since last scan").first().waitFor();
    await page.getByText("comparisons may understate issues").first().waitFor();
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(OUT, "recheck_rescan_coverage_warning.png"),
      fullPage: true,
    });
  }

  await page.waitForTimeout(1200);

  await context.close();
  await browser.close();
  console.log("ui-walkthrough: ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

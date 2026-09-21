import type { Browser, Page } from "playwright";

export async function launchBrowser(): Promise<Browser> {
  const { chromium } = await import("playwright");
  return chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });
}

const COOKIE_SELECTORS = [
  "#onetrust-accept-btn-handler",
  "button#accept-all",
  "button[id*='accept' i]",
  "button[class*='accept' i]",
  "[data-testid='cookie-accept']",
];

export async function dismissCookieBanner(page: Page): Promise<void> {
  for (const selector of COOKIE_SELECTORS) {
    const loc = page.locator(selector).first();
    try {
      if (await loc.isVisible({ timeout: 400 })) {
        await loc.click({ timeout: 800 });
        return;
      }
    } catch {
      // keep going
    }
  }
}

export async function gotoRendered(
  page: Page,
  url: string,
): Promise<{ ok: boolean; finalUrl: string; html: string; error?: string }> {
  try {
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 25_000,
    });
    const status = response?.status() ?? 0;
    if (status >= 400) {
      return {
        ok: false,
        finalUrl: page.url(),
        html: "",
        error: `HTTP ${status}`,
      };
    }
    await page.waitForLoadState("networkidle", { timeout: 4_000 }).catch(() => undefined);
    await new Promise((r) => setTimeout(r, 700));
    await dismissCookieBanner(page);
    const html = await page.content();
    return { ok: true, finalUrl: page.url(), html };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Navigation failed";
    return { ok: false, finalUrl: page.url() || url, html: "", error: message };
  }
}

export async function collectHrefs(page: Page): Promise<string[]> {
  return page.$$eval("a[href]", (anchors) =>
    anchors
      .map((a) => (a as HTMLAnchorElement).href)
      .filter((href) => href.startsWith("http")),
  );
}

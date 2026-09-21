import type { PathKind } from "./types";

export function detectShopify(url: string, html: string): boolean {
  const hay = `${url}\n${html}`.toLowerCase();
  return (
    hay.includes("myshopify.com") ||
    hay.includes("cdn.shopify.com") ||
    hay.includes("checkout.shopify.com") ||
    hay.includes("window.shopify") ||
    hay.includes("shopify.theme") ||
    hay.includes("shopify-section")
  );
}

export function checkoutLooksRendered(
  finalUrl: string,
  html: string,
  pathKind: PathKind,
): boolean {
  if (pathKind !== "checkout") return false;
  let pathname = "/";
  try {
    pathname = new URL(finalUrl).pathname.toLowerCase();
  } catch {
    pathname = finalUrl.toLowerCase();
  }
  if (/\/cart\/?$/.test(pathname) || pathname.endsWith("/cart")) return false;
  const shopifyCheckout =
    /\/checkouts\//.test(pathname) ||
    finalUrl.toLowerCase().includes("checkout.shopify") ||
    finalUrl.toLowerCase().includes("shop.app");
  const formish = /<form[\s>]/i.test(html);
  const signals = /checkout|shipping|payment|bestellung|kasse|lieferung/i.test(
    html,
  );
  return shopifyCheckout || (formish && signals);
}

export function buildUncheckedSurfaces(input: {
  checkoutRendered: boolean;
  isShopify: boolean;
  failedPages: Array<{ label: string; pathKind: PathKind }>;
}): string[] {
  const items: string[] = [];

  if (!input.checkoutRendered) {
    items.push(
      input.isShopify
        ? "Checkout, especially Shopify hosted checkout / Shop Pay — not rendered in this scan"
        : "Checkout (including hosted payment / wallet sheets) — not rendered in this scan",
    );
  } else {
    items.push(
      "Payment provider iframes, Shop Pay, and other checkout widgets hosted by third parties",
    );
  }

  items.push("PDFs and other downloadable documents");
  items.push("Video, audio, and other timed media (captions, audio description)");
  items.push(
    "Third-party app widgets (reviews, chat, upsells, loyalty, live help, cookie tools)",
  );
  items.push(
    "Keyboard-only use, screen readers, and other assistive technology (not simulated here)",
  );
  items.push("Logged-in account areas, order emails, and packing slips");

  for (const page of input.failedPages) {
    if (page.pathKind === "checkout" && !input.checkoutRendered) continue;
    items.push(`${page.label} — page did not render in this scan`);
  }

  return items;
}

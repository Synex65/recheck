import type { MoneyPages, PathKind } from "./types";

export class UrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UrlError";
  }
}

export function parseHttpUrl(raw: string): URL {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new UrlError("URL is required.");
  }
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    throw new UrlError("That does not look like a URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UrlError("Only http and https URLs can be scanned.");
  }
  return url;
}

export function canonicalSiteUrl(raw: string): string {
  const url = parseHttpUrl(raw);
  url.hash = "";
  url.search = "";
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }
  return url.toString();
}

export function originOf(raw: string): string {
  return parseHttpUrl(raw).origin;
}

export function hostOf(raw: string): string {
  return parseHttpUrl(raw).host.toLowerCase();
}

export function pathnameOf(raw: string): string {
  const url = parseHttpUrl(raw);
  if (!url.pathname || url.pathname === "") return "/";
  return url.pathname;
}

export function normalizePathname(pathname: string): string {
  if (!pathname) return "/";
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (p !== "/" && p.endsWith("/")) return p.slice(0, -1);
  return p;
}

export function sameRegistrableOrigin(a: string, b: string): boolean {
  try {
    const ha = new URL(a).hostname.replace(/^www\./, "").toLowerCase();
    const hb = new URL(b).hostname.replace(/^www\./, "").toLowerCase();
    return ha === hb;
  } catch {
    return false;
  }
}

export function isShopifyCheckoutHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      host === "checkout.shopify.com" ||
      host.endsWith(".shopify.com") ||
      host === "shop.app"
    );
  } catch {
    return false;
  }
}

export function allowedNavigation(
  href: string,
  storefrontUrl: string,
): boolean {
  if (sameRegistrableOrigin(href, storefrontUrl)) return true;
  return isShopifyCheckoutHost(href);
}

export function uniqueTargets(targets: { url: string }[]): { url: string }[] {
  const seen = new Set<string>();
  const out: { url: string }[] = [];
  for (const t of targets) {
    let key: string;
    try {
      key = canonicalSiteUrl(t.url);
    } catch {
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

export function moneyPagesFromUnknown(value: unknown): MoneyPages {
  if (!value || typeof value !== "object") return {};
  const o = value as Record<string, unknown>;
  const pick = (k: string) =>
    typeof o[k] === "string" && o[k].trim() ? (o[k] as string).trim() : undefined;
  return {
    home: pick("home"),
    plp: pick("plp"),
    pdp: pick("pdp"),
    cart: pick("cart"),
    checkout: pick("checkout"),
  };
}

export function pathKindLabel(kind: PathKind): string {
  switch (kind) {
    case "home":
      return "home";
    case "plp":
      return "PLP";
    case "pdp":
      return "PDP";
    case "cart":
      return "cart";
    case "checkout":
      return "checkout";
    default:
      return "page";
  }
}

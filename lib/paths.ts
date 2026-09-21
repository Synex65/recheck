import type { PathKind, Target } from "./types";
import {
  allowedNavigation,
  canonicalSiteUrl,
  parseHttpUrl,
  pathnameOf,
} from "./urls";

export function inferPathKind(url: string, hint?: PathKind): PathKind {
  if (hint && hint !== "other") return hint;
  let parsed: URL;
  try {
    parsed = parseHttpUrl(url);
  } catch {
    return "other";
  }
  const host = parsed.hostname.toLowerCase();
  const p = parsed.pathname.toLowerCase();

  if (
    host.includes("checkout.shopify") ||
    host === "shop.app" ||
    /\/checkouts?\b/.test(p) ||
    /\/checkout\b/.test(p) ||
    /\/zahlung/.test(p) ||
    /\/kasse/.test(p) ||
    /\/paiement/.test(p)
  ) {
    return "checkout";
  }
  if (/\/cart\b/.test(p) || /\/warenkorb/.test(p) || /\/panier/.test(p) || /\/basket/.test(p)) {
    return "cart";
  }
  if (
    /\/products\/[^/]+/.test(p) ||
    /\/product\/[^/]+/.test(p) ||
    /\/produkt\/[^/]+/.test(p) ||
    /\/p\/[^/]+/.test(p)
  ) {
    return "pdp";
  }
  if (
    /\/collections?/.test(p) ||
    /\/categor/.test(p) ||
    /\/kategor/.test(p) ||
    /\/shop\b/.test(p) ||
    /\/products\/?$/.test(p) ||
    /\/c\/[^/]+/.test(p)
  ) {
    return "plp";
  }
  if (p === "/" || p === "") return "home";
  return hint ?? "other";
}

export function buildInitialTargets(
  storefrontUrl: string,
  moneyPages: {
    home?: string;
    plp?: string;
    pdp?: string;
    cart?: string;
    checkout?: string;
  },
): Target[] {
  const targets: Target[] = [];
  const home = moneyPages.home || storefrontUrl;
  targets.push({
    url: canonicalSiteUrl(home),
    pathKind: "home",
    source: "requested",
  });

  const extras: Array<[keyof typeof moneyPages, PathKind]> = [
    ["plp", "plp"],
    ["pdp", "pdp"],
    ["cart", "cart"],
    ["checkout", "checkout"],
  ];
  for (const [key, kind] of extras) {
    const raw = moneyPages[key];
    if (!raw) continue;
    targets.push({
      url: canonicalSiteUrl(raw),
      pathKind: kind,
      source: "requested",
    });
  }

  const seen = new Set<string>();
  const deduped: Target[] = [];
  for (const t of targets) {
    if (seen.has(t.url)) continue;
    seen.add(t.url);
    deduped.push(t);
  }
  return deduped;
}

export function shouldDiscover(moneyPages: {
  home?: string;
  plp?: string;
  pdp?: string;
  cart?: string;
  checkout?: string;
}): boolean {
  // If the operator scoped money pages, honour that list. Discover only when
  // they pasted a storefront URL with no extra paths.
  return (
    !moneyPages.home &&
    !moneyPages.plp &&
    !moneyPages.pdp &&
    !moneyPages.cart &&
    !moneyPages.checkout
  );
}

export function pickDiscoveredTargets(
  hrefs: string[],
  storefrontUrl: string,
  existing: Target[],
  maxExtra = 5,
): Target[] {
  const have = new Set(existing.map((t) => t.url));
  const haveKind = new Set(existing.map((t) => t.pathKind));
  const found: Target[] = [];

  const ranked = hrefs
    .filter((href) => allowedNavigation(href, storefrontUrl))
    .map((href) => {
      try {
        return { href: canonicalSiteUrl(href), kind: inferPathKind(href) };
      } catch {
        return null;
      }
    })
    .filter((v): v is { href: string; kind: PathKind } => Boolean(v));

  const prefer: PathKind[] = ["checkout", "cart", "pdp", "plp"];
  for (const kind of prefer) {
    if (haveKind.has(kind)) continue;
    const match = ranked.find((r) => r.kind === kind && !have.has(r.href));
    if (!match) continue;
    found.push({ url: match.href, pathKind: kind, source: "discovered" });
    have.add(match.href);
    haveKind.add(kind);
  }

  for (const r of ranked) {
    if (found.length >= maxExtra) break;
    if (have.has(r.href)) continue;
    if (r.kind === "home" || r.kind === "other") continue;
    found.push({ url: r.href, pathKind: r.kind, source: "discovered" });
    have.add(r.href);
  }

  return found.slice(0, maxExtra);
}

export function commonFallbackPaths(storefrontUrl: string): Target[] {
  const origin = parseHttpUrl(storefrontUrl).origin;
  const candidates: Array<[string, PathKind]> = [
    ["/cart", "cart"],
    ["/checkout", "checkout"],
    ["/collections/all", "plp"],
    ["/products", "plp"],
  ];
  return candidates.map(([p, kind]) => ({
    url: canonicalSiteUrl(`${origin}${p}`),
    pathKind: kind,
    source: "discovered" as const,
  }));
}

export function pageLabel(url: string, pathKind: PathKind): string {
  if (pathKind === "checkout") return "checkout";
  if (pathKind === "cart") return "cart";
  if (pathKind === "pdp") return "PDP";
  if (pathKind === "plp") return "PLP";
  if (pathKind === "home") return "home";
  return pathnameOf(url);
}

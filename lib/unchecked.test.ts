import { describe, expect, it } from "vitest";
import { inferPathKind } from "./paths";
import { buildUncheckedSurfaces } from "./unchecked";

describe("unchecked surfaces", () => {
  it("always includes PDFs/media and third-party widgets", () => {
    const items = buildUncheckedSurfaces({
      checkoutRendered: true,
      isShopify: false,
      failedPages: [],
    });
    const blob = items.join("\n");
    expect(blob).toMatch(/PDF/i);
    expect(blob).toMatch(/media/i);
    expect(blob).toMatch(/Third-party app widgets/i);
  });

  it("calls out Shopify checkout when it did not render", () => {
    const items = buildUncheckedSurfaces({
      checkoutRendered: false,
      isShopify: true,
      failedPages: [{ label: "checkout", pathKind: "checkout" }],
    });
    expect(items[0]).toMatch(/Shopify hosted checkout/i);
  });
});

describe("path inference", () => {
  it("detects money paths", () => {
    expect(inferPathKind("https://s.example/checkout")).toBe("checkout");
    expect(inferPathKind("https://s.example/cart")).toBe("cart");
    expect(inferPathKind("https://s.example/products/hat")).toBe("pdp");
    expect(inferPathKind("https://s.example/collections/all")).toBe("plp");
    expect(inferPathKind("https://s.example/")).toBe("home");
  });
});

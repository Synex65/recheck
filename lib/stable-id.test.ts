import { describe, expect, it } from "vitest";
import { makeStableId } from "./stable-id";

describe("stable ids", () => {
  it("is stable for the same host, rule, path, and selector", () => {
    const a = makeStableId({
      siteUrl: "https://shop.example/eu",
      ruleId: "image-alt",
      pathname: "/products/hat/",
      selector: "img.hero",
    });
    const b = makeStableId({
      siteUrl: "https://shop.example/eu",
      ruleId: "image-alt",
      pathname: "/products/hat",
      selector: "img.hero",
    });
    expect(a).toBe(b);
    expect(a).toMatch(/^image-alt-[a-f0-9]{10}$/);
  });

  it("changes when the selector changes", () => {
    const a = makeStableId({
      siteUrl: "https://shop.example",
      ruleId: "button-name",
      pathname: "/cart",
      selector: "button.icon",
    });
    const b = makeStableId({
      siteUrl: "https://shop.example",
      ruleId: "button-name",
      pathname: "/cart",
      selector: "button.other",
    });
    expect(a).not.toBe(b);
  });
});

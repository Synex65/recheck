import { describe, expect, it } from "vitest";
import { shouldDiscover } from "./paths";

describe("discovery scope", () => {
  it("discovers only when no money pages were provided", () => {
    expect(shouldDiscover({})).toBe(true);
    expect(shouldDiscover({ plp: "https://s.example/products" })).toBe(false);
  });
});

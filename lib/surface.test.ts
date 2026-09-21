import { describe, expect, it } from "vitest";
import { BANNED_COPY_PATTERNS } from "./copy";
import { IMPRINT, IMPRINT_INTRO, PRIVACY, TERMS, blocksText } from "./legal";
import { COOKIE_COPY, MARKETING } from "./marketing";
import {
  OPERATOR_PLACEHOLDERS,
  displayOperatorField,
  resolveOperator,
} from "./operator";

function collect(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collect);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collect);
  }
  return [];
}

const surface = [
  ...collect(MARKETING),
  ...collect(COOKIE_COPY),
  ...collect(OPERATOR_PLACEHOLDERS),
  ...collect(IMPRINT_INTRO),
  blocksText(PRIVACY),
  blocksText(IMPRINT),
  blocksText(TERMS),
].join("\n");

describe("marketing and legal surface", () => {
  it("does not use banned conformity phrasing", () => {
    for (const pattern of BANNED_COPY_PATTERNS) {
      expect(surface).not.toMatch(pattern);
    }
  });

  it("keeps the homepage promise and the scan entry heading", () => {
    expect(MARKETING.headlineLead).toBe("Re-check the shop.");
    expect(MARKETING.subcopy.toLowerCase()).toContain("silence is not a pass");
    expect(MARKETING.footerDisclaimer).toContain("does not declare EAA/BFSG conformity");
    expect(MARKETING.footerDisclaimer).toContain("does not certify WCAG");
  });

  it("offers only a necessary cookie choice", () => {
    expect(COOKIE_COPY.body).toMatch(/does not set analytics/i);
    expect(COOKIE_COPY.body).toMatch(/marketing cookies/i);
    expect(COOKIE_COPY.accept).toBe("Accept necessary only");
    expect(COOKIE_COPY.body.toLowerCase()).not.toContain("accept analytics");
  });

  it("describes real processing and Railway hosting without selling data", () => {
    const privacy = blocksText(PRIVACY);
    expect(privacy).toMatch(/storefront URL/i);
    expect(privacy).toMatch(/Railway/);
    expect(privacy).toMatch(/do not sell personal data/i);
    expect(privacy).toMatch(/local storage/i);
  });

  it("states the terms limits in plain language", () => {
    const terms = blocksText(TERMS);
    expect(terms).toMatch(/not legal advice/i);
    expect(terms).toMatch(/not a certification/i);
    expect(terms).toMatch(/no warranty of compliance/i);
    expect(terms).toMatch(/not a pass/i);
  });

  it("labels unknown operator details and does not invent registration numbers", () => {
    const placeholders = Object.values(OPERATOR_PLACEHOLDERS).join("\n");
    expect(placeholders).toContain("TODO");
    expect(placeholders).toContain("Arda / Synex65");
    expect(placeholders).toMatch(/GitHub account, not a registered company name/);
    expect(surface).not.toMatch(/\bHRB\s*\d+/i);
    expect(surface).not.toMatch(/\bHRA\s*\d+/i);
    expect(surface).not.toMatch(/\bDE\s?\d{9}\b/);
    expect(surface).not.toMatch(/\b\d{5}\s+[A-Za-zÄÖÜäöüß]/);
    expect(IMPRINT_INTRO.note).toMatch(/not invented|Do not publish a guessed/i);
  });

  it("uses env values when present and placeholders when blank", () => {
    expect(resolveOperator({})).toEqual({
      name: null,
      address: null,
      email: null,
    });
    expect(
      resolveOperator({ name: "  ", address: "Line 1\\nLine 2", email: " a@b.co " }),
    ).toEqual({
      name: null,
      address: "Line 1\nLine 2",
      email: "a@b.co",
    });
    expect(
      displayOperatorField(null, OPERATOR_PLACEHOLDERS.name).placeholder,
    ).toBe(true);
    expect(displayOperatorField("Held example", OPERATOR_PLACEHOLDERS.name)).toEqual({
      text: "Held example",
      placeholder: false,
    });
  });
});

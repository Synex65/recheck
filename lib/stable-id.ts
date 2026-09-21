import { createHash } from "node:crypto";
import { hostOf, normalizePathname } from "./urls";

export function makeStableId(input: {
  siteUrl: string;
  ruleId: string;
  pathname: string;
  selector: string;
}): string {
  const host = hostOf(input.siteUrl);
  const path = normalizePathname(input.pathname);
  const selector = input.selector.replace(/\s+/g, " ").trim().slice(0, 240);
  const hash = createHash("sha256")
    .update([host, input.ruleId, path, selector].join("|"))
    .digest("hex")
    .slice(0, 10);
  const rule = input.ruleId.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 28);
  return `${rule || "rule"}-${hash}`;
}

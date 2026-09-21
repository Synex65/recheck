import type { Page } from "playwright";
import type { PathKind, Severity } from "./types";
import { axeImpactToSeverity, rankScore } from "./rank";
import { makeStableId } from "./stable-id";
import { pathnameOf } from "./urls";

const NODES_PER_RULE = 6;

export type AxeNodeIssue = {
  stableId: string;
  ruleId: string;
  title: string;
  description: string;
  helpUrl: string;
  severity: Severity;
  selector: string;
  htmlSnippet: string;
  pathname: string;
  pathKind: PathKind;
  url: string;
  rankScore: number;
};

export async function collectAxeIssues(input: {
  page: Page;
  siteUrl: string;
  pageUrl: string;
  pathKind: PathKind;
}): Promise<AxeNodeIssue[]> {
  const AxeBuilder = (await import("@axe-core/playwright")).default;
  const results = await new AxeBuilder({ page: input.page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  const liveUrl = input.page.url();
  const pageUrl =
    liveUrl && /^https?:\/\//i.test(liveUrl) ? liveUrl : input.pageUrl;
  const pathname = pathnameOf(pageUrl);
  const issues: AxeNodeIssue[] = [];

  for (const violation of results.violations) {
    const severity = axeImpactToSeverity(violation.impact);
    const nodes = violation.nodes.slice(0, NODES_PER_RULE);
    for (const node of nodes) {
      const selector = (node.target || []).map(String).join(" ").trim() || "(unknown)";
      const htmlSnippet = (node.html || "").replace(/\s+/g, " ").trim().slice(0, 280);
      issues.push({
        stableId: makeStableId({
          siteUrl: input.siteUrl,
          ruleId: violation.id,
          pathname,
          selector,
        }),
        ruleId: violation.id,
        title: violation.help || violation.id,
        description: violation.description || "",
        helpUrl: violation.helpUrl || "",
        severity,
        selector,
        htmlSnippet,
        pathname,
        pathKind: input.pathKind,
        url: pageUrl,
        rankScore: rankScore(severity, input.pathKind),
      });
    }
  }

  return issues;
}

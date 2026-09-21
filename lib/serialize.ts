import { COPY } from "./copy";
import { formatScanDate } from "./format";
import { compareIssues } from "./rank";
import type { PathKind, ScanStatus, Severity } from "./types";

export type IssueDTO = {
  id: string;
  stableId: string;
  ruleId: string;
  title: string;
  description: string;
  helpUrl: string;
  severity: Severity;
  selector: string;
  htmlSnippet: string;
  rankScore: number;
  pathname: string;
  pathKind: PathKind;
  url: string;
};

export type PageDTO = {
  id: string;
  url: string;
  pathname: string;
  pathKind: PathKind;
  status: "pending" | "reached" | "failed";
  failReason: string | null;
  title: string | null;
};

export type ScanDTO = {
  id: string;
  status: ScanStatus;
  siteUrl: string;
  startedAt: string;
  finishedAt: string | null;
  checkoutRendered: boolean;
  pagesReached: number;
  coverageWarning: boolean;
  priorScanDate: string | null;
  coverageNote: string | null;
  newIssueCount: number;
  clearedIssueCount: number;
  diffSummary: string | null;
  errorMessage: string | null;
  softError: boolean;
  loadingMessage: string;
  emptyMessage: string;
  zeroFindingsMessage: string;
  pages: PageDTO[];
  issues: IssueDTO[];
  statement: string | null;
  unchecked: string[];
  sharePath: string;
  csvPath: string;
};

type ScanRecord = {
  id: string;
  status: string;
  startedAt: Date;
  finishedAt: Date | null;
  checkoutRendered: boolean;
  pagesReached: number;
  coverageWarning: boolean;
  priorScanDate: Date | null;
  newIssueCount: number;
  clearedIssueCount: number;
  errorMessage: string | null;
  softError: boolean;
  uncheckedJson: string;
  site: { url: string };
  pages: Array<{
    id: string;
    url: string;
    pathname: string;
    pathKind: string;
    status: string;
    failReason: string | null;
    title: string | null;
  }>;
  issues: Array<{
    id: string;
    stableId: string;
    ruleId: string;
    title: string;
    description: string;
    helpUrl: string;
    severity: string;
    selector: string;
    htmlSnippet: string;
    rankScore: number;
    page: { pathname: string; pathKind: string; url: string };
  }>;
  statement: { body: string } | null;
};

export function serializeScan(scan: ScanRecord): ScanDTO {
  const issues: IssueDTO[] = scan.issues
    .map((issue) => ({
      id: issue.id,
      stableId: issue.stableId,
      ruleId: issue.ruleId,
      title: issue.title,
      description: issue.description,
      helpUrl: issue.helpUrl,
      severity: issue.severity as Severity,
      selector: issue.selector,
      htmlSnippet: issue.htmlSnippet,
      rankScore: issue.rankScore,
      pathname: issue.page.pathname,
      pathKind: issue.page.pathKind as PathKind,
      url: issue.page.url,
    }))
    .sort(compareIssues);

  let unchecked: string[] = [];
  try {
    unchecked = JSON.parse(scan.uncheckedJson) as string[];
  } catch {
    unchecked = [];
  }

  const prior = scan.priorScanDate ? formatScanDate(scan.priorScanDate) : null;
  const hasPriorDiff =
    scan.status === "completed" || scan.status === "incomplete"
      ? scan.priorScanDate !== null
      : false;

  return {
    id: scan.id,
    status: scan.status as ScanStatus,
    siteUrl: scan.site.url,
    startedAt: scan.startedAt.toISOString(),
    finishedAt: scan.finishedAt?.toISOString() ?? null,
    checkoutRendered: scan.checkoutRendered,
    pagesReached: scan.pagesReached,
    coverageWarning: scan.coverageWarning,
    priorScanDate: prior,
    coverageNote:
      scan.coverageWarning && prior ? COPY.coverageNote(prior) : null,
    newIssueCount: scan.newIssueCount,
    clearedIssueCount: scan.clearedIssueCount,
    diffSummary: hasPriorDiff
      ? COPY.diffSummary(scan.newIssueCount, scan.clearedIssueCount)
      : null,
    errorMessage: scan.errorMessage,
    softError: scan.softError,
    loadingMessage: COPY.loading,
    emptyMessage: COPY.empty,
    zeroFindingsMessage: COPY.zeroFindings,
    pages: scan.pages.map((p) => ({
      id: p.id,
      url: p.url,
      pathname: p.pathname,
      pathKind: p.pathKind as PathKind,
      status: p.status as PageDTO["status"],
      failReason: p.failReason,
      title: p.title,
    })),
    issues,
    statement: scan.statement?.body ?? null,
    unchecked,
    sharePath: `/s/${scan.id}`,
    csvPath: `/api/scans/${scan.id}/csv`,
  };
}

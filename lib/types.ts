export const PATH_KINDS = [
  "home",
  "plp",
  "pdp",
  "cart",
  "checkout",
  "other",
] as const;

export type PathKind = (typeof PATH_KINDS)[number];

export const SEVERITIES = ["critical", "serious", "moderate", "minor"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const SCAN_STATUSES = [
  "queued",
  "running",
  "completed",
  "incomplete",
  "failed",
] as const;
export type ScanStatus = (typeof SCAN_STATUSES)[number];

export type MoneyPages = {
  home?: string;
  plp?: string;
  pdp?: string;
  cart?: string;
  checkout?: string;
};

export type ScanRequest = {
  storefrontUrl: string;
  moneyPages?: MoneyPages;
};

export type Target = {
  url: string;
  pathKind: PathKind;
  source: "requested" | "discovered";
};

export type IssueInput = {
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

export type ReachedPage = {
  url: string;
  pathname: string;
  pathKind: PathKind;
};

export type StatementInput = {
  scannedAt: Date;
  reachedPages: ReachedPage[];
  checkoutRendered: boolean;
  unchecked: string[];
  issues: Array<{
    title: string;
    pathname: string;
    stableId: string;
    severity: Severity;
  }>;
  coverageShrunk: boolean;
  priorScanDate: Date | null;
};

export type DiffResult = {
  newCount: number;
  clearedCount: number;
  newIds: string[];
  clearedIds: string[];
  coverageShrunk: boolean;
};

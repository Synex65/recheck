export const COPY = {
  empty: "No scan yet — paste a storefront URL to start.",
  emptyNote: "Silence is not a pass.",
  loading: "Crawling pages… issues appear as we finish each path.",
  softError: "Scan incomplete — statement will only cover pages we reached.",
  hardError: "Scan failed — no statement generated.",
  zeroFindings:
    "No automated findings on pages we reached. That is not a pass — see what we didn’t check.",
  statementPending: "Statement drafts when this scan finishes.",
  coverageNote: (priorDate: string) =>
    `This scan reached fewer pages than ${priorDate} — comparisons may understate issues.`,
  diffSummary: (nNew: number, nCleared: number) =>
    `${nNew} new, ${nCleared} cleared since last scan`,
  partialFail: (page: string) =>
    `Couldn’t render ${page} — listed under unchecked.`,
  closingLine:
    "This is a working draft based on automated checks, not a legal assessment or certification.",
  statementTitle: "Accessibility statement (working draft)",
  uncheckedHeading: "What we didn’t check",
  checkoutWidgetsUnchecked:
    "Checkout URL reached — payment iframes / Shop Pay still unchecked.",
} as const;

export const BANNED_COPY_PATTERNS: RegExp[] = [
  /\blooking good\b/i,
  /\bchecking compliance\b/i,
  /\bnow compliant\b/i,
  /\bmeets EAA\b/i,
  /\bmeets BFSG\b/i,
  /\bEAA-ready\b/i,
  /\bBFSG-ready\b/i,
  /\bWCAG-passed\b/i,
  /\bpartially compliant\b/i,
  /\bhigh risk of non-compliance\b/i,
];

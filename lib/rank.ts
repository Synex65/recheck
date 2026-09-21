import type { PathKind, Severity } from "./types";

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 400,
  serious: 300,
  moderate: 200,
  minor: 100,
};

export const PATH_WEIGHT: Record<PathKind, number> = {
  checkout: 50,
  cart: 40,
  pdp: 30,
  plp: 20,
  home: 16,
  other: 8,
};

export const PATH_CRITICALITY_ORDER: PathKind[] = [
  "checkout",
  "cart",
  "pdp",
  "plp",
  "home",
  "other",
];

export function axeImpactToSeverity(impact: string | null | undefined): Severity {
  switch (impact) {
    case "critical":
      return "critical";
    case "serious":
      return "serious";
    case "moderate":
      return "moderate";
    case "minor":
      return "minor";
    default:
      return "moderate";
  }
}

export function rankScore(severity: Severity, pathKind: PathKind): number {
  return SEVERITY_WEIGHT[severity] + PATH_WEIGHT[pathKind];
}

export function compareIssues<
  T extends { rankScore: number; severity: Severity; pathKind: PathKind; title: string },
>(a: T, b: T): number {
  if (b.rankScore !== a.rankScore) return b.rankScore - a.rankScore;
  const sev =
    SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity];
  if (sev !== 0) return sev;
  const path =
    PATH_WEIGHT[b.pathKind] - PATH_WEIGHT[a.pathKind];
  if (path !== 0) return path;
  return a.title.localeCompare(b.title);
}

import type { DiffResult } from "./types";

export type PriorIssue = {
  stableId: string;
  pathname: string;
};

export function diffIssues(input: {
  previous: PriorIssue[] | null;
  current: PriorIssue[];
  currentReachedPathnames: string[];
  previousPagesReached: number | null;
  currentPagesReached: number;
}): DiffResult {
  if (!input.previous) {
    return {
      newCount: 0,
      clearedCount: 0,
      newIds: [],
      clearedIds: [],
      coverageShrunk: false,
    };
  }

  const reached = new Set(input.currentReachedPathnames);
  const prevIds = new Set(input.previous.map((i) => i.stableId));
  const currIds = new Set(input.current.map((i) => i.stableId));

  const newIds = input.current
    .map((i) => i.stableId)
    .filter((id) => !prevIds.has(id));

  const clearedIds = input.previous
    .filter((i) => !currIds.has(i.stableId) && reached.has(i.pathname))
    .map((i) => i.stableId);

  const coverageShrunk =
    input.previousPagesReached !== null &&
    input.currentPagesReached < input.previousPagesReached;

  return {
    newCount: newIds.length,
    clearedCount: clearedIds.length,
    newIds: [...new Set(newIds)],
    clearedIds: [...new Set(clearedIds)],
    coverageShrunk,
  };
}

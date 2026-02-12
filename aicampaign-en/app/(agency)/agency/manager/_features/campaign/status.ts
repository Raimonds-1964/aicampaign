import type { CheckStatus, CampaignCheck } from "../../_data/accounts";

/** Returns the worse (more severe) of two statuses */
export function getWorstStatus(a: CheckStatus, b: CheckStatus): CheckStatus {
  const rank: Record<CheckStatus, number> = {
    ok: 0,
    warning: 1,
    critical: 2,
  };

  return rank[a] >= rank[b] ? a : b;
}

/** Calculates overall campaign status from multiple checks */
export function getOverallStatus(checks: CampaignCheck[]): CheckStatus {
  return checks.reduce<CheckStatus>(
    (acc, c) => getWorstStatus(acc, c.status),
    "ok"
  );
}

/** Finds visibility-related check */
export function findVisibilityCheck(checks: CampaignCheck[]) {
  return checks.find((c) => c.key === "visibility") ?? null;
}

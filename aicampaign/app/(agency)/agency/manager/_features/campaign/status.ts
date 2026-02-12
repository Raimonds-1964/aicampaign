import type { CheckStatus, CampaignCheck } from "../../_data/accounts";

export function worstStatus(a: CheckStatus, b: CheckStatus): CheckStatus {
  const rank: Record<CheckStatus, number> = { ok: 0, warning: 1, critical: 2 };
  return rank[a] >= rank[b] ? a : b;
}

export function overallStatus(checks: CampaignCheck[]): CheckStatus {
  return checks.reduce<CheckStatus>((acc, c) => worstStatus(acc, c.status), "ok");
}

export function findVisibility(checks: CampaignCheck[]) {
  return checks.find((c) => c.key === "visibility") ?? null;
}

import type { Plan } from "../state/types";

export const planConfig: Record<Plan, { maxAdGroups: number; maxKeywords: number }> = {
  easy: { maxAdGroups: 1, maxKeywords: 10 },
  basic: { maxAdGroups: 2, maxKeywords: 15 },
  pro: { maxAdGroups: 4, maxKeywords: 25 },
  agency: { maxAdGroups: 8, maxKeywords: 60 },
};

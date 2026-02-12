"use client";

/**
 * Manager wrapper virs kopīgā store.
 * Mērķis: lai vecie manager UI faili var importēt:
 *   - useManagerStore
 *   - managerSelectors / managerActions
 * un arī atsevišķas funkcijas (getAccountById u.c.), ja tās jau tiek importētas tieši.
 */

import {
  useAgencyStore,
  getAgencyStore,
  agencySelectors,
  agencyActions,
  ADMIN_OWNER_ID,
  type AgencyState,
  type Account,
  type Campaign,
  type Manager,
  type KeywordRow,
} from "@/app/(agency)/agency/shared/_data/agencyStore";

/** vecie nosaukumi */
export const useManagerStore = useAgencyStore;
export const getManagerStore = getAgencyStore;
export const managerSelectors = agencySelectors;
export const managerActions = agencyActions;
export { ADMIN_OWNER_ID };

/** tipi */
export type { AgencyState, Account, Campaign, Manager, KeywordRow };

/**
 * ✅ “Flat” eksporti, lai strādā esošie importi
 * (CampaignsClient.tsx importē getAccountById)
 */
export function getAccountById(accountId: string) {
  const s = getAgencyStore();
  return agencySelectors.accountById(s, accountId);
}

export function getCampaignsByAccountId(accountId: string) {
  const s = getAgencyStore();
  return agencySelectors.campaignsByAccountId(s, accountId);
}

/** (ja kaut kur vajag kontus pēc managera) */
export function getAccountsForManager(managerId: string) {
  const s = getAgencyStore();
  return agencySelectors.accountsByOwner(s, managerId);
}

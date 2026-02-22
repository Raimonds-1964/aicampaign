"use client";

/**
 * Admin wrapper around the shared store.
 * Mērķis: lai esošie admin UI faili var turpināt importēt:
 *   - useAdminStore
 *   - adminSelectors / adminActions
 * un Types (Manager, Campaign, Account, ...)
 *
 * ✅ Bez demo / bez localStorage.
 * ✅ Dati (manager saraksts) nāk no DB caur shared agencyStore.
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

/** Legacy aliases */
export const useAdminStore = useAgencyStore;
export const getAdminStore = getAgencyStore;
export const adminSelectors = agencySelectors;
export const adminActions = agencyActions;
export { ADMIN_OWNER_ID };

/** Types */
export type { AgencyState, Account, Campaign, Manager, KeywordRow };

/**
 * ✅ “Flat” exports, ja kaut kur importē tieši helperus
 */
export function getAccountById(accountId: string) {
  const s = getAgencyStore();
  return agencySelectors.accountById(s, accountId);
}

export function getCampaignsByAccountId(accountId: string) {
  const s = getAgencyStore();
  return agencySelectors.campaignsByAccountId(s, accountId);
}

export function getAccountsForManager(managerId: string) {
  const s = getAgencyStore();
  return agencySelectors.accountsByOwner(s, managerId);
}
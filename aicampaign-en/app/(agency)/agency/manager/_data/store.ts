"use client";

/**
 * Manager wrapper around the shared store.
 * Goal: allow legacy manager UI files to import:
 *   - useManagerStore
 *   - managerSelectors / managerActions
 * and also individual helper functions (getAccountById, etc.) if they were imported directly.
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
export const useManagerStore = useAgencyStore;
export const getManagerStore = getAgencyStore;
export const managerSelectors = agencySelectors;
export const managerActions = agencyActions;
export { ADMIN_OWNER_ID };

/** Types */
export type { AgencyState, Account, Campaign, Manager, KeywordRow };

/**
 * ✅ “Flat” exports so existing imports keep working
 * (e.g. CampaignsClient.tsx imports getAccountById)
 */
export function getAccountById(accountId: string) {
  const s = getAgencyStore();
  return agencySelectors.accountById(s, accountId);
}

export function getCampaignsByAccountId(accountId: string) {
  const s = getAgencyStore();
  return agencySelectors.campaignsByAccountId(s, accountId);
}

/** (If you need accounts by manager/owner) */
export function getAccountsForManager(managerId: string) {
  const s = getAgencyStore();
  return agencySelectors.accountsByOwner(s, managerId);
}
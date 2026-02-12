"use client";

/**
 * Admin wrapper virs kopīgā store.
 * Mērķis: vecie admin komponenti paliek strādājoši bez refaktora:
 *  - useAdminStore, adminSelectors, adminActions
 *  - atsevišķi flat eksporti (addManager, ...),
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
} from "@/app/(pro)/pro/shared/_data/agencyStore";

/** Stores */
export const useAdminStore = useAgencyStore;
export const getAdminStore = getAgencyStore;

/** Selektori (atpakaļsavietojamība) */
export const adminSelectors = {
  ...agencySelectors,

  // vecais nosaukums -> jaunais
  accountsByManager: (s: AgencyState, managerId: string) =>
    agencySelectors.accountsByOwner(s, managerId),

  getAccountById: (s: AgencyState, accountId: string) =>
    agencySelectors.accountById(s, accountId),

  getCampaignsByAccountId: (s: AgencyState, accountId: string) =>
    agencySelectors.campaignsByAccountId(s, accountId),
};

/** Actions */
export const adminActions = agencyActions;
export { ADMIN_OWNER_ID };

/** Types */
export type { AgencyState, Account, Campaign, Manager, KeywordRow };

/** Flat exports — lai strādā esošie importi */
export const addManager = agencyActions.addManager;
export const renameManager = agencyActions.renameManager;
export const deleteManager = agencyActions.deleteManager;
export const assignAccount = agencyActions.assignAccount;
export const removeFromManager = agencyActions.removeFromManager;
export const addAiAccount = agencyActions.addAiAccount;
export const addOwnAccount = agencyActions.addOwnAccount;

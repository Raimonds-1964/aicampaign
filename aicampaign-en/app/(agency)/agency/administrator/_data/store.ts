"use client";

/**
 * Admin wrapper around the shared store.
 * Admin now works with campaigns (campaign.ownerId).
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

export const useAdminStore = useAgencyStore;
export const getAdminStore = getAgencyStore;

/**
 * ✅ Admin selectors = shared selectors + backward-compat aliases
 * so legacy UI files keep working (accountById, campaignById, accounts, etc.)
 */
export const adminSelectors = {
  ...agencySelectors,

  /** Some UI files expect adminSelectors.managers(s) */
  managers: (s: AgencyState) => (s as any).managers ?? [],

  /** ✅ FIX: legacy profile pages expect adminSelectors.managerById(s, id) */
  managerById: (s: AgencyState, managerId: string) =>
    ((s as any).managers ?? []).find((m: any) => m.id === managerId) ?? null,

  /** ✅ Backward-compat: accounts array */
  accounts: (s: AgencyState) =>
    (agencySelectors as any).accounts?.(s) ?? (s as any).accounts ?? [],

  /** ✅ Backward-compat: accountById (widely used across UI) */
  accountById: (s: AgencyState, accountId: string) =>
    (agencySelectors as any).accountById?.(s, accountId) ??
    (agencySelectors as any).getAccountById?.(accountId) ??
    (agencySelectors as any).getAccountById?.(s, accountId) ??
    ((agencySelectors as any).accounts?.(s) ?? []).find((a: any) => a.id === accountId) ??
    null,

  /** ✅ Backward-compat: campaignById (widely used across UI) */
  campaignById: (s: AgencyState, campaignId: string) =>
    (agencySelectors as any).campaignById?.(s, campaignId) ??
    (agencySelectors as any).getCampaignById?.(campaignId) ??
    (agencySelectors as any).getCampaignById?.(s, campaignId) ??
    ((agencySelectors as any).campaigns?.(s) ?? []).find((c: any) => c.id === campaignId) ??
    null,

  /** ✅ All campaigns (flattened) */
  campaigns: (s: AgencyState) =>
    (agencySelectors as any).campaigns?.(s) ?? (s as any).campaigns ?? [],

  /** ✅ Unassigned campaigns (Admin pool) */
  freeCampaigns: (s: AgencyState) =>
    (agencySelectors as any).unassignedCampaigns?.(s) ??
    (agencySelectors as any).freeCampaigns?.(s) ??
    [],

  /** ✅ Campaigns for a specific manager */
  campaignsByManager: (s: AgencyState, managerId: string) =>
    ((agencySelectors as any).campaigns?.(s) ?? []).filter(
      (c: any) => (c.ownerId ?? c.managerId ?? ADMIN_OWNER_ID) === managerId
    ),

  /** Backward-compat */
  accountsByManager: (s: AgencyState, managerId: string) =>
    (agencySelectors as any).accountsByOwner?.(s, managerId) ??
    (agencySelectors as any).accountsByManager?.(s, managerId) ??
    [],

  /** Legacy helpers (keep) */
  getAccountById: (s: AgencyState, accountId: string) =>
    (agencySelectors as any).accountById?.(s, accountId) ??
    (agencySelectors as any).getAccountById?.(accountId) ??
    null,

  getCampaignsByAccountId: (s: AgencyState, accountId: string) =>
    (agencySelectors as any).campaignsByAccountId?.(s, accountId) ??
    ((agencySelectors as any).campaigns?.(s) ?? []).filter((c: any) => c.accountId === accountId),

  /**
   * ✅ Status checks on the details view: lookups by campaignId
   * Exposed as a selector so the UI can rely on it safely.
   */
  checksByCampaignId: (s: AgencyState, campaignId: string) =>
    (agencySelectors as any).checksByCampaignId?.(s, campaignId) ??
    (agencySelectors as any).getChecksByCampaignId?.(campaignId) ??
    (agencySelectors as any).campaignChecksById?.(s, campaignId) ??
    [],

  /**
   * ✅ Budget on the details view (if the shared store provides it)
   * The UI currently uses spentToday/dailyBudget from the campaign object,
   * but we keep this for future use and for the details page.
   */
  budgetTodayByCampaignId: (s: AgencyState, campaignId: string) =>
    (agencySelectors as any).budgetTodayByCampaignId?.(s, campaignId) ??
    (agencySelectors as any).getBudgetTodayByCampaignId?.(campaignId) ??
    null,
};

export const adminActions = agencyActions;
export { ADMIN_OWNER_ID };

export type { AgencyState, Account, Campaign, Manager, KeywordRow };

export const addManager = agencyActions.addManager;
export const renameManager = agencyActions.renameManager;
export const deleteManager = agencyActions.deleteManager;

/** ✅ Assign/unassign a campaign to a manager */
export const assignCampaign = agencyActions.assignCampaign;
export const removeCampaignFromManager = agencyActions.removeCampaignFromManager;

/** Backward-compat */
export const assignAccount = agencyActions.assignAccount;
export const removeFromManager = agencyActions.removeFromManager;

export const addAiAccount = agencyActions.addAiAccount;
export const addOwnAccount = agencyActions.addOwnAccount;
export const addCampaign = agencyActions.addCampaign;

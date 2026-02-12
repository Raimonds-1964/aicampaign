"use client";

/**
 * Admin wrapper virs shared store.
 * Tagad Admin strādā ar kampaņām (campaign.ownerId).
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
 * ✅ Admin selectors = shared selectors + back-compat aliasi,
 * lai vecie UI faili nekrīt (accountById, campaignById, accounts, etc.)
 */
export const adminSelectors = {
  ...agencySelectors,

  /** dažos UI failos bija adminSelectors.managers(s) */
  managers: (s: AgencyState) => (s as any).managers ?? [],

  /** ✅ FIX: vecie profila faili gaida adminSelectors.managerById(s, id) */
  managerById: (s: AgencyState, managerId: string) =>
    ((s as any).managers ?? []).find((m: any) => m.id === managerId) ?? null,

  /** ✅ back-compat: kontu masīvs */
  accounts: (s: AgencyState) =>
    (agencySelectors as any).accounts?.(s) ?? (s as any).accounts ?? [],

  /** ✅ back-compat: accountById (UI bieži lieto šo) */
  accountById: (s: AgencyState, accountId: string) =>
    (agencySelectors as any).accountById?.(s, accountId) ??
    (agencySelectors as any).getAccountById?.(accountId) ??
    (agencySelectors as any).getAccountById?.(s, accountId) ??
    ((agencySelectors as any).accounts?.(s) ?? []).find((a: any) => a.id === accountId) ??
    null,

  /** ✅ back-compat: campaignById (UI bieži lieto šo) */
  campaignById: (s: AgencyState, campaignId: string) =>
    (agencySelectors as any).campaignById?.(s, campaignId) ??
    (agencySelectors as any).getCampaignById?.(campaignId) ??
    (agencySelectors as any).getCampaignById?.(s, campaignId) ??
    ((agencySelectors as any).campaigns?.(s) ?? []).find((c: any) => c.id === campaignId) ??
    null,

  /** ✅ visas kampaņas (flatten) */
  campaigns: (s: AgencyState) =>
    (agencySelectors as any).campaigns?.(s) ?? (s as any).campaigns ?? [],

  /** ✅ brīvās kampaņas (Admin pool) */
  freeCampaigns: (s: AgencyState) =>
    (agencySelectors as any).unassignedCampaigns?.(s) ??
    (agencySelectors as any).freeCampaigns?.(s) ??
    [],

  /** ✅ konkrētā manager kampaņas */
  campaignsByManager: (s: AgencyState, managerId: string) =>
    ((agencySelectors as any).campaigns?.(s) ?? []).filter(
      (c: any) => (c.ownerId ?? c.managerId ?? ADMIN_OWNER_ID) === managerId
    ),

  /** back-compat */
  accountsByManager: (s: AgencyState, managerId: string) =>
    (agencySelectors as any).accountsByOwner?.(s, managerId) ??
    (agencySelectors as any).accountsByManager?.(s, managerId) ??
    [],

  /** vecie helperi (atstājam) */
  getAccountById: (s: AgencyState, accountId: string) =>
    (agencySelectors as any).accountById?.(s, accountId) ??
    (agencySelectors as any).getAccountById?.(accountId) ??
    null,

  getCampaignsByAccountId: (s: AgencyState, accountId: string) =>
    (agencySelectors as any).campaignsByAccountId?.(s, accountId) ??
    ((agencySelectors as any).campaigns?.(s) ?? []).filter((c: any) => c.accountId === accountId),

  /**
   * ✅ Statusam no detaļām: checki pēc campaignId
   * (pievienojam kā selektoru, lai UI var droši lietot)
   */
  checksByCampaignId: (s: AgencyState, campaignId: string) =>
    (agencySelectors as any).checksByCampaignId?.(s, campaignId) ??
    (agencySelectors as any).getChecksByCampaignId?.(campaignId) ??
    (agencySelectors as any).campaignChecksById?.(s, campaignId) ??
    [],

  /**
   * ✅ Budžetam no detaļām (ja shared store tādu dod)
   * UI tavā sarakstā šobrīd izmanto spentToday/dailyBudget no campaign objekta,
   * bet šo atstājam nākotnei un detaļu lapai.
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

/** ✅ piešķir/noņem kampaņu managerim */
export const assignCampaign = agencyActions.assignCampaign;
export const removeCampaignFromManager = agencyActions.removeCampaignFromManager;

/** back-compat */
export const assignAccount = agencyActions.assignAccount;
export const removeFromManager = agencyActions.removeFromManager;

export const addAiAccount = agencyActions.addAiAccount;
export const addOwnAccount = agencyActions.addOwnAccount;
export const addCampaign = agencyActions.addCampaign;

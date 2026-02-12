"use client";

import { useSyncExternalStore } from "react";

/** ===== Types ===== */
export const ADMIN_OWNER_ID = "admin";

export type Manager = { id: string; name: string };

export type KeywordRow = {
  keyword: string;
  page1: number; // 0..1 (Top of page / First page share)
  top: number; // 0..1 (Top of page rate)
  clicks: number;
  cost: number;
  note?: string;
};

export type Campaign = {
  id: string;
  name: string;
  status: "active" | "paused";
  health: "ok" | "warning" | "critical";
  dailyBudget: number;
  spentToday: number;
  ownerId: string; // ADMIN_OWNER_ID or managerId
  keywords?: KeywordRow[];
};

export type Account = {
  id: string;
  name: string;
  campaigns: Campaign[];
};

export type AgencyState = {
  managers: Manager[];
  accounts: Account[];
};

/** ===== Initial demo data ===== */
const initialState: AgencyState = {
  managers: [
    { id: "m1", name: "Emma Johnson" },
    { id: "m2", name: "Michael Carter" },
  ],
  accounts: [
    {
      id: "acc-1",
      name: "Acme Home Services",
      campaigns: [
        {
          id: "c-101",
          name: "Brand Search — Acme",
          ownerId: "m1",
          status: "active",
          health: "critical",
          dailyBudget: 30,
          spentToday: 26.4,
          keywords: [
            { keyword: "google ads agency", page1: 0.72, top: 0.31, clicks: 12, cost: 6.4, note: "Strong intent" },
            { keyword: "ppc management", page1: 0.48, top: 0.18, clicks: 7, cost: 8.1, note: "Needs work" },
            { keyword: "google advertising", page1: 0.22, top: 0.05, clicks: 3, cost: 4.9, note: "Costly" },
          ],
        },
        {
          id: "c-102",
          name: "Non-Brand Search — Services",
          ownerId: "m1",
          status: "active",
          health: "ok",
          dailyBudget: 25,
          spentToday: 10.2,
          keywords: [
            { keyword: "home services near me", page1: 0.66, top: 0.24, clicks: 18, cost: 9.6, note: "OK" },
            { keyword: "professional home services", page1: 0.41, top: 0.11, clicks: 6, cost: 7.3, note: "Needs work" },
          ],
        },
        {
          id: "c-201",
          name: "Performance Max — Retail",
          ownerId: "m2",
          status: "active",
          health: "warning",
          dailyBudget: 60,
          spentToday: 41.5,
          keywords: [{ keyword: "ecommerce brand", page1: 0.58, top: 0.17, clicks: 25, cost: 21.4, note: "Needs work" }],
        },
        {
          id: "c-202",
          name: "Competitor Search — Test",
          ownerId: ADMIN_OWNER_ID,
          status: "paused",
          health: "warning",
          dailyBudget: 15,
          spentToday: 0,
          keywords: [{ keyword: "competitor brand x", page1: 0.21, top: 0.06, clicks: 1, cost: 1.2, note: "Test" }],
        },
        {
          id: "c-301",
          name: "Local Search — Austin",
          ownerId: ADMIN_OWNER_ID,
          status: "active",
          health: "warning",
          dailyBudget: 20,
          spentToday: 7.3,
          keywords: [{ keyword: "dentist austin", page1: 0.63, top: 0.19, clicks: 9, cost: 5.2, note: "OK" }],
        },
        {
          id: "c-401",
          name: "Display Remarketing",
          ownerId: "m2",
          status: "active",
          health: "ok",
          dailyBudget: 12,
          spentToday: 3.1,
          keywords: [],
        },
      ],
    },

    /** ✅ Additional demo account for testing */
    {
      id: "acc-2",
      name: "Summit Financial Group",
      campaigns: [
        {
          id: "c-501",
          name: "Brand Search — Summit",
          ownerId: "m1",
          status: "active",
          health: "ok",
          dailyBudget: 20,
          spentToday: 5.2,
          keywords: [{ keyword: "summit financial", page1: 0.81, top: 0.44, clicks: 19, cost: 5.2, note: "Stable" }],
        },
        {
          id: "c-502",
          name: "Lead Gen — Financial Services",
          ownerId: "m2",
          status: "active",
          health: "warning",
          dailyBudget: 35,
          spentToday: 24.1,
          keywords: [
            { keyword: "financial advisor cost", page1: 0.39, top: 0.12, clicks: 11, cost: 12.8, note: "Needs work" },
            { keyword: "financial consultation", page1: 0.44, top: 0.14, clicks: 8, cost: 11.3 },
          ],
        },
        {
          id: "c-503",
          name: "Display Remarketing — Paused",
          ownerId: ADMIN_OWNER_ID,
          status: "paused",
          health: "critical",
          dailyBudget: 10,
          spentToday: 9.8,
          keywords: [],
        },
      ],
    },
  ],
};

/** ===== Store ===== */
type Listener = () => void;
const STORAGE_KEY = "agency_shared_store_v2_campaign_owner";

// If you want to reset demo data via code:
// localStorage.removeItem(STORAGE_KEY)

let state: AgencyState = initialState;
let hydrated = false;
let storageListenerBound = false;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function save(next: AgencyState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
}

function load(): AgencyState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AgencyState;
    if (!parsed) return null;
    if (!Array.isArray(parsed.managers) || !Array.isArray(parsed.accounts)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function hydrateOnce() {
  if (hydrated) return;
  hydrated = true;

  const loaded = load();
  if (loaded) state = loaded;

  if (typeof window !== "undefined" && !storageListenerBound) {
    storageListenerBound = true;
    window.addEventListener("storage", (e) => {
      if (e.key !== STORAGE_KEY) return;
      if (!e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue) as AgencyState;
        state = parsed;
        emit();
      } catch {}
    });
  }
}

function setState(next: AgencyState) {
  state = next;
  save(next);
  emit();
}

/** ===== Public API ===== */
export function useAgencyStore(): AgencyState {
  return useSyncExternalStore(
    (listener) => {
      hydrateOnce();
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => {
      hydrateOnce();
      return state;
    },
    () => state
  );
}

export function getAgencyStore(): AgencyState {
  hydrateOnce();
  return state;
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function updateCampaign(next: AgencyState, campaignId: string, updater: (c: Campaign) => Campaign): AgencyState {
  return {
    ...next,
    accounts: next.accounts.map((a) => ({
      ...a,
      campaigns: a.campaigns.map((c) => (c.id === campaignId ? updater(c) : c)),
    })),
  };
}

function flattenCampaigns(s: AgencyState) {
  return s.accounts.flatMap((a) => a.campaigns.map((c) => ({ ...c, accountId: a.id })));
}

/** ===== Selectors ===== */
export const agencySelectors = {
  managers(s: AgencyState) {
    return s.managers;
  },
  accounts(s: AgencyState) {
    return s.accounts;
  },
  accountById(s: AgencyState, accountId: string) {
    return s.accounts.find((a) => a.id === accountId) ?? null;
  },
  campaignsByAccountId(s: AgencyState, accountId: string) {
    const acc = s.accounts.find((a) => a.id === accountId);
    return acc?.campaigns ?? [];
  },

  /** ✅ canonical source */
  campaigns(s: AgencyState) {
    return flattenCampaigns(s);
  },

  /** ✅ needed by details views */
  campaignById(s: AgencyState, campaignId: string) {
    return flattenCampaigns(s).find((c) => c.id === campaignId) ?? null;
  },

  unassignedCampaigns(s: AgencyState) {
    return flattenCampaigns(s).filter((c) => c.ownerId === ADMIN_OWNER_ID);
  },

  /** Back-compat */
  unassignedAccounts(s: AgencyState) {
    const ids = new Set(
      flattenCampaigns(s)
        .filter((c) => c.ownerId === ADMIN_OWNER_ID)
        .map((c) => c.accountId)
    );
    return s.accounts.filter((a) => ids.has(a.id));
  },

  accountsByOwner(s: AgencyState, ownerId: string) {
    const ids = new Set(
      flattenCampaigns(s)
        .filter((c) => c.ownerId === ownerId)
        .map((c) => c.accountId)
    );
    return s.accounts.filter((a) => ids.has(a.id));
  },

  /** Number of campaigns assigned to a manager */
  accountCountByManager(s: AgencyState, managerId: string) {
    return flattenCampaigns(s).filter((c) => c.ownerId === managerId).length;
  },
};

/** ===== Actions ===== */
export const agencyActions = {
  assignCampaign(campaignId: string, managerId: string) {
    setState(updateCampaign(state, campaignId, (c) => ({ ...c, ownerId: managerId })));
  },

  removeCampaignFromManager(campaignId: string) {
    setState(updateCampaign(state, campaignId, (c) => ({ ...c, ownerId: ADMIN_OWNER_ID })));
  },

  /** Back-compat: assign all campaigns in an account */
  assignAccount(accountId: string, managerId: string) {
    setState({
      ...state,
      accounts: state.accounts.map((a) =>
        a.id !== accountId ? a : { ...a, campaigns: a.campaigns.map((c) => ({ ...c, ownerId: managerId })) }
      ),
    });
  },

  /** Back-compat: unassign all campaigns in an account */
  removeFromManager(accountId: string) {
    setState({
      ...state,
      accounts: state.accounts.map((a) =>
        a.id !== accountId ? a : { ...a, campaigns: a.campaigns.map((c) => ({ ...c, ownerId: ADMIN_OWNER_ID })) }
      ),
    });
  },

  deleteManager(managerId: string) {
    setState({
      managers: state.managers.filter((m) => m.id !== managerId),
      accounts: state.accounts.map((a) => ({
        ...a,
        campaigns: a.campaigns.map((c) => (c.ownerId === managerId ? { ...c, ownerId: ADMIN_OWNER_ID } : c)),
      })),
    });
  },

  addManager(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const duplicate = state.managers.some((m) => m.name.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) return null;

    const newManager: Manager = { id: makeId("mgr"), name: trimmed };
    setState({ ...state, managers: [newManager, ...state.managers] });
    return newManager;
  },

  renameManager(managerId: string, newName: string) {
    const nextName = newName.trim();
    if (!nextName) return { ok: false as const, reason: "empty" as const };

    const current = state.managers.find((m) => m.id === managerId);
    if (!current) return { ok: false as const, reason: "not_found" as const };

    const duplicate = state.managers.some((m) => m.id !== managerId && m.name.toLowerCase() === nextName.toLowerCase());
    if (duplicate) return { ok: false as const, reason: "duplicate" as const };

    setState({
      ...state,
      managers: state.managers.map((m) => (m.id === managerId ? { ...m, name: nextName } : m)),
    });

    return { ok: true as const };
  },

  /**
   * ✅ By default, allow only one account.
   * For demo "multi-account" mode, set:
   * localStorage.setItem("agency_allow_multi_accounts", "1")
   */
  addAiAccount() {
    const allowMulti =
      typeof window !== "undefined" && window.localStorage.getItem("agency_allow_multi_accounts") === "1";

    if (!allowMulti && state.accounts.length >= 1) return null;

    const acc: Account = { id: makeId("acc"), name: "AI-Managed Account", campaigns: [] };
    setState({ ...state, accounts: [acc, ...state.accounts] });
    return acc;
  },

  addOwnAccount() {
    const allowMulti =
      typeof window !== "undefined" && window.localStorage.getItem("agency_allow_multi_accounts") === "1";

    if (!allowMulti && state.accounts.length >= 1) return null;

    const acc: Account = { id: makeId("acc"), name: "My Google Ads Account", campaigns: [] };
    setState({ ...state, accounts: [acc, ...state.accounts] });
    return acc;
  },

  /** Unlimited: add a new campaign to an account */
  addCampaign(accountId: string, name?: string) {
    const acc = state.accounts.find((a) => a.id === accountId);
    if (!acc) return null;

    const c: Campaign = {
      id: makeId("c"),
      name: name?.trim() || "New Campaign",
      ownerId: ADMIN_OWNER_ID,
      status: "active",
      health: "ok",
      dailyBudget: 20,
      spentToday: 0,
      keywords: [],
    };

    setState({
      ...state,
      accounts: state.accounts.map((a) => (a.id === accountId ? { ...a, campaigns: [c, ...a.campaigns] } : a)),
    });

    return c;
  },
};

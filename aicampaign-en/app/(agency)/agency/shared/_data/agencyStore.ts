"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * ✅ NO DEMO + NO localStorage
 * Vienīgais avots: DB caur API.
 *
 * Šobrīd: ielādē tikai manager sarakstu adminam no /api/agency/admin/members.
 * Pārējais (accounts/campaigns) pagaidām tukšs.
 */

export const ADMIN_OWNER_ID = "admin";

/** ===== Types ===== */
export type Manager = { id: string; name: string; email?: string };

export type KeywordRow = {
  keyword: string;
  page1: number;
  top: number;
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
  ownerId: string; // ADMIN_OWNER_ID vai AgencyMember.id
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

/** ===== Internal store (memory-only) ===== */
type Listener = () => void;
const listeners = new Set<Listener>();

let state: AgencyState = {
  managers: [],
  accounts: [],
};

function emit() {
  listeners.forEach((l) => l());
}

function setState(next: AgencyState) {
  state = next;
  emit();
}

function mergeManagers(nextManagers: Manager[]) {
  setState({
    ...state,
    managers: nextManagers,
  });
}

/** ===== Loading from DB ===== */
type AdminMembersResp =
  | { ok: true; managers: { id: string; name: string; email: string }[] }
  | { error: string; details?: unknown };

async function loadManagersFromDb() {
  try {
    const r = await fetch("/api/agency/admin/members", { cache: "no-store" });
    const data = (await r.json().catch(() => null)) as AdminMembersResp | null;

    if (!r.ok || !data || !("ok" in data) || !data.ok) {
      mergeManagers([]);
      return;
    }

    mergeManagers(
      data.managers.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
      }))
    );
  } catch {
    mergeManagers([]);
  }
}

/** ===== Public API ===== */
export function useAgencyStore(): AgencyState {
  useEffect(() => {
    void loadManagersFromDb();
  }, []);

  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => state
  );
}

export function getAgencyStore(): AgencyState {
  return state;
}

/** ===== Selectors ===== */
function flattenCampaigns(s: AgencyState) {
  return s.accounts.flatMap((a) =>
    a.campaigns.map((c) => ({ ...c, accountId: a.id }))
  );
}

export const agencySelectors = {
  managers(s: AgencyState) {
    return s.managers;
  },

  managerById(s: AgencyState, managerId: string) {
    return s.managers.find((m) => m.id === managerId) ?? null;
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

  campaigns(s: AgencyState) {
    return flattenCampaigns(s);
  },

  campaignById(s: AgencyState, campaignId: string) {
    return flattenCampaigns(s).find((c) => c.id === campaignId) ?? null;
  },

  campaignsByManager(s: AgencyState, managerId: string) {
    return flattenCampaigns(s).filter((c) => c.ownerId === managerId);
  },

  freeCampaigns(s: AgencyState) {
    return flattenCampaigns(s).filter((c) => c.ownerId === ADMIN_OWNER_ID);
  },

  unassignedCampaigns(s: AgencyState) {
    return flattenCampaigns(s).filter((c) => c.ownerId === ADMIN_OWNER_ID);
  },

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

  accountCountByManager(s: AgencyState, managerId: string) {
    return flattenCampaigns(s).filter((c) => c.ownerId === managerId).length;
  },
};

/**
 * ✅ Actions pašlaik ir apzināti "no-op", bet ar pareiziem argumentiem,
 * lai vecais UI nekrīt TypeScript build laikā.
 *
 * Nākamais solis: šos aizstāt ar DB API.
 */
export const agencyActions = {
  assignCampaign(_campaignId: string, _managerId: string) {
    return;
  },

  removeCampaignFromManager(_campaignId: string) {
    return;
  },

  assignAccount(_accountId: string, _managerId: string) {
    return;
  },

  removeFromManager(_accountId: string) {
    return;
  },

  deleteManager(_managerId: string) {
    return;
  },

  addManager(_name: string) {
    return null as Manager | null;
  },

  renameManager(_managerId: string, _newName: string) {
    return { ok: false as const, reason: "disabled" as const };
  },

  addAiAccount() {
    return null;
  },

  addOwnAccount() {
    return null;
  },

  addCampaign(_accountId: string, _name?: string) {
    return null;
  },

  async refreshManagers() {
    await loadManagersFromDb();
  },
};
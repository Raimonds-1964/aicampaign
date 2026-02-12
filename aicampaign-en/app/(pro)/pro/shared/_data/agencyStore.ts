"use client";

import { useSyncExternalStore } from "react";

/* =====================
   TYPES
===================== */

export type Manager = {
  id: string;
  name: string;
};

export type Account = {
  id: string;
  name: string;
  ownerId: string;
};

export type Campaign = {
  id: string;
  accountId: string;
  name: string;

  // Additional fields for the campaigns dashboard view
  status?: "ACTIVE" | "PAUSED" | "REMOVED" | string;
  health?: number; // 0..100
  budgetToday?: number; // daily budget
  budgetSpentToday?: number;
  googleAdsUrl?: string;
};

/** Backward compatibility: some legacy components still expect KeywordRow */
export type KeywordRow = {
  keyword: string;
  matchType?: "BROAD" | "PHRASE" | "EXACT";
  isNegative?: boolean;
};

export type AgencyState = {
  managers: Manager[];
  accounts: Account[];
  campaigns: Campaign[];
};

/* =====================
   CONSTANTS
===================== */

export const ADMIN_OWNER_ID = "admin";

/* =====================
   DEMO DATA
===================== */

const demoManagers: Manager[] = [
  { id: ADMIN_OWNER_ID, name: "System Administrator" },
  { id: "mgr-1", name: "Alex Johnson" },
];

const demoAccounts: Account[] = [
  { id: "acc-1", name: "Acme Digital Marketing", ownerId: "mgr-1" },
  { id: "acc-2", name: "Summit E-Commerce Brand", ownerId: "mgr-1" },
  { id: "acc-3", name: "Riverside Dental Clinic", ownerId: ADMIN_OWNER_ID },
];

const demoCampaigns: Campaign[] = [
  // acc-1 -> 2 demo campaigns
  {
    id: "cmp-101",
    accountId: "acc-1",
    name: "Brand Protection",
    status: "ACTIVE",
    health: 88,
    budgetSpentToday: 26.4,
    budgetToday: 30.0,
  },
  {
    id: "cmp-102",
    accountId: "acc-1",
    name: "Search · Lead Generation",
    status: "ACTIVE",
    health: 41,
    budgetSpentToday: 10.2,
    budgetToday: 25.0,
  },

  // acc-2 -> 1 demo campaign
  {
    id: "cmp-201",
    accountId: "acc-2",
    name: "E-Commerce · Non-Brand",
    status: "ACTIVE",
    health: 72,
    budgetSpentToday: 12.0,
    budgetToday: 20.0,
  },

  // acc-3 -> 1 demo campaign
  {
    id: "cmp-301",
    accountId: "acc-3",
    name: "Appointments · Search",
    status: "PAUSED",
    health: 55,
    budgetSpentToday: 0,
    budgetToday: 15.0,
  },
];

/* =====================
   STORE CORE
===================== */

let state: AgencyState = {
  managers: demoManagers,
  accounts: demoAccounts,
  campaigns: demoCampaigns,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function setState(next: AgencyState) {
  state = next;
  emit();
}

function getState() {
  return state;
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAgencyStore() {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function getAgencyStore() {
  return state;
}

/* =====================
   SELECTORS
===================== */

export const agencySelectors = {
  managers: (s: AgencyState) => s.managers,
  accounts: (s: AgencyState) => s.accounts,
  campaigns: (s: AgencyState) => s.campaigns,

  managerById: (s: AgencyState, managerId: string) =>
    s.managers.find((m) => m.id === managerId) ?? null,

  accountById: (s: AgencyState, accountId: string) =>
    s.accounts.find((a) => a.id === accountId) ?? null,

  accountsByOwner: (s: AgencyState, ownerId: string) =>
    s.accounts.filter((a) => a.ownerId === ownerId),

  campaignsByAccountId: (s: AgencyState, accountId: string) =>
    s.campaigns.filter((c) => c.accountId === accountId),
};

/* =====================
   ACTIONS
===================== */

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export const agencyActions = {
  /** Managers */
  addManager(name: string) {
    const id = uid("mgr");
    setState({
      ...state,
      managers: [...state.managers, { id, name }],
    });
  },

  renameManager(managerId: string, name: string) {
    setState({
      ...state,
      managers: state.managers.map((m) =>
        m.id === managerId ? { ...m, name } : m
      ),
    });
  },

  deleteManager(managerId: string) {
    // When deleting a manager, reassign their accounts to the admin owner
    setState({
      managers: state.managers.filter((m) => m.id !== managerId),
      accounts: state.accounts.map((a) =>
        a.ownerId === managerId ? { ...a, ownerId: ADMIN_OWNER_ID } : a
      ),
      campaigns: state.campaigns,
    });
  },

  /** Accounts */
  assignAccount(accountId: string, ownerId: string) {
    setState({
      ...state,
      accounts: state.accounts.map((a) =>
        a.id === accountId ? { ...a, ownerId } : a
      ),
    });
  },

  removeFromManager(accountId: string) {
    // Reassign back to admin owner
    setState({
      ...state,
      accounts: state.accounts.map((a) =>
        a.id === accountId ? { ...a, ownerId: ADMIN_OWNER_ID } : a
      ),
    });
  },

  addAiAccount(name: string) {
    const id = uid("acc");
    setState({
      ...state,
      accounts: [...state.accounts, { id, name, ownerId: ADMIN_OWNER_ID }],
    });
  },

  addOwnAccount(name: string, ownerId: string) {
    const id = uid("acc");
    setState({
      ...state,
      accounts: [...state.accounts, { id, name, ownerId }],
    });
  },
};

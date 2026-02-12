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

  // ✅ papildus lauki “kampaņu dashboard” skatam
  status?: "ACTIVE" | "PAUSED" | "REMOVED" | string;
  health?: number; // 0..100
  budgetToday?: number; // daily limit
  budgetSpentToday?: number;
  googleAdsUrl?: string;
};

/** Lai salabotu vecos importus (ja kaut kur sagaida KeywordRow) */
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
  { id: ADMIN_OWNER_ID, name: "Administrator" },
  { id: "m1", name: "Anna Ozola" },
];

const demoAccounts: Account[] = [
  { id: "acc-1", name: "SIA Example (LV)", ownerId: "m1" },
  { id: "acc-2", name: "Ecom LV – Brand", ownerId: "m1" },
  { id: "acc-3", name: "Dental Clinic Riga", ownerId: ADMIN_OWNER_ID },
];

const demoCampaigns: Campaign[] = [
  // acc-1 -> 2 demo kampaņas
  {
    id: "c-101",
    accountId: "acc-1",
    name: "Brand - LV",
    status: "ACTIVE",
    health: 88,
    budgetSpentToday: 26.4,
    budgetToday: 30.0,
  },
  {
    id: "c-102",
    accountId: "acc-1",
    name: "Search - Pakalpojumi",
    status: "ACTIVE",
    health: 41,
    budgetSpentToday: 10.2,
    budgetToday: 25.0,
  },

  // acc-2 -> 1 demo kampaņa
  {
    id: "c-201",
    accountId: "acc-2",
    name: "Ecom - Generic (Demo)",
    status: "ACTIVE",
    health: 72,
    budgetSpentToday: 12.0,
    budgetToday: 20.0,
  },

  // acc-3 -> 1 demo kampaņa
  {
    id: "c-301",
    accountId: "acc-3",
    name: "Clinic - Appointments (Demo)",
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
  /** Manageri */
  addManager(name: string) {
    const id = uid("m");
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
    // dzēšot manageri, konti pārceļas pie admin
    setState({
      managers: state.managers.filter((m) => m.id !== managerId),
      accounts: state.accounts.map((a) =>
        a.ownerId === managerId ? { ...a, ownerId: ADMIN_OWNER_ID } : a
      ),
      campaigns: state.campaigns,
    });
  },

  /** Konti */
  assignAccount(accountId: string, ownerId: string) {
    setState({
      ...state,
      accounts: state.accounts.map((a) =>
        a.id === accountId ? { ...a, ownerId } : a
      ),
    });
  },

  removeFromManager(accountId: string) {
    // atpakaļ pie admin
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

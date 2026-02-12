"use client";

import { useSyncExternalStore } from "react";
import type { Account, Campaign, Manager } from "./types";
import { ADMIN_ID, mockAccounts, mockManagers } from "./adminMockData";

type AdminState = {
  managers: Manager[];
  accounts: Account[];
};

type Listener = () => void;

const STORAGE_KEY = "agency_admin_manager_store_v1";

let state: AdminState = {
  managers: mockManagers,
  accounts: mockAccounts,
};

const listeners = new Set<Listener>();
let didHydrate = false;

function emit() {
  for (const l of listeners) l();
}

function safeSave(next: AdminState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function safeLoad(): AdminState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as AdminState;
    if (!parsed?.managers || !parsed?.accounts) return null;

    return parsed;
  } catch {
    return null;
  }
}

function hydrateOnce() {
  if (didHydrate) return;
  didHydrate = true;

  const loaded = safeLoad();
  if (loaded) state = loaded;
}

function setState(next: AdminState) {
  state = next;
  safeSave(next);
  emit();
}

function getState() {
  return state;
}

function subscribe(listener: Listener) {
  hydrateOnce();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAdminStore() {
  return useSyncExternalStore(subscribe, getState, getState);
}

export const adminActions = {
  /** Assign an account to a specific manager */
  assignAccountToManager(accountId: string, managerId: string) {
    setState({
      ...state,
      accounts: state.accounts.map((a) =>
        a.id === accountId ? { ...a, ownerId: managerId } : a
      ),
    });
  },

  /** Unassign from manager → account moves back to the Administrator */
  moveAccountToAdmin(accountId: string) {
    setState({
      ...state,
      accounts: state.accounts.map((a) =>
        a.id === accountId ? { ...a, ownerId: ADMIN_ID } : a
      ),
    });
  },

  /** Delete a manager → all of their accounts move to the Administrator */
  deleteManager(managerId: string) {
    setState({
      managers: state.managers.filter((m) => m.id !== managerId),
      accounts: state.accounts.map((a) =>
        a.ownerId === managerId ? { ...a, ownerId: ADMIN_ID } : a
      ),
    });
  },

  /** (Demo) Add a manager */
  addManager(name: string) {
    const id = `mgr_${Math.random().toString(16).slice(2)}`;
    setState({ ...state, managers: [...state.managers, { id, name }] });
  },
};

export const adminSelectors = {
  adminId: ADMIN_ID,
  getManagers(s: AdminState) {
    return s.managers;
  },
  getAccounts(s: AdminState) {
    return s.accounts;
  },
  getUnassignedAccounts(s: AdminState) {
    return s.accounts.filter((a) => a.ownerId === ADMIN_ID);
  },
  getManagerAccounts(s: AdminState, managerId: string) {
    return s.accounts.filter((a) => a.ownerId === managerId);
  },
  getManagerById(s: AdminState, managerId: string) {
    return s.managers.find((m) => m.id === managerId) ?? null;
  },
};

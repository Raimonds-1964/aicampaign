"use client";

import { ADMIN_ID } from "./adminMockData";

const STORAGE_KEY = "agency_admin_impersonation_manager_id_v1";

/**
 * Returns the currently impersonated manager ID.
 * Falls back to System Administrator when unavailable.
 */
export function getImpersonation(): string {
  if (typeof window === "undefined") return ADMIN_ID;

  try {
    return window.localStorage.getItem(STORAGE_KEY) || ADMIN_ID;
  } catch {
    return ADMIN_ID;
  }
}

/**
 * Sets the impersonated manager ID and notifies listeners.
 */
export function setImpersonation(managerId: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, managerId);
    // Custom event to notify same-tab subscribers
    window.dispatchEvent(new Event("admin-impersonation-change"));
  } catch {
    // ignore
  }
}

/**
 * Subscribes to impersonation changes (cross-tab + same-tab).
 */
export function subscribeImpersonation(cb: () => void) {
  const handler = () => cb();

  // Cross-tab updates
  window.addEventListener("storage", handler);
  // Same-tab updates
  window.addEventListener("admin-impersonation-change", handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("admin-impersonation-change", handler);
  };
}

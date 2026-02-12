"use client";

const STORAGE_KEY = "admin_impersonate_manager_id_v1";
const DEFAULT_MANAGER_ID = "admin";

/**
 * Returns the currently impersonated manager id.
 * Defaults to "admin" (Platform Administrator).
 */
export function getImpersonation(): string {
  if (typeof window === "undefined") return DEFAULT_MANAGER_ID;

  try {
    return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_MANAGER_ID;
  } catch {
    return DEFAULT_MANAGER_ID;
  }
}

/**
 * Sets active impersonation manager id
 * and notifies all subscribers.
 */
export function setImpersonation(managerId: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, managerId);
    window.dispatchEvent(new Event("admin-impersonation-change"));
  } catch {
    // ignore
  }
}

/**
 * Subscribe to impersonation changes
 * (localStorage or custom event).
 */
export function subscribeImpersonation(cb: () => void) {
  const handler = () => cb();

  window.addEventListener("storage", handler);
  window.addEventListener("admin-impersonation-change", handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("admin-impersonation-change", handler);
  };
}

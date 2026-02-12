"use client";

const KEY = "admin_impersonate_manager_id_v1";

export function getImpersonation(): string {
  if (typeof window === "undefined") return "admin";
  try {
    return window.localStorage.getItem(KEY) || "admin";
  } catch {
    return "admin";
  }
}

export function setImpersonation(managerId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, managerId);
    window.dispatchEvent(new Event("admin-impersonation-change"));
  } catch {}
}

export function subscribeImpersonation(cb: () => void) {
  const handler = () => cb();
  window.addEventListener("storage", handler);
  window.addEventListener("admin-impersonation-change", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("admin-impersonation-change", handler);
  };
}

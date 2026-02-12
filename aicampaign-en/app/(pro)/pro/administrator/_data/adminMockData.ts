import type { Account, Manager } from "./types";

export const ADMIN_ID = "admin";

export const mockManagers: Manager[] = [
  { id: "mgr-1", name: "Alex Johnson" },
  { id: "mgr-2", name: "Emily Carter" },
  { id: "mgr-3", name: "Michael Rivera" },
];

export const mockAccounts: Account[] = [
  { id: "acc-1", name: "Acme Home & Living", ownerId: "mgr-1" },
  { id: "acc-2", name: "Summit E-Commerce Brand", ownerId: "mgr-1" },
  { id: "acc-3", name: "Metro Auto Service", ownerId: "mgr-2" },
  { id: "acc-4", name: "Riverside Dental Clinic", ownerId: ADMIN_ID },
  { id: "acc-5", name: "Pulse Fitness Studio", ownerId: ADMIN_ID },
  { id: "acc-6", name: "Oakwood Real Estate Leads", ownerId: "mgr-3" },
];

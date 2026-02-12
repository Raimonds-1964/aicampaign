import type { Account, Manager } from "./types";

export const ADMIN_ID = "admin";

export const mockManagers: Manager[] = [
  { id: "mgr-1", name: "Alex Johnson" },
  { id: "mgr-2", name: "Emily Carter" },
  { id: "mgr-3", name: "Michael Reed" },
];

export const mockAccounts: Account[] = [
  { id: "acc-1", name: "Acme Home & Kitchen", ownerId: "mgr-1" },
  { id: "acc-2", name: "Evergreen DTC Brand", ownerId: "mgr-1" },
  { id: "acc-3", name: "Sunset Auto Repair", ownerId: "mgr-2" },
  { id: "acc-4", name: "Riverside Dental Care", ownerId: "admin" },
  { id: "acc-5", name: "Summit Fitness Studio", ownerId: "admin" },
  { id: "acc-6", name: "Bluebird Real Estate Leads", ownerId: "mgr-3" },
];

import type { Account, Manager } from "./types";

export const ADMIN_ID = "admin";

export const mockManagers: Manager[] = [
  { id: "m1", name: "Anna Ozola" },
  { id: "m2", name: "Jānis Bērziņš" },
  { id: "m3", name: "Laura Kalniņa" },
];

export const mockAccounts: Account[] = [
  { id: "a1", name: "SIA Baltics Home", ownerId: "m1" },
  { id: "a2", name: "Ecom LV Brand", ownerId: "m1" },
  { id: "a3", name: "AutoServiss 24", ownerId: "m2" },
  { id: "a4", name: "Dental Clinic Riga", ownerId: "admin" },
  { id: "a5", name: "Fitness Studio", ownerId: "admin" },
  { id: "a6", name: "Real Estate Leads", ownerId: "m3" },
];

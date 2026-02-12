import type { AdminAccount as Account, AdminManager as Manager } from "./types";

export const ADMIN_ID = "admin";

export const mockManagers: Manager[] = [
  { id: "m1", name: "Emily Carter" },
  { id: "m2", name: "Michael Thompson" },
  { id: "m3", name: "Sarah Williams" },
];

export const mockAccounts: Account[] = [
  { id: "a1", name: "BrightHome Solutions", ownerId: "m1" },
  { id: "a2", name: "UrbanStyle E-commerce", ownerId: "m1" },
  { id: "a3", name: "AutoCare Plus", ownerId: "m2" },
  { id: "a4", name: "Downtown Dental Clinic", ownerId: "admin" },
  { id: "a5", name: "Peak Performance Fitness", ownerId: "admin" },
  { id: "a6", name: "Prime Realty Leads", ownerId: "m3" },
];

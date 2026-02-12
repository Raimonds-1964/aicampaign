import type { AdminAccount, AdminManager, AdminState } from "./types";
import { ADMIN_OWNER_ID } from "./types";

const managers: AdminManager[] = [
  { id: "m1", name: "Anna Ozola" },
  { id: "m2", name: "Jānis Bērziņš" },
  { id: "m3", name: "Laura Kalniņa" },
];

const accounts: AdminAccount[] = [
  { id: "a1", name: "SIA Baltics Home", ownerId: "m1" },
  { id: "a2", name: "Ecom LV – Brand", ownerId: "m1" },
  { id: "a3", name: "AutoServiss 24", ownerId: "m2" },
  { id: "a4", name: "Dental Clinic Riga", ownerId: ADMIN_OWNER_ID },
  { id: "a5", name: "Fitness Studio", ownerId: ADMIN_OWNER_ID },
  { id: "a6", name: "Real Estate Leads", ownerId: "m3" },
];

export const initialAdminState: AdminState = {
  managers,
  accounts,
};

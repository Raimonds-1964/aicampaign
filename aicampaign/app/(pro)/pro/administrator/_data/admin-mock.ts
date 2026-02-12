export type AdminAccount = {
  id: string; // acc-1
  name: string;
  googleAdsUrl?: string;
  assignedTo: string; // "admin" or manager id like "m-1"
};

export type AdminManager = {
  id: string; // "admin" or "m-1"
  name: string;
  role: "administrator" | "manager";
};

export const seedManagers: AdminManager[] = [
  { id: "admin", name: "Administrator", role: "administrator" },
  { id: "m-1", name: "Menedžeris #1", role: "manager" },
  { id: "m-2", name: "Menedžeris #2", role: "manager" },
];

export const seedAccounts: AdminAccount[] = [
  {
    id: "acc-1",
    name: "SIA Example (LV)",
    googleAdsUrl: "https://ads.google.com/",
    assignedTo: "m-1",
  },
  {
    id: "acc-2",
    name: "Agency Client #12",
    googleAdsUrl: "https://ads.google.com/",
    assignedTo: "admin",
  },
  {
    id: "acc-3",
    name: "E-com Store EU",
    googleAdsUrl: "https://ads.google.com/",
    assignedTo: "m-2",
  },
];

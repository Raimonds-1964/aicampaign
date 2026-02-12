export type AdminAccount = {
  id: string; // "acc-1"
  name: string;
  googleAdsUrl?: string;
  assignedTo: string; // "admin" or manager id like "mgr-1"
};

export type AdminManager = {
  id: string; // "admin" or "mgr-1"
  name: string;
  role: "administrator" | "manager";
};

export const seedManagers: AdminManager[] = [
  { id: "admin", name: "Platform Administrator", role: "administrator" },
  { id: "mgr-1", name: "Alex Johnson", role: "manager" },
  { id: "mgr-2", name: "Emily Carter", role: "manager" },
];

export const seedAccounts: AdminAccount[] = [
  {
    id: "acc-1",
    name: "Acme Home Supplies",
    googleAdsUrl: "https://ads.google.com/",
    assignedTo: "mgr-1",
  },
  {
    id: "acc-2",
    name: "Bright Marketing Agency",
    googleAdsUrl: "https://ads.google.com/",
    assignedTo: "admin",
  },
  {
    id: "acc-3",
    name: "Urban Streetwear Store",
    googleAdsUrl: "https://ads.google.com/",
    assignedTo: "mgr-2",
  },
];

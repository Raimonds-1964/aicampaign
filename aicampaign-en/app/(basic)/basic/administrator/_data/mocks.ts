import type { Account, Campaign } from "./types";

export const mockCampaignsForAccount = (accountId: string): Campaign[] => {
  const base: Campaign[] = [
    { id: "cmp-1", name: "Search · Lead Generation", accountId },
    { id: "cmp-2", name: "Search · Brand Campaign", accountId },
  ];

  return base;
};

export const mockKeywords = (): string[] => [
  "google ads agency",
  "ppc management services",
  "google ads specialist",
  "search ads setup",
];

export const mockNegativeKeywords = (): string[] => [
  "free",
  "jobs",
  "training",
  "salary",
];

export const ensureAccount = (a: Account | null | undefined): Account => {
  return (
    a ?? {
      id: "acc-0",
      name: "Unknown Account",
      ownerId: "admin",
    }
  );
};

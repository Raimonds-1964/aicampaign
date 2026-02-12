import type { Account, Campaign } from "./types";

export const mockCampaignsForAccount = (accountId: string): Campaign[] => {
  const base: Campaign[] = [
    { id: "c1", name: "Search · Leads", accountId },
    { id: "c2", name: "Search · Brand", accountId },
  ];
  return base;
};

export const mockKeywords = (): string[] => [
  "google ads agency",
  "ppc management",
  "google ads specialist",
  "search ads setup",
];

export const mockNegativeKeywords = (): string[] => [
  "free",
  "jobs",
  "course",
  "salary",
];

export const ensureAccount = (a: Account | null | undefined): Account => {
  return (
    a ?? {
      id: "a0",
      name: "Unknown account",
      ownerId: "admin",
    }
  );
};

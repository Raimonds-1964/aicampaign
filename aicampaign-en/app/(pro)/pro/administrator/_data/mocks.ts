import type { Account, Campaign } from "./types";
import { ADMIN_ID } from "./adminMockData";

export const mockCampaignsForAccount = (accountId: string): Campaign[] => {
  return [
    { id: "cmp-1", name: "Search · Lead Generation", accountId },
    { id: "cmp-2", name: "Search · Brand Protection", accountId },
  ];
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
  "course",
  "salary",
];

export const ensureAccount = (account: Account | null | undefined): Account => {
  return (
    account ?? {
      id: "acc-0",
      name: "Unknown Account",
      ownerId: ADMIN_ID,
    }
  );
};

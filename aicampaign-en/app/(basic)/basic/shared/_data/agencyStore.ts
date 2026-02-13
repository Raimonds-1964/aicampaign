"use client";

import { create } from "zustand";

export type CampaignStatus = "active" | "paused";
export type CampaignHealth = "ok" | "warning" | "critical";

export type Campaign = {
  id: string;
  accountId: string;
  name: string;
  status: CampaignStatus;

  /** 0..100 */
  health: number;
  healthLabel: CampaignHealth;

  dailyBudget: number;
  spentToday: number;

  googleAdsUrl?: string;
};

export type Account = {
  id: string;
  name: string;
  googleAdsUrl?: string;
};

export type Limits = {
  maxAccounts: number;
  maxCampaignsPerAccount: number;
};

export type AgencyState = {
  limits: Limits;

  accounts: Account[];
  campaigns: Campaign[];

  addOwnAccount: () => void;
  addAiAccount: () => void;

  deleteCampaign: (campaignId: string) => void;
};

function inferHealthLabel(h: number): CampaignHealth {
  if (h >= 70) return "ok";
  if (h >= 40) return "warning";
  return "critical";
}

function clampToLimits(state: Pick<AgencyState, "limits" | "accounts" | "campaigns">) {
  const { limits } = state;

  const accounts = state.accounts.slice(0, limits.maxAccounts);
  const allowedAccountIds = new Set(accounts.map((a) => a.id));

  // Basic: max 5 campaigns per account
  const campaigns = state.campaigns
    .filter((c) => allowedAccountIds.has(c.accountId))
    .slice(0, limits.maxCampaignsPerAccount);

  return { accounts, campaigns };
}

function buildDemoCampaigns(accountId: string, kind: "ai" | "own"): Campaign[] {
  const baseUrl = "https://ads.google.com/";
  const prefix = kind === "ai" ? "AI" : "My";

  return [
    {
      id: `${kind}-c-101`,
      accountId,
      name: `${prefix} Brand — Search`,
      status: "active",
      health: 86,
      healthLabel: inferHealthLabel(86),
      dailyBudget: 30,
      spentToday: 18.6,
      googleAdsUrl: baseUrl,
    },
    {
      id: `${kind}-c-102`,
      accountId,
      name: `${prefix} Search — Services`,
      status: "active",
      health: 72,
      healthLabel: inferHealthLabel(72),
      dailyBudget: 25,
      spentToday: 12.1,
      googleAdsUrl: baseUrl,
    },
    {
      id: `${kind}-c-103`,
      accountId,
      name: `${prefix} Search — High-Intent Keywords`,
      status: "paused",
      health: 64,
      healthLabel: inferHealthLabel(64),
      dailyBudget: 20,
      spentToday: 0,
      googleAdsUrl: baseUrl,
    },
    {
      id: `${kind}-c-104`,
      accountId,
      name: `${prefix} Search — Competitor Queries`,
      status: "active",
      health: 48,
      healthLabel: inferHealthLabel(48),
      dailyBudget: 18,
      spentToday: 9.4,
      googleAdsUrl: baseUrl,
    },
    {
      id: `${kind}-c-105`,
      accountId,
      name: `${prefix} Remarketing — Returning Visitors`,
      status: "active",
      health: 79,
      healthLabel: inferHealthLabel(79),
      dailyBudget: 15,
      spentToday: 6.8,
      googleAdsUrl: baseUrl,
    },
  ];
}

export const useAgencyStore = create<AgencyState>((set, get) => {
  const limits: Limits = {
    maxAccounts: 1,
    maxCampaignsPerAccount: 5,
  };

  // ✅ Start with a demo account + 5 campaigns (as requested)
  const initialAccounts: Account[] = [
    {
      id: "acc-1",
      name: "Acme Demo Account",
      googleAdsUrl: "https://ads.google.com/",
    },
  ];

  const initialCampaigns: Campaign[] = buildDemoCampaigns("acc-1", "ai");

  return {
    limits,
    accounts: initialAccounts,
    campaigns: initialCampaigns,

    addOwnAccount: () => {
      const { limits } = get();
      const accountId = "acc-own-1";

      const next = {
        ...get(),
        accounts: [
          { id: accountId, name: "My Account", googleAdsUrl: "https://ads.google.com/" },
        ],
        campaigns: buildDemoCampaigns(accountId, "own"),
      };

      const clamped = clampToLimits(next);
      set({ ...clamped, limits });
    },

    addAiAccount: () => {
      const { limits } = get();
      const accountId = "acc-ai-1";

      const next = {
        ...get(),
        accounts: [
          { id: accountId, name: "AI Demo Account", googleAdsUrl: "https://ads.google.com/" },
        ],
        campaigns: buildDemoCampaigns(accountId, "ai"),
      };

      const clamped = clampToLimits(next);
      set({ ...clamped, limits });
    },

    deleteCampaign: (campaignId: string) => {
      const { limits } = get();
      const next = {
        ...get(),
        campaigns: get().campaigns.filter((c) => String(c.id) !== String(campaignId)),
      };
      const clamped = clampToLimits(next);
      set({ ...clamped, limits });
    },
  };
});

export function getAgencyStore() {
  return useAgencyStore.getState();
}

export const agencySelectors = {
  accountById: (s: ReturnType<typeof useAgencyStore.getState>, id: string) =>
    s.accounts.find((a) => String(a.id) === String(id)),
  campaignsByAccountId: (s: ReturnType<typeof useAgencyStore.getState>, accountId: string) =>
    s.campaigns.filter((c) => String(c.accountId) === String(accountId)),
};

export type KeywordRow = {
  keyword: string;
  matchType: "BROAD" | "PHRASE" | "EXACT";
  isNegative?: boolean;
};

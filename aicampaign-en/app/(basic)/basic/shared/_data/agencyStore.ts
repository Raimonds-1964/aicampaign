"use client";

import { create } from "zustand";

export type CampaignStatus = "active" | "paused";
export type CampaignHealth = "ok" | "warning" | "critical";

export type Campaign = {
  id: string;
  accountId: string;
  name: string;
  status: CampaignStatus;

  /** 0..100 (overall campaign health) */
  health: number;

  /** string label for UI */
  healthLabel: CampaignHealth;

  /** ✅ alias for UI components that expect "ok|warning|critical" */
  healthStatus: CampaignHealth;

  dailyBudget: number;
  spentToday: number;

  /** 0..999 (spentToday / dailyBudget * 100), useful for UI pills */
  budgetPct: number;

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

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function calcBudgetPct(spent: number, budget: number) {
  const s = Number(spent) || 0;
  const b = Number(budget) || 0;
  if (!b || b <= 0) return 0;
  return clamp((s / b) * 100, 0, 999);
}

function inferHealthLabel(h: number): CampaignHealth {
  if (h >= 70) return "ok";
  if (h >= 40) return "warning";
  return "critical";
}

function normalizeCampaign(raw: Omit<Campaign, "budgetPct" | "healthStatus">): Campaign {
  const dailyBudget = Number(raw.dailyBudget) || 0;
  const spentToday = Number(raw.spentToday) || 0;

  const healthLabel = raw.healthLabel ?? inferHealthLabel(Number(raw.health) || 0);

  return {
    ...raw,
    dailyBudget,
    spentToday,
    budgetPct: calcBudgetPct(spentToday, dailyBudget),
    healthLabel,
    healthStatus: healthLabel, // ✅ important for UI
  };
}

function clampToLimits(state: Pick<AgencyState, "limits" | "accounts" | "campaigns">) {
  const { limits } = state;

  const accounts = state.accounts.slice(0, limits.maxAccounts);
  const allowedAccountIds = new Set(accounts.map((a) => a.id));

  const campaigns = state.campaigns
    .filter((c) => allowedAccountIds.has(c.accountId))
    .slice(0, limits.maxCampaignsPerAccount);

  return { accounts, campaigns };
}

function buildDemoCampaigns(accountId: string, kind: "ai" | "own"): Campaign[] {
  const baseUrl = "https://ads.google.com/";
  const prefix = kind === "ai" ? "AI" : "My";

  const raw = [
    {
      id: `${kind}-c-101`,
      accountId,
      name: `${prefix} Brand — Search`,
      status: "active" as const,
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
      status: "active" as const,
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
      status: "paused" as const,
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
      status: "active" as const,
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
      status: "active" as const,
      health: 79,
      healthLabel: inferHealthLabel(79),
      dailyBudget: 15,
      spentToday: 6.8,
      googleAdsUrl: baseUrl,
    },
  ];

  return raw.map(normalizeCampaign);
}

export const useAgencyStore = create<AgencyState>((set, get) => {
  const limits: Limits = {
    maxAccounts: 1,
    maxCampaignsPerAccount: 5,
  };

  const initialAccounts: Account[] = [
    {
      id: "acc-1",
      name: "Acme Home Services",
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
        accounts: [{ id: accountId, name: "My Account", googleAdsUrl: "https://ads.google.com/" }],
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
        accounts: [{ id: accountId, name: "AI Account", googleAdsUrl: "https://ads.google.com/" }],
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

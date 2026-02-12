// app/(agency)/agency/manager/_data/accounts.ts

export type AccountHealth = "ok" | "warning" | "critical";
export type CheckStatus = "ok" | "warning" | "critical";

export type Account = {
  id: string;
  name: string;
  health: AccountHealth;
  googleAdsUrl?: string;
};

export type Campaign = {
  id: string;
  accountId: string;
  name: string;
  status: "enabled" | "paused";
  health?: AccountHealth;
  googleAdsUrl?: string;
};

export type KeywordRow = {
  keyword: string;
  matchType: "Exact" | "Phrase" | "Broad";
  page1: number;
  top: number;
  clicks: number;
  cost: number;
  note?: string;
};

export type CampaignCheck = {
  key: string;
  title: string;
  status: CheckStatus;
  summary: string;
  aiSuggestion: string;
  canAutoFix?: boolean;
  googleAdsUrl?: string;
  details?: { kind: "keywords"; rows: KeywordRow[] };
};

export type BudgetToday = {
  dailyBudgetUsd: number;
  spentTodayUsd: number;
};

// ✅ Single source of truth: shared store
import {
  getAgencyStore,
  agencySelectors,
  type Campaign as SharedCampaign,
} from "@/app/(agency)/agency/shared/_data/agencyStore";

function mapStatus(s: SharedCampaign["status"]): Campaign["status"] {
  return s === "active" ? "enabled" : "paused";
}

function mapHealth(h?: SharedCampaign["health"]): AccountHealth {
  if (!h) return "ok";
  return h;
}

/** ===== Demo check data (kept for Manager campaign detail cards) ===== */
const kwRows: KeywordRow[] = [
  {
    keyword: "services in austin",
    matchType: "Phrase",
    page1: 62,
    top: 28,
    clicks: 41,
    cost: 72.4,
    note: "Top of page share is low",
  },
  {
    keyword: "brand name",
    matchType: "Exact",
    page1: 88,
    top: 61,
    clicks: 55,
    cost: 34.2,
  },
  {
    keyword: "local business",
    matchType: "Broad",
    page1: 35,
    top: 12,
    clicks: 19,
    cost: 51.0,
    note: "Rarely reaches page 1",
  },
  {
    keyword: "service pricing",
    matchType: "Phrase",
    page1: 49,
    top: 22,
    clicks: 26,
    cost: 63.8,
  },
];

function visibilityStatus(rows: KeywordRow[]): CheckStatus {
  const avgPage1 = rows.reduce((s, r) => s + r.page1, 0) / rows.length;
  const avgTop = rows.reduce((s, r) => s + r.top, 0) / rows.length;
  if (avgPage1 < 40) return "critical";
  if (avgTop < 35) return "warning";
  return "ok";
}

// ✅ Demo checks for specific campaigns (by ID)
export const campaignChecksById: Record<string, CampaignCheck[]> = {
  "c-101": [
    {
      key: "visibility",
      title: "Keyword visibility (page 1 / top of page)",
      status: visibilityStatus(kwRows),
      summary:
        "Some keywords are on page 1, but top-of-page visibility is often too low.",
      aiSuggestion:
        "Increase bids for the highest-potential keywords and tighten match types where needed.",
      canAutoFix: true,
      details: { kind: "keywords", rows: kwRows },
      googleAdsUrl: "https://ads.google.com/",
    },
    {
      key: "search_terms",
      title: "Search terms (irrelevant queries)",
      status: "critical",
      summary:
        "Spend is going to irrelevant queries (missing negative keywords).",
      aiSuggestion:
        "Add negative keywords based on the highest-spend queries.",
      canAutoFix: true,
      googleAdsUrl: "https://ads.google.com/",
    },
  ],
};

/** ===== Public helpers (now synced with the shared store) ===== */
export const getAccountById = (id: string) => {
  const s = getAgencyStore();
  const acc = agencySelectors.accountById(s, id);
  if (!acc) return undefined;
  return {
    id: acc.id,
    name: acc.name,
    health: "warning" as AccountHealth, // demo
    googleAdsUrl: "https://ads.google.com/",
  };
};

export const getCampaignsByAccountId = (accountId: string) => {
  const s = getAgencyStore();
  const list = agencySelectors.campaignsByAccountId(s, accountId);
  return list.map((c) => ({
    id: c.id,
    accountId,
    name: c.name,
    status: mapStatus(c.status),
    health: mapHealth(c.health),
    googleAdsUrl: "https://ads.google.com/",
  }));
};

export const getCampaignById = (id: string) => {
  const s = getAgencyStore();
  const c = agencySelectors.campaignById(s, id);
  if (!c) return undefined;
  return {
    id: c.id,
    accountId: (c as any).accountId ?? "", // agencySelectors.campaignById returns a flattened object with accountId
    name: c.name,
    status: mapStatus(c.status),
    health: mapHealth(c.health),
    googleAdsUrl: "https://ads.google.com/",
  };
};

export const getChecksByCampaignId = (campaignId: string) =>
  campaignChecksById[campaignId] ?? [];

export const getBudgetTodayByCampaignId = (
  campaignId: string
): BudgetToday | undefined => {
  const s = getAgencyStore();
  const c = agencySelectors.campaignById(s, campaignId);
  if (!c) return undefined;
  return {
    dailyBudgetUsd: Number((c as any).dailyBudget ?? 0),
    spentTodayUsd: Number((c as any).spentToday ?? 0),
  };
};

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
  dailyBudgetEur: number;
  spentTodayEur: number;
};

// ✅ Vienīgais patiesais avots: shared store
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

/** ===== Demo check data (paliek, ja gribi Manager detaļās kartītes) ===== */
const kwRows: KeywordRow[] = [
  { keyword: "pakalpojumi rīga", matchType: "Phrase", page1: 62, top: 28, clicks: 41, cost: 72.4, note: "TOP par zemu" },
  { keyword: "brand nosaukums", matchType: "Exact", page1: 88, top: 61, clicks: 55, cost: 34.2 },
  { keyword: "uzņēmums lv", matchType: "Broad", page1: 35, top: 12, clicks: 19, cost: 51.0, note: "Reti 1. lapā" },
  { keyword: "pakalpojums cena", matchType: "Phrase", page1: 49, top: 22, clicks: 26, cost: 63.8 },
];

function visibilityStatus(rows: KeywordRow[]): CheckStatus {
  const avgPage1 = rows.reduce((s, r) => s + r.page1, 0) / rows.length;
  const avgTop = rows.reduce((s, r) => s + r.top, 0) / rows.length;
  if (avgPage1 < 40) return "critical";
  if (avgTop < 35) return "warning";
  return "ok";
}

// ✅ Demo checks tikai dažām kampaņām (pēc ID)
export const campaignChecksById: Record<string, CampaignCheck[]> = {
  "c-101": [
    {
      key: "visibility",
      title: "Atslēgvārdu redzamība (1. lapa / TOP)",
      status: visibilityStatus(kwRows),
      summary: "Daļa atslēgvārdu ir 1. lapā, bet TOP redzamība bieži ir par zemu.",
      aiSuggestion: "Paaugstini bid prioritāri atslēgvārdiem ar labāko potenciālu un sakārto match type.",
      canAutoFix: true,
      details: { kind: "keywords", rows: kwRows },
      googleAdsUrl: "https://ads.google.com/",
    },
    {
      key: "search_terms",
      title: "Search Terms (nevēlamie vaicājumi)",
      status: "critical",
      summary: "Ir izdevumi uz nerelevantiem vaicājumiem (trūkst negatīvo atslēgvārdu).",
      aiSuggestion: "Pievieno negatīvos atslēgvārdus pēc top spend vaicājumiem.",
      canAutoFix: true,
      googleAdsUrl: "https://ads.google.com/",
    },
  ],
};

/** ===== Public helpers (tagad sinhronizēti) ===== */
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
    accountId: (c as any).accountId ?? "", // agencySelectors.campaignById atgriež flatten ar accountId
    name: c.name,
    status: mapStatus(c.status),
    health: mapHealth(c.health),
    googleAdsUrl: "https://ads.google.com/",
  };
};

export const getChecksByCampaignId = (campaignId: string) =>
  campaignChecksById[campaignId] ?? [];

export const getBudgetTodayByCampaignId = (campaignId: string): BudgetToday | undefined => {
  const s = getAgencyStore();
  const c = agencySelectors.campaignById(s, campaignId);
  if (!c) return undefined;
  return {
    dailyBudgetEur: Number(c.dailyBudget ?? 0),
    spentTodayEur: Number(c.spentToday ?? 0),
  };
};

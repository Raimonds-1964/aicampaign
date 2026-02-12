export type Plan = "easy" | "basic" | "pro" | "agency";

export type Sitelink = {
  title: string;
  url: string;
};

export type CampaignAssets = {
  // RSA assets
  headlines: string[]; // 6
  descriptions: string[]; // 4

  // Sitelinks
  sitelinks: Sitelink[]; // 4

  // Keywords
  keywords: string[]; // 8–12
  negativeKeywords: string[]; // 5–8
};

export type CampaignDraftInput = {
  uri: string;
  industry?: string;
  campaignName?: string;
  goal?: string;
  location?: string;
  language?: string;
  dailyBudget?: number;
};

export type CampaignDraft = {
  plan: Plan;
  input: CampaignDraftInput;
  campaign: {
    name: string;
    dailyBudget?: number;
    location?: string;
    language?: string;
    assets: CampaignAssets;
    adGroups?: any[]; // legacy, lai nesalauž veco
  };
};

// ✅ šo izmanto UI -> services/generateCampaign.ts
export type GenerateCampaignInput = {
  url: string; // galamērķa URL (raw)
  industry?: string;
  campaignName?: string;
  goal?: string;
  location?: string;
  language?: string;
  dailyBudget?: number;
  plan: Plan;
};

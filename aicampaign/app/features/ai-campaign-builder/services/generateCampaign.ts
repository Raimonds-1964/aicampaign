import type { CampaignDraft, GenerateCampaignInput } from "../state/types";

function normalizeUrl(raw: string): string {
  const v = String(raw ?? "").trim();
  if (!v) return "";

  const candidate =
    v.startsWith("http://") || v.startsWith("https://") ? v : `https://${v}`;

  try {
    const u = new URL(candidate);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    if (!u.hostname || !u.hostname.includes(".")) return "";
    return u.toString();
  } catch {
    return "";
  }
}

export async function generateCampaign(input: GenerateCampaignInput): Promise<CampaignDraft> {
  const normalized = normalizeUrl(input.url);
  if (!normalized) throw new Error("Nederīgs URL. Piemērs: https://example.com");

  const res = await fetch("/api/ai/campaign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: normalized,
      industry: input.industry,
      campaignName: input.campaignName,
      goal: input.goal,
      location: input.location,
      language: input.language,
      dailyBudget: input.dailyBudget,
      plan: input.plan,
    }),
  });

  const data = await res.json().catch(() => ({} as any));
  if (!res.ok) throw new Error(data?.error || "Neizdevās ģenerēt kampaņu.");
  return data as CampaignDraft;
}

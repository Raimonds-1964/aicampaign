import { NextResponse } from "next/server";
import type { CampaignDraft, Plan } from "../../../features/ai-campaign-builder/state/types";

export const runtime = "nodejs";

type Body = {
  url: string;
  industry?: string;
  campaignName?: string;
  goal?: string;
  location?: string;
  language?: string;
  dailyBudget?: number;
  plan?: Plan | string;
};

function safeUrl(raw: string) {
  const v = String(raw ?? "").trim();
  if (!v) return "";
  const candidate = v.startsWith("http://") || v.startsWith("https://") ? v : `https://${v}`;
  try {
    const u = new URL(candidate);
    if (!u.hostname || !u.hostname.includes(".")) return "";
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    return u.toString();
  } catch {
    return "";
  }
}

function pickPlan(p: any): Plan {
  const v = String(p ?? "pro");
  if (v === "basic" || v === "pro" || v === "agency") return v;
  // "easy" looked like legacy; default to pro if unknown
  return "pro";
}

function clampStr(s: any, max: number) {
  const v = String(s ?? "").trim();
  return v.length > max ? v.slice(0, max) : v;
}

// Server-side trimming (word-boundary) for safety
function smartTrim(raw: any, max: number) {
  const v = String(raw ?? "").trim();
  if (!v) return "";
  if (v.length <= max) return v;

  const slice = v.slice(0, max);
  const lastBreak = Math.max(
    slice.lastIndexOf(" "),
    slice.lastIndexOf("."),
    slice.lastIndexOf(","),
    slice.lastIndexOf(";"),
    slice.lastIndexOf(":"),
    slice.lastIndexOf("–"),
    slice.lastIndexOf("-")
  );

  if (lastBreak >= Math.floor(max * 0.65)) return slice.slice(0, lastBreak).trim();
  return slice.trim();
}

function uniq(arr: string[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const x of arr) {
    const v = String(x ?? "").trim();
    if (!v) continue;
    const k = v.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(v);
  }
  return out;
}

function keywordFallback(url: string, industry: string, goal: string) {
  const host = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  const base = [
    industry,
    industry ? `${industry} near me` : "",
    host ? host : "",
    goal === "sales" ? "buy" : "",
    goal === "leads" ? "get a quote" : "",
    goal === "traffic" ? "find" : "",
  ].filter(Boolean);

  const kw = uniq(
    [
      ...base,
      industry ? `${industry} pricing` : "",
      industry ? `${industry} services` : "",
      industry ? `${industry} in my area` : "",
      industry ? `"${industry}"` : "",
      host ? `"${host}"` : "",
    ].filter(Boolean)
  );

  const neg = uniq([
    "free",
    "jobs",
    "careers",
    "vacancies",
    "how to",
    "manual",
    "pdf",
    "wiki",
    "definition",
  ]);

  return { kw: kw.slice(0, 12), neg: neg.slice(0, 8) };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const url = safeUrl(body.url);
    if (!url) return NextResponse.json({ error: "Invalid URL." }, { status: 400 });

    const plan = pickPlan(body.plan);

    const industry = clampStr(body.industry ?? "", 80);
    const campaignName = clampStr(body.campaignName ?? "", 90);

    // Prefer US English defaults for a US-market product
    const goal = clampStr(body.goal ?? "leads", 60);
    const location = clampStr(body.location ?? "United States", 80);
    const language = clampStr(body.language ?? "en-US", 10);

    // Assume USD/day; keep numeric on server
    const dailyBudget = Number.isFinite(body.dailyBudget as number) ? Number(body.dailyBudget) : 20;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing OPENAI_API_KEY." }, { status: 500 });

    const system = [
      "You are an experienced Google Ads specialist.",
      "Write clear, natural, US English copy using correct Google Ads terminology.",
      "Do not cut off mid-sentence.",
      "Strict limits:",
      "- headlines: exactly 6 items, each <= 30 characters",
      "- descriptions: exactly 4 items, each <= 90 characters",
      "- keywords: 8 to 12 items",
      "- negativeKeywords: 5 to 8 items",
      "- sitelinks: exactly 4 items, title <= 25 characters",
      "Return ONLY valid JSON. No markdown. No extra text.",
    ].join(" ");

    const user = {
      input: {
        url,
        industry: industry || null,
        campaignName: campaignName || null,
        goal,
        location,
        language,
        dailyBudget,
        currency: "USD",
      },
      output_schema: {
        campaign: {
          name: "string",
          assets: {
            headlines: ["string"],
            descriptions: ["string"],
            keywords: ["string"],
            negativeKeywords: ["string"],
            sitelinks: [{ title: "string", url: "string" }],
          },
        },
      },
    };

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.25,
        messages: [
          { role: "system", content: system },
          { role: "user", content: JSON.stringify(user) },
        ],
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return NextResponse.json(
        { error: "OpenAI API error", details: txt.slice(0, 1200) },
        { status: 500 }
      );
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "No content returned by the AI." }, { status: 500 });
    }

    let parsed: any = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      const s = content.indexOf("{");
      const e = content.lastIndexOf("}");
      if (s >= 0 && e > s) parsed = JSON.parse(content.slice(s, e + 1));
    }

    const a = parsed?.campaign?.assets ?? {};

    const headlines = (Array.isArray(a.headlines) ? a.headlines : [])
      .map((x: any) => smartTrim(x, 30))
      .filter(Boolean)
      .slice(0, 6);

    const descriptions = (Array.isArray(a.descriptions) ? a.descriptions : [])
      .map((x: any) => smartTrim(x, 90))
      .filter(Boolean)
      .slice(0, 4);

    const sitelinks = (Array.isArray(a.sitelinks) ? a.sitelinks : [])
      .map((s: any) => ({ title: smartTrim(s?.title, 25), url: String(s?.url ?? "").trim() }))
      .filter((s: any) => s.title && s.url)
      .slice(0, 4);

    const kwRaw = Array.isArray(a.keywords) ? a.keywords : [];
    const negRaw = Array.isArray(a.negativeKeywords) ? a.negativeKeywords : [];

    const fallback = keywordFallback(url, industry, goal);

    const keywords = uniq(kwRaw.map((x: any) => String(x).trim())).slice(0, 12);
    const negativeKeywords = uniq(negRaw.map((x: any) => String(x).trim())).slice(0, 8);

    const finalKeywords = keywords.length ? keywords : fallback.kw;
    const finalNegative = negativeKeywords.length ? negativeKeywords : fallback.neg;

    const draft: CampaignDraft = {
      plan,
      input: {
        uri: url,
        industry,
        campaignName,
        goal,
        location,
        language,
        dailyBudget,
      },
      campaign: {
        name: clampStr(parsed?.campaign?.name ?? campaignName ?? "Search Campaign", 90),
        dailyBudget,
        location,
        language,
        assets: {
          headlines,
          descriptions,
          keywords: finalKeywords,
          negativeKeywords: finalNegative,
          sitelinks,
        },
      },
    };

    return NextResponse.json(draft);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Server error", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

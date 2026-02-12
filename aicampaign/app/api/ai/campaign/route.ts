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
  if (v === "easy" || v === "basic" || v === "pro" || v === "agency") return v;
  return "pro";
}

function clampStr(s: any, max: number) {
  const v = String(s ?? "").trim();
  return v.length > max ? v.slice(0, max) : v;
}

// server-side trim tikai drošībai — uz vārdu robežas
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
    industry ? `${industry} Latvijā` : "",
    host ? host : "",
    goal === "sales" ? "pirkt" : "",
    goal === "leads" ? "pieteikties" : "",
    goal === "traffic" ? "meklēt" : "",
  ].filter(Boolean);

  const kw = uniq(
    [
      ...base,
      industry ? `${industry} cenas` : "",
      industry ? `${industry} pakalpojumi` : "",
      industry ? `${industry} Rīgā` : "",
      industry ? `"${industry}"` : "",
      host ? `"${host}"` : "",
    ].filter(Boolean)
  );

  const neg = uniq(["bez maksas", "darbā", "vakances", "lietošanas instrukcija", "pdf", "wiki"]);

  return { kw: kw.slice(0, 12), neg: neg.slice(0, 8) };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const url = safeUrl(body.url);
    if (!url) return NextResponse.json({ error: "Nederīgs URL." }, { status: 400 });

    const plan = pickPlan(body.plan);
    const industry = clampStr(body.industry ?? "", 80);
    const campaignName = clampStr(body.campaignName ?? "", 90);
    const goal = clampStr(body.goal ?? "leads", 60);
    const location = clampStr(body.location ?? "Latvia", 80);
    const language = clampStr(body.language ?? "lv", 10);
    const dailyBudget = Number.isFinite(body.dailyBudget as number) ? Number(body.dailyBudget) : 20;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Nav OPENAI_API_KEY." }, { status: 500 });

    const system = [
      "Tu esi pieredzējis Google Ads speciālists.",
      "Raksti gramatiski pareizi, loģiski un dabiski.",
      "NEDRĪKST apraut pusvārdā.",
      "STINGRI limiti:",
      "- headlines: 6 gab, katrs <=30 simboli",
      "- descriptions: 4 gab, katrs <=90 simboli",
      "- keywords: 8-12 gab",
      "- negativeKeywords: 5-8 gab",
      "- sitelinks: 4 gab, title <=25 simboli",
      "Atgriez tikai derīgu JSON, bez markdown, bez teksta.",
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
      return NextResponse.json({ error: "OpenAI kļūda", details: txt.slice(0, 1200) }, { status: 500 });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Nav saņemts saturs no AI." }, { status: 500 });
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
        name: clampStr(parsed?.campaign?.name ?? campaignName ?? "Search kampaņa", 90),
        dailyBudget,
        location,
        language,
        assets: {
          headlines: headlines.length ? headlines : [],
          descriptions: descriptions.length ? descriptions : [],
          keywords: finalKeywords,
          negativeKeywords: finalNegative,
          sitelinks: sitelinks.length ? sitelinks : [],
        },
      },
    };

    return NextResponse.json(draft);
  } catch (e: any) {
    return NextResponse.json({ error: "Servera kļūda", details: String(e?.message ?? e) }, { status: 500 });
  }
}

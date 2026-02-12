import { NextResponse } from "next/server";
import OpenAI from "openai";

type Lang = "lv" | "en";

function jsonError(error: string, message: string, status = 400, details?: any) {
  return NextResponse.json({ ok: false, error, message, details }, { status });
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}$/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {}
    }
    return null;
  }
}

function clampWordsNoEllipsis(s: string, max: number) {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (t.length <= max) return t;

  const words = t.split(" ");
  while (words.length > 0) {
    const cand = words.join(" ");
    if (cand.length <= max) return cand;
    words.pop();
  }
  return "";
}

function cleanList(arr: any, max: number) {
  if (!Array.isArray(arr)) return [];
  const out: string[] = [];
  for (const x of arr) {
    const t = String(x || "").replace(/\s+/g, " ").trim();
    if (!t) continue;
    if (!out.includes(t)) out.push(t);
    if (out.length >= max) break;
  }
  return out;
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return jsonError("OPENAI_NOT_CONFIGURED", "Nav iestatīts OPENAI_API_KEY .env.local failā.");
    }

    const body = (await req.json().catch(() => null)) as
      | {
          lang?: Lang;
          url?: string;
          siteName?: string;
          displayUrl?: string;
          pageText?: string;
          links?: Array<{ url: string; text: string | null }>;
        }
      | null;

    const lang: Lang = body?.lang === "en" ? "en" : "lv";
    const url = String(body?.url || "").trim();
    const siteName = String(body?.siteName || "").trim();
    const displayUrl = String(body?.displayUrl || "").trim();
    const pageText = String(body?.pageText || "").trim();
    const links = Array.isArray(body?.links) ? body?.links : [];

    if (!url || !pageText) {
      return jsonError("MISSING_INPUT", "Trūkst url vai pageText.");
    }

    const linksText = links
      .slice(0, 30)
      .map((l) => `- ${String(l.text || "").trim()} | ${String(l.url || "").trim()}`.trim())
      .join("\n");

    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = `
You are an expert Google Ads copywriter.
Return ONLY strict JSON.
No markdown. No extra commentary.
`;

    const user = `
Create a Google Search ad preview based on the website content.

LANGUAGE: ${lang === "en" ? "English" : "Latvian"}

IMPORTANT RULES:
- Do NOT include domain name or website name inside headlines/descriptions/sitelinks.
- Headlines must be <= 30 characters each (no ellipses).
- Descriptions must be 2 separate lines, each <= 90 characters (no ellipses).
- Sitelinks must be 4 items, each <= 25 characters (no ellipses).
- Text must be natural and grammatical.
- Avoid technical/navigation words (cart, filters, login, cookies, etc.).
- Ensure description2 differs from description1.
- Ensure sitelinks differ from each other.

INPUT:
URL: ${url}
SITE NAME: ${siteName || "(unknown)"}
DISPLAY URL: ${displayUrl || "(unknown)"}

WEBSITE TEXT (cleaned):
${pageText.slice(0, 6500)}

POSSIBLE LINKS:
${linksText || "(none)"}

OUTPUT JSON SCHEMA:
{
  "keywords": ["... up to 12 short keywords ..."],
  "ad": {
    "headline1": "...",
    "headline2": "...",
    "headline3": "...",
    "description1": "...",
    "description2": "..."
  },
  "sitelinks": ["...", "...", "...", "..."]
}
`;

    const resp = (await (openai as any).responses.create({
      model,
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
    })) as any;

    const text =
      resp?.output_text ||
      resp?.output?.[0]?.content?.[0]?.text ||
      resp?.output?.map?.((o: any) => o?.content?.map?.((c: any) => c?.text).join("\n")).join("\n") ||
      "";

    const json = safeJsonParse(String(text || "").trim());
    if (!json) {
      return jsonError("OPENAI_BAD_JSON", "OpenAI neatgrieza derīgu JSON.", 400, { raw: text });
    }

    const keywords = cleanList(json.keywords, 12).map((k) => clampWordsNoEllipsis(k, 28));
    const sitelinks = cleanList(json.sitelinks, 4).map((s) => clampWordsNoEllipsis(s, 25));

    const ad = json.ad || {};
    const out = {
      keywords,
      ad: {
        headline1: clampWordsNoEllipsis(ad.headline1, 30),
        headline2: clampWordsNoEllipsis(ad.headline2, 30),
        headline3: clampWordsNoEllipsis(ad.headline3, 30),
        description1: clampWordsNoEllipsis(ad.description1, 90),
        description2: clampWordsNoEllipsis(ad.description2, 90),
      },
      sitelinks: sitelinks.length === 4 ? sitelinks : [...sitelinks, "", "", "", ""].slice(0, 4),
    };

    if (!out.ad.headline1 || !out.ad.description1) {
      return jsonError("OPENAI_EMPTY", "OpenAI atgrieza tukšu saturu.", 400, { raw: json });
    }

    return NextResponse.json({ ok: true, ...out });
  } catch (e: any) {
    return jsonError("OPENAI_FAILED", "Neizdevās ģenerēt ar OpenAI.", 500, {
      message: e?.message,
      type: e?.type,
      code: e?.code,
    });
  }
}

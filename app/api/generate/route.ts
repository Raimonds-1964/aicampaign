import OpenAI from "openai";
import { NextResponse } from "next/server";

type Lang = "lv" | "en";
type Plan = "FREE" | "PRO";

function jsonError(error: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, error, message, details }, { status });
}

function normalizeInputUrl(raw: string) {
  const v = (raw || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  // allow "www..." or "domain.com"
  if (/^www\./i.test(v) || /^[a-z0-9.-]+\.[a-z]{2,}([/?:#]|$)/i.test(v)) return `https://${v}`;
  return v;
}

function basicDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

function safeDisplayUrl(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./i, "");
    const p = (u.pathname || "").replace(/\/+$/, "");
    if (!p || p === "/") return host;
    return `${host}${p}`;
  } catch {
    return url;
  }
}

function clampArrayStrings(arr: unknown, maxItems: number, maxLen: number) {
  const out: string[] = [];
  if (!Array.isArray(arr)) return out;
  for (const v of arr) {
    if (typeof v !== "string") continue;
    const t = v.replace(/\s+/g, " ").trim();
    if (!t) continue;
    out.push(t.length > maxLen ? t.slice(0, maxLen).trim() : t);
    if (out.length >= maxItems) break;
  }
  return out;
}

function clampStr(v: unknown, maxLen: number) {
  if (typeof v !== "string") return "";
  const t = v.replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.length > maxLen ? t.slice(0, maxLen).trim() : t;
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return jsonError("OPENAI_NOT_CONFIGURED", "Nav iestatīts OPENAI_API_KEY .env.local failā.");
    }

    const body = (await req.json().catch(() => null)) as
      | {
          url?: string;
          lang?: Lang;
          plan?: Plan;
          pageText?: string; // cleaned text from fetch-url
          links?: Array<{ url: string; text: string | null }>;
        }
      | null;

    const url = normalizeInputUrl(body?.url || "");
    const lang: Lang = body?.lang === "en" ? "en" : "lv";
    const plan: Plan = body?.plan === "PRO" ? "PRO" : "FREE";

    if (!url) return jsonError("MISSING_URL", "Trūkst url.");
    try {
      new URL(url);
    } catch {
      return jsonError("INVALID_URL", "Nederīgs URL. Piemērs: www.example.com vai https://example.com");
    }

    const domain = basicDomain(url) || "example.com";
    const displayUrl = safeDisplayUrl(url);

    // Saudzējam tokenus: paņemam pietiekami, bet ne visu lapu
    const rawText = String(body?.pageText || "");
    const pageText = rawText
      .replace(/\u0000/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);

    const rawLinks = Array.isArray(body?.links) ? body!.links! : [];
    const linkHints = rawLinks
      .slice(0, 40)
      .map((l) => ({
        url: typeof l?.url === "string" ? l.url : "",
        text: typeof l?.text === "string" ? l.text : null,
      }))
      .filter((l) => l.url);

    const freeModel = process.env.OPENAI_MODEL_FREE || "gpt-4o-mini";
    const proModel = process.env.OPENAI_MODEL_PRO || "gpt-5-mini";
    const model = plan === "PRO" ? proModel : freeModel;

    const instructions =
      lang === "en"
        ? [
            "You create high-converting Google Search ads.",
            "Return ONLY valid JSON (no markdown).",
            "Do NOT include the domain or brand name in headlines/descriptions/sitelinks.",
            "No ellipses. No broken words. Keep every line complete.",
            "Headlines: 3 items, each <= 30 chars.",
            "Descriptions: 2 items, each 80-90 chars (aim near 90).",
            "Sitelinks: exactly 4 items, each 18-25 chars (aim near 25).",
            "Keywords: 8-12 items, short phrases relevant to the page.",
            "Avoid technical/nav words: cart, filters, login, register, privacy, terms, cookies.",
          ].join(" ")
        : [
            "Tu veido augstas kvalitātes Google Search reklāmu tekstus.",
            "Atgriez TIKAI derīgu JSON (bez markdown).",
            "Nedrīkst iekļaut domēnu vai zīmola nosaukumu virsrakstos/aprakstos/sitelinkos.",
            "Nedrīkst būt daudzpunktes vai nepilni vārdi. Neplēs vārdus.",
            "Virsraksti: 3 gab, katrs <= 30 zīmes.",
            "Apraksti: 2 gab, katrs 80-90 zīmes (mērķis tuvāk 90).",
            "Sitelinki: tieši 4 gab, katrs 18-25 zīmes (mērķis tuvāk 25).",
            "Keywords: 8-12 gab, īsas frāzes no lapas satura.",
            "Izvairies no tehniskiem/nav vārdiem: grozs, filtri, login, reģistrēties, privātums, noteikumi, sīkdatnes.",
          ].join(" ");

    const userPayload = {
      url,
      domain,
      displayUrl,
      pageText,
      links: linkHints,
      output_schema: {
        ad: {
          siteName: "string",
          displayUrl: "string",
          headline1: "string<=30",
          headline2: "string<=30",
          headline3: "string<=30",
          description1: "string<=90",
          description2: "string<=90",
        },
        siteLinks: "string[4] each<=25",
        keywords: "string[8..12]",
      },
    };

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // JSON mode: svarīgi, lai instrukcijās būtu vārds "JSON" (tas ir augstāk)
    const resp = await client.responses.create({
      model,
      reasoning: { effort: plan === "PRO" ? "medium" : "low" },
      input: [
        { role: "system", content: instructions },
        { role: "user", content: JSON.stringify(userPayload) },
      ],
      text: { format: { type: "json_object" } },
      // pietiekami gan reklāmai, gan keywordiem
      max_output_tokens: plan === "PRO" ? 900 : 650,
    });

    const outText = (resp as any)?.output_text || "";
    let data: any = null;
    try {
      data = JSON.parse(outText);
    } catch {
      return jsonError("OPENAI_BAD_JSON", "OpenAI neatgrieza derīgu JSON.", 400, { outText });
    }

    // Validācija + clamp (lai UI nepārlūzt)
    const ad = data?.ad || {};
    const final = {
      ok: true,
      keywords: clampArrayStrings(data?.keywords, 12, 40),
      siteLinks: clampArrayStrings(data?.siteLinks, 4, 25),
      ad: {
        siteName: domain,
        displayUrl,
        headline1: clampStr(ad?.headline1, 30),
        headline2: clampStr(ad?.headline2, 30),
        headline3: clampStr(ad?.headline3, 30),
        description1: clampStr(ad?.description1, 90),
        description2: clampStr(ad?.description2, 90),
      },
    };

    // fallback ja kaut kas tukšs
    if (!final.ad.headline1 || !final.ad.description1 || final.siteLinks.length < 4) {
      return jsonError("OPENAI_INCOMPLETE", "OpenAI atbilde bija nepilnīga. Pamēģini vēlreiz.", 400, { data: final });
    }

    return NextResponse.json(final);
  } catch (e: any) {
    return jsonError("OPENAI_FAILED", "Neizdevās ģenerēt ar OpenAI.", 400, {
      message: e?.message,
      type: e?.type,
      code: e?.code,
    });
  }
}

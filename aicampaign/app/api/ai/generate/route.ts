import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Lang = "lv" | "en";
type Plan = "FREE" | "PRO";

function jsonError(error: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, error, message, details }, { status });
}

function normalizeInputUrl(raw: string) {
  const v = (raw || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
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

function cleanLine(s: string) {
  return (s || "")
    .replace(/\u0000/g, "")
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .trim();
}

function clampStr(v: unknown, maxLen: number) {
  if (typeof v !== "string") return "";
  const t = cleanLine(v);
  if (!t) return "";
  return t.length > maxLen ? cleanLine(t.slice(0, maxLen)) : t;
}

function clampArrayStrings(arr: unknown, maxItems: number, maxLen: number) {
  const out: string[] = [];
  if (!Array.isArray(arr)) return out;
  for (const v of arr) {
    if (typeof v !== "string") continue;
    const t = cleanLine(v);
    if (!t) continue;
    out.push(t.length > maxLen ? cleanLine(t.slice(0, maxLen)) : t);
    if (out.length >= maxItems) break;
  }
  return out;
}

function removeDomainBrand(text: string, domain: string) {
  const d = (domain || "").replace(/\./g, "\\.");
  if (!d) return text;
  const re = new RegExp(`\\b${d}\\b`, "ig");
  return cleanLine(text.replace(re, ""));
}

function buildFallbackFromKeywords(params: {
  lang: Lang;
  domain: string;
  displayUrl: string;
  keywords: string[];
  pageText: string;
}) {
  const { lang, domain, displayUrl } = params;
  const kws = params.keywords.filter(Boolean);
  const k1 = kws[0] || (lang === "en" ? "Services" : "Pakalpojumi");
  const k2 = kws[1] || (lang === "en" ? "Pricing" : "Cenas");
  const k3 = kws[2] || (lang === "en" ? "Consultation" : "Konsultācija");

  const h1 = lang === "en" ? `Get ${k1}` : `Saņem ${k1}`;
  const h2 = lang === "en" ? `${k2} & Offers` : `${k2} un Piedāvājumi`;
  const h3 = lang === "en" ? `Fast ${k3}` : `Ātra ${k3}`;

  const d1 =
    lang === "en"
      ? `Professional ${k1} tailored to your needs. Quick response and clear next steps today.`
      : `Profesionāli ${k1} tavām vajadzībām. Ātra atbilde un skaidri nākamie soļi jau šodien.`;
  const d2 =
    lang === "en"
      ? `Transparent ${k2}, helpful support and an easy start. Request a quote in minutes.`
      : `Pārskatāmas ${k2}, atsaucīgs atbalsts un vienkāršs starts. Pieprasi piedāvājumu minūtēs.`;

  const s1 = lang === "en" ? "Services" : "Pakalpojumi";
  const s2 = lang === "en" ? "Pricing" : "Cenas";
  const s3 = lang === "en" ? "Contact" : "Kontakti";
  const s4 = lang === "en" ? "About Us" : "Par mums";

  return {
    ok: true,
    keywords: kws.slice(0, 12),
    siteLinks: [s1, s2, s3, s4].map((x) => clampStr(x, 25)),
    ad: {
      siteName: domain,
      displayUrl,
      headline1: clampStr(removeDomainBrand(h1, domain), 30),
      headline2: clampStr(removeDomainBrand(h2, domain), 30),
      headline3: clampStr(removeDomainBrand(h3, domain), 30),
      description1: clampStr(removeDomainBrand(d1, domain), 90),
      description2: clampStr(removeDomainBrand(d2, domain), 90),
    },
  };
}

function looksComplete(x: any) {
  const ad = x?.ad;
  return (
    x?.ok === true &&
    ad &&
    typeof ad.headline1 === "string" &&
    ad.headline1.trim().length > 0 &&
    typeof ad.description1 === "string" &&
    ad.description1.trim().length > 0 &&
    Array.isArray(x?.siteLinks) &&
    x.siteLinks.length >= 4
  );
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "generate route is alive" });
}

export async function POST(req: Request) {
  try {
    // ✅ Skaidrs paziņojums prod gadījumam (Vercel ENV)
    if (!process.env.OPENAI_API_KEY) {
      return jsonError(
        "OPENAI_NOT_CONFIGURED",
        "Nav iestatīts OPENAI_API_KEY (Vercel → Project → Settings → Environment Variables → Production)."
      );
    }

    const body = (await req.json().catch(() => null)) as
      | {
          url?: string;
          lang?: Lang;
          plan?: Plan;
          pageText?: string;
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

    const rawText = String(body?.pageText || "");
    const pageText = cleanLine(rawText).slice(0, 8000);

    const rawLinks = Array.isArray(body?.links) ? body!.links! : [];
    const linkHints = rawLinks
      .slice(0, 40)
      .map((l) => ({
        url: typeof (l as any)?.url === "string" ? (l as any).url : "",
        text: typeof (l as any)?.text === "string" ? (l as any).text : null,
      }))
      .filter((l) => l.url);

    const freeModel = process.env.OPENAI_MODEL_FREE || "gpt-4o-mini";
    const proModel = process.env.OPENAI_MODEL_PRO || "gpt-4o-mini";
    const model = plan === "PRO" ? proModel : freeModel;

    const baseInstructions =
      lang === "en"
        ? [
            "You create high-converting Google Search ads.",
            "Return ONLY valid JSON (no markdown).",
            "Do NOT include the domain or brand name in headlines, descriptions or sitelinks.",
            "No ellipses. No broken words.",
            "Headlines: 3 items, each <= 30 characters.",
            "Descriptions: 2 items, each 80–90 characters (aim near 90).",
            "Sitelinks: exactly 4 items, each 18–25 characters.",
            "Keywords: 8–12 short phrases relevant to the page.",
            "Avoid technical/nav words like cart, filters, login, privacy, cookies.",
          ].join(" ")
        : [
            "Tu veido augstas kvalitātes Google Search reklāmu tekstus.",
            "Atgriez TIKAI derīgu JSON (bez markdown).",
            "Nedrīkst iekļaut domēnu vai zīmola nosaukumu tekstos.",
            "Bez daudzpunktēm un nepilniem vārdiem.",
            "Virsraksti: 3 gab, katrs <= 30 zīmes.",
            "Apraksti: 2 gab, katrs 80–90 zīmes (mērķis tuvāk 90).",
            "Sitelinki: tieši 4 gab, katrs 18–25 zīmes (mērķis tuvāk 25).",
            "Keywords: 8–12 īsas frāzes no lapas satura.",
            "Izvairies no tehniskiem/nav vārdiem (grozs, filtri, login, privātums, sīkdatnes).",
          ].join(" ");

    const strictSchemaHint = {
      required: ["ad", "siteLinks", "keywords"],
      adRequired: ["headline1", "headline2", "headline3", "description1", "description2"],
      example: {
        keywords: ["keyword 1", "keyword 2"],
        siteLinks: ["Link 1", "Link 2", "Link 3", "Link 4"],
        ad: {
          headline1: "Headline",
          headline2: "Headline",
          headline3: "Headline",
          description1: "Description line 1",
          description2: "Description line 2",
        },
      },
    };

    const userPayload = {
      url,
      domain,
      displayUrl,
      pageText,
      links: linkHints,
      output_format_hint: strictSchemaHint,
    };

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    async function callOnce(extraEmphasis: string) {
      const resp = await client.responses.create({
        model,
        input: [
          { role: "system", content: baseInstructions + " " + extraEmphasis },
          { role: "user", content: JSON.stringify(userPayload) },
        ],
        text: { format: { type: "json_object" } },
        max_output_tokens: plan === "PRO" ? 1000 : 750,
      });

      const outText = (resp as any)?.output_text || "";
      let data: any = null;
      try {
        data = JSON.parse(outText);
      } catch {
        return { ok: false, error: "OPENAI_BAD_JSON", outText };
      }

      const ad = data?.ad || {};
      const normalized = {
        ok: true,
        keywords: clampArrayStrings(data?.keywords, 12, 40),
        siteLinks: clampArrayStrings(data?.siteLinks, 4, 25),
        ad: {
          siteName: domain,
          displayUrl,
          headline1: clampStr(removeDomainBrand(ad?.headline1 || "", domain), 30),
          headline2: clampStr(removeDomainBrand(ad?.headline2 || "", domain), 30),
          headline3: clampStr(removeDomainBrand(ad?.headline3 || "", domain), 30),
          description1: clampStr(removeDomainBrand(ad?.description1 || "", domain), 90),
          description2: clampStr(removeDomainBrand(ad?.description2 || "", domain), 90),
        },
      };

      return normalized;
    }

    let result = await callOnce(
      lang === "en"
        ? "IMPORTANT: You MUST include ad + siteLinks + keywords exactly as required."
        : "SVARĪGI: Tev OBLIGĀTI jāiekļauj ad + siteLinks + keywords tieši kā prasīts."
    );

    if (!looksComplete(result)) {
      result = await callOnce(
        lang === "en"
          ? "CRITICAL: Output MUST contain non-empty ad.headline1 and ad.description1 and exactly 4 sitelinks."
          : "KRITISKI: Output OBLIGĀTI jābūt ad.headline1 un ad.description1 (ne tukšiem) un tieši 4 sitelinkiem."
      );
    }

    if (!looksComplete(result)) {
      const kws = Array.isArray((result as any)?.keywords) ? (result as any).keywords : [];

      const fallback = buildFallbackFromKeywords({
        lang,
        domain,
        displayUrl,
        keywords: kws.length ? kws : [],
        pageText,
      });

      return NextResponse.json(fallback);
    }

    return NextResponse.json(result);
  } catch (e: any) {
    return jsonError("OPENAI_FAILED", "Neizdevās ģenerēt ar OpenAI.", 400, {
      message: e?.message,
      type: e?.type,
      code: e?.code,
    });
  }
}

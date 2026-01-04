"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type FetchLinksResp = {
  ok: boolean;
  baseUrl?: string;
  links?: Array<{ url: string; text: string | null }>;
};

type AdPreview = {
  siteName: string;
  displayUrl: string;
  headline1: string;
  headline2: string;
  headline3: string;
  description1: string;
  description2: string;
};

type AdViewModel = {
  ad: AdPreview;
  siteLinks: string[];
};

type Lang = "lv" | "en";

type Paywall = {
  title: string;
  text: string;
  ctaLabel: string;
  ctaHref: string;
  note?: string;
};

/** =========================
 * URL helpers
 * ========================= */
function normalizeInputUrl(raw: string) {
  const v = (raw || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;

  // allow: www.example.com OR example.com/path
  if (/^www\./i.test(v) || /^[a-z0-9.-]+\.[a-z]{2,}([/?:#]|$)/i.test(v)) {
    return `https://${v}`;
  }
  return v;
}

function isLikelyUrl(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function basicDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function safePathFromUrl(u: string) {
  try {
    const url = new URL(u);
    const p = url.pathname.replace(/\/+$/, "");
    if (!p || p === "/") return "";
    return p.startsWith("/") ? p.slice(1) : p;
  } catch {
    return "";
  }
}

/** =========================
 * Text helpers
 * ========================= */
function fitWords(s: string, max: number) {
  const t = (s || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (t.length <= max) return t;

  const words = t.split(" ");
  while (words.length > 0) {
    const candidate = words.join(" ");
    if (candidate.length <= max) return candidate;
    words.pop();
  }
  return "";
}

function expandTo25(label: string, lang: Lang) {
  let t = (label || "").replace(/\s+/g, " ").trim();
  t = t.replace(/[|•·]/g, " ").replace(/\s+/g, " ").trim();
  if (!t) return "";

  const addOnsLv = ["un cenas", "un piegāde", "un atlaides", "un piedāvājumi", "un iespējas", "un izvēle"];
  const addOnsEn = ["and pricing", "and delivery", "and discounts", "and deals", "and options", "and selection"];
  const addOns = lang === "en" ? addOnsEn : addOnsLv;

  if (t.length < 18) {
    const a = addOns[Math.floor(Math.random() * addOns.length)];
    const fitted = fitWords(`${t} ${a}`, 25);
    if (fitted) t = fitted;
  }
  if (t.length < 20) {
    const a = addOns[Math.floor(Math.random() * addOns.length)];
    const fitted = fitWords(`${t} ${a}`, 25);
    if (fitted && fitted.length > t.length) t = fitted;
  }

  return fitWords(t, 25);
}

function nicePathText(u: string, lang: Lang) {
  try {
    const url = new URL(u);
    const p = decodeURIComponent(url.pathname || "/");
    const s = p.replace(/^\/+/, "").replace(/\/+$/, "");
    if (!s) return lang === "en" ? "Home" : "Sākums";
    const parts = s.split("/").filter(Boolean);
    const last = parts[parts.length - 1] || s;
    return last
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^./, (c) => c.toUpperCase());
  } catch {
    return lang === "en" ? "Home" : "Sākums";
  }
}

/** =========================
 * Theme extraction (simple)
 * ========================= */
const STOPWORDS_LV = new Set(
  [
    "un",
    "par",
    "kas",
    "vai",
    "ar",
    "bez",
    "lai",
    "jūs",
    "tu",
    "mēs",
    "mūsu",
    "jūsu",
    "tas",
    "tā",
    "šis",
    "šī",
    "šie",
    "šīs",
    "ir",
    "bija",
    "būs",
    "nav",
    "var",
    "kā",
    "ko",
    "kur",
    "kad",
    "vēl",
    "vairāk",
    "mazāk",
    "pie",
    "uz",
    "no",
    "līdz",
    "pēc",
    "pirms",
    "šodien",
    "tagad",
    "tikai",
    "šeit",
    "tur",
    "sākums",
    "kontakti",
    "privātums",
    "noteikumi",
    "jaunumi",
    "akcija",
    "akcijas",
    "pirkumu",
    "pirkums",
    "grozs",
    "reģistrēties",
    "pieteikties",
    "ienākt",
    "iziet",
    "profils",
    "kategorijas",
    "kategorija",
    "www",
    "http",
    "https",
    "com",
    "lv",
    "lat",
    "eng",
    "rus",
  ].map((s) => s.toLowerCase())
);

const STOPWORDS_EN = new Set(
  [
    "and",
    "or",
    "the",
    "a",
    "an",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "without",
    "from",
    "by",
    "at",
    "as",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "this",
    "that",
    "your",
    "our",
    "you",
    "we",
    "it",
    "home",
    "contact",
    "privacy",
    "terms",
    "cart",
    "checkout",
    "login",
    "register",
    "account",
    "profile",
    "categories",
    "category",
    "www",
    "http",
    "https",
    "com",
    "net",
    "org",
    "en",
    "lv",
    "lat",
    "rus",
  ].map((s) => s.toLowerCase())
);

const TOPIC_BLACKLIST_LV = new Set(
  ["privātuma", "politika", "noteikumi", "sīkdatnes", "kontakti", "faq", "lat", "eng", "rus"].map((s) => s.toLowerCase())
);
const TOPIC_BLACKLIST_EN = new Set(
  ["privacy", "policy", "terms", "cookies", "contact", "login", "register", "faq", "en", "lv", "lat", "rus"].map((s) => s.toLowerCase())
);

function tokenize(text: string, lang: Lang) {
  const stop = lang === "en" ? STOPWORDS_EN : STOPWORDS_LV;

  return text
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}-]/gu, ""))
    .filter((w) => w.length >= 3)
    .filter((w) => !stop.has(w))
    .filter((w) => !/^\d+$/.test(w));
}

function topWords(tokens: string[], max: number) {
  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w)
    .slice(0, max);
}

function guessGoal(text: string) {
  const t = text.toLowerCase();
  if (t.includes("cart") || t.includes("checkout") || t.includes("order") || t.includes("buy") || t.includes("payment")) return "E-commerce";
  if (t.includes("grozs") || t.includes("pasūt") || t.includes("pirk") || t.includes("apmaksa")) return "E-commerce";
  return "Leads";
}

function normalizeLv(w: string) {
  let s = w.toLowerCase().trim();
  if (s.endsWith("us") && s.length >= 6) s = s.slice(0, -2) + "i";
  return s;
}

function pickThemes(seeds: string[], lang: Lang) {
  const blacklist = lang === "en" ? TOPIC_BLACKLIST_EN : TOPIC_BLACKLIST_LV;
  const stop = lang === "en" ? STOPWORDS_EN : STOPWORDS_LV;

  const cleaned = seeds
    .map((w) => (lang === "lv" ? normalizeLv(w) : w.toLowerCase().trim()))
    .filter((w) => !stop.has(w))
    .filter((w) => !blacklist.has(w));

  const uniq = Array.from(new Set(cleaned));
  return uniq.slice(0, 12);
}

function toName(theme: string) {
  return theme
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function pickOne<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDescriptionNear90(parts: string[], targetMin = 80, max = 90) {
  const chosen: string[] = [];
  const pool = shuffle(parts);

  for (const p of pool) {
    const next = chosen.length ? `${chosen.join(". ")}. ${p}` : p;
    if (next.length <= max) chosen.push(p);
    if (next.length >= targetMin) break;
  }

  let out = chosen.join(". ");
  if (out && !out.endsWith(".")) out += ".";
  out = out.replace(/\s+/g, " ").trim();

  if (out.length < targetMin) {
    for (const p of pool) {
      const cand = `${out} ${p}.`.replace(/\s+/g, " ").trim();
      if (cand.length <= max) {
        out = cand;
        break;
      }
    }
  }

  if (out.length > max) {
    const sentences = out
      .split(".")
      .map((x) => x.trim())
      .filter(Boolean);
    while (sentences.length) {
      const cand = sentences.join(". ") + ".";
      if (cand.length <= max) {
        out = cand;
        break;
      }
      sentences.pop();
    }
  }

  return out.replace(/…/g, "").trim();
}

function makeHeadlines(params: { theme: string; goal: string; lang: Lang }) {
  const { theme, goal, lang } = params;
  const niceTheme = toName(theme);
  const isShop = goal === "E-commerce";

  if (lang === "en") {
    const h1 = isShop
      ? [`Buy ${niceTheme} Online`, `${niceTheme} Deals`, `Shop ${niceTheme} Today`, `${niceTheme} Sale`]
      : [`${niceTheme} Services`, `${niceTheme} Experts`, `Get ${niceTheme} Help`, `${niceTheme} Solutions`];

    const h2 = isShop ? ["Fast Delivery", "Great Prices", "Easy Checkout", "Trusted Store", "Top Selection"] : ["Get a Quote", "Fast Response", "Clear Pricing", "Trusted Team", "Book a Call"];
    const h3 = isShop ? ["Order in Minutes", "Secure Payments", "Save More Today", "New Arrivals", "Support Included"] : ["Start Today", "Simple Process", "Expert Guidance", "Talk to Us", "Next Steps Ready"];

    return {
      headline1: fitWords(pickOne(h1), 30) || fitWords(niceTheme, 30) || "Offer",
      headline2: fitWords(pickOne(h2), 30) || "Fast Response",
      headline3: fitWords(pickOne(h3), 30) || "Clear Pricing",
    };
  }

  const h1 = isShop
    ? [`Iegādājies ${niceTheme}`, `${niceTheme} Online`, `${niceTheme} ar atlaidēm`, `Plaša ${niceTheme} izvēle`]
    : [`${niceTheme} risinājumi`, `${niceTheme} konsultācija`, `Uzzini par ${niceTheme}`, `${niceTheme} pakalpojumi`];
  const h2 = isShop ? ["Konkurētspējīgas cenas", "Akcijas šomēnes", "Ātra piegāde", "Pārskatāms katalogs", "Droša apmaksa"] : ["Ātra atbilde", "Skaidras izmaksas", "Profesionāla pieeja", "Saņem piedāvājumu", "Piesakies šodien"];
  const h3 = isShop ? ["Piegāde visā Latvijā", "Pasūti ērti", "Atrodi piemērotāko", "Kvalitāte un izvēle", "Atbalsts pircējiem"] : ["Uzsāc sadarbību", "Saņem atbildi ātri", "Atrodi risinājumu", "Vienkāršs process", "Drošs lēmums"];

  return {
    headline1: fitWords(pickOne(h1), 30) || fitWords(niceTheme, 30) || "Piedāvājums",
    headline2: fitWords(pickOne(h2), 30) || "Ātra atbilde",
    headline3: fitWords(pickOne(h3), 30) || "Skaidras izmaksas",
  };
}

function makeAdPreview(params: { theme: string; domain: string; goal: string; finalUrl: string; lang: Lang }): AdPreview {
  const { theme, domain, goal, finalUrl, lang } = params;

  const path = safePathFromUrl(finalUrl);
  const displayUrl = `${domain}${path ? `/${path}` : ""}`.replace(/\/$/, "");
  const { headline1, headline2, headline3 } = makeHeadlines({ theme, goal, lang });
  const isShop = goal === "E-commerce";

  const descPartsShopEn = [
    "Browse the selection and pick the best fit",
    "Order online in minutes and get fast delivery",
    "Great prices, clear terms, and helpful support",
    "Secure checkout with a smooth buying process",
    "Discover deals, bundles, and new arrivals",
    "Find options that match your needs and budget",
  ];

  const descPartsLeadEn = [
    "Tell us what you need and get a tailored quote",
    "Clear pricing, expert guidance, and fast response",
    "A simple process from first message to results",
    "Get practical recommendations and next steps",
    "Book a quick call and move forward today",
    "Reliable service with a professional approach",
  ];

  const desc2ShopEn = [
    "Compare options and choose the right one",
    "Fast delivery, secure payments, and support",
    "Save with discounts and limited-time deals",
    "Check availability and order with confidence",
    "New arrivals and top picks available now",
  ];

  const desc2LeadEn = [
    "Send a request and get a fast response",
    "Transparent terms and predictable costs",
    "Start with a quick message and next steps",
    "We help you choose the best approach",
    "Get a quote and practical guidance today",
  ];

  const descPartsShopLv = [
    "Apskati sortimentu un izvēlies labāko risinājumu",
    "Pasūti tiešsaistē un saņem ātri",
    "Piegāde visā Latvijā un klientu atbalsts",
    "Konkurētspējīgas cenas un skaidri nosacījumi",
    "Droša apmaksa un pārskatāms process",
    "Akcijas un piedāvājumi katru mēnesi",
    "Plaša izvēle dažādām vajadzībām",
  ];

  const descPartsLeadLv = [
    "Pastāsti, ko vajag, un sagatavosim piemērotu piedāvājumu",
    "Saņem konsultāciju un skaidru plānu bez pārsteigumiem",
    "Ātra atbilde un saprotams process no sākuma līdz beigām",
    "Risinājums pielāgots Tavām vajadzībām un budžetam",
    "Uzzini iespējas un izvēlies drošu nākamo soli",
    "Profesionāla pieeja un praktiski ieteikumi",
    "Sāc ar īsu pieteikumu un saņem atbildi šodien",
  ];

  const desc2ShopLv = [
    "Salīdzini modeļus un atrodi piemērotāko",
    "Pārskatāmas cenas un ātra piegāde",
    "Iegūsti izdevīgu komplektu un atlaides",
    "Uzzini pieejamību un pasūti ērti",
    "Konsultācija un palīdzība izvēlē",
    "Apskati akcijas un jaunākos piedāvājumus",
  ];

  const desc2LeadLv = [
    "Iesniedz pieprasījumu un saņem piedāvājumu ātri",
    "Skaidri nosacījumi un prognozējamas izmaksas",
    "Piesakies un uzzini labāko risinājumu",
    "Mēs palīdzēsim izvēlēties piemērotāko pieeju",
    "Saņem ieteikumus un nākamos soļus bez sarežģījumiem",
    "Uzzini cenas un iespējas vienā sarunā",
  ];

  const description1 =
    lang === "en"
      ? buildDescriptionNear90(isShop ? descPartsShopEn : descPartsLeadEn, 82, 90)
      : buildDescriptionNear90(isShop ? descPartsShopLv : descPartsLeadLv, 82, 90);

  const description2 =
    lang === "en"
      ? buildDescriptionNear90(isShop ? desc2ShopEn : desc2LeadEn, 82, 90)
      : buildDescriptionNear90(isShop ? desc2ShopLv : desc2LeadLv, 82, 90);

  return {
    siteName: domain,
    displayUrl,
    headline1,
    headline2,
    headline3,
    description1,
    description2,
  };
}

/** =========================
 * Sitelinks helpers
 * ========================= */
function isBadLink(u: string) {
  try {
    const p = new URL(u).pathname.toLowerCase();
    return (
      p.includes("privatuma") ||
      p.includes("privacy") ||
      p.includes("noteikumi") ||
      p.includes("terms") ||
      p.includes("kontakti") ||
      p.includes("contact") ||
      p.includes("/form") ||
      p.includes("/gallery") ||
      p.includes("cookie") ||
      p.includes("cookies")
    );
  } catch {
    return true;
  }
}
function isLanguageSwitchText(t: string) {
  const s = (t || "").trim().toLowerCase();
  return s === "lat" || s === "eng" || s === "rus" || s === "en" || s === "lv";
}
function pickSiteLinks(params: { links: Array<{ url: string; text: string | null }>; goal: string; lang: Lang }) {
  const { links, goal, lang } = params;

  const candidates = (links || [])
    .filter((l) => l?.url && !isBadLink(l.url))
    .map((l) => {
      const raw = (l.text || "").replace(/\s+/g, " ").trim();
      const labelBase = raw ? raw : nicePathText(l.url, lang);
      return labelBase;
    })
    .filter((t) => !!t && !isLanguageSwitchText(t));

  const shuffled = shuffle(candidates);

  const picks: string[] = [];
  for (const s of shuffled) {
    if (picks.length >= 4) break;
    const expanded = expandTo25(s, lang);
    if (!expanded) continue;
    if (!picks.includes(expanded)) picks.push(expanded);
  }

  const isShop = goal === "E-commerce";

  const standardShopLv = ["Akcijas un atlaides", "Produkti un izvēle", "Piegāde un cenas", "Outlet piedāvājumi"];
  const standardLeadLv = ["Pakalpojumi un cenas", "Atsauksmes un pieredze", "Risinājumi un iespējas", "Pieteikums un soļi"];

  const standardShopEn = ["Deals and Discounts", "Products and Selection", "Delivery and Pricing", "Best Offers Today"];
  const standardLeadEn = ["Services and Pricing", "Reviews and Results", "Solutions and Options", "Request and Next Steps"];

  const standard = lang === "en" ? (isShop ? standardShopEn : standardLeadEn) : isShop ? standardShopLv : standardLeadLv;

  for (const s of shuffle(standard)) {
    if (picks.length >= 4) break;
    const expanded = expandTo25(s, lang);
    if (expanded && !picks.includes(expanded)) picks.push(expanded);
  }

  while (picks.length < 4) {
    const s = expandTo25(lang === "en" ? "Learn more" : "Uzzināt vairāk", lang);
    if (!picks.includes(s)) picks.push(s);
  }

  return picks.slice(0, 4).map((x) => fitWords(x, 25)).filter(Boolean);
}

/** =========================
 * Demo limit + plan + language
 * ========================= */
function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function demoCountKey() {
  return `demo:ai-gen-count:${todayKey()}`;
}
function readDemoCount(): number {
  try {
    const v = localStorage.getItem(demoCountKey());
    const n = Number(v || "0");
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}
function incDemoCount(): number {
  try {
    const current = readDemoCount();
    const next = current + 1;
    localStorage.setItem(demoCountKey(), String(next));
    return next;
  } catch {
    return 999999;
  }
}

const PLAN_KEY = "aiads:plan"; // "pro" | (nav) = free
function readPlan(): "FREE" | "PRO" {
  try {
    return localStorage.getItem(PLAN_KEY) === "pro" ? "PRO" : "FREE";
  } catch {
    return "FREE";
  }
}
function setProPlan() {
  try {
    localStorage.setItem(PLAN_KEY, "pro");
  } catch {}
}

const LANG_KEY = "aiads:lang"; // "lv" | "en"
function readLang(): Lang {
  try {
    const v = localStorage.getItem(LANG_KEY);
    return v === "en" ? "en" : "lv";
  } catch {
    return "lv";
  }
}
function saveLang(lang: Lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {}
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** =========================
 * Manual helpers
 * ========================= */
function cleanKeyword(s: string) {
  const t = (s || "")
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t;
}
function keywordLines(kw: string) {
  const k = cleanKeyword(kw);
  if (!k) return [];
  return [`"${k}"`, `[${k}]`];
}
function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** =========================
 * CSV helpers
 * ========================= */
function csvEscape(v: string) {
  const s = (v ?? "").toString();
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function rowsToCsv(rows: string[][]) {
  return rows.map((r) => r.map(csvEscape).join(",")).join("\n");
}
function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** =========================
 * UI components
 * ========================= */
function GoogleLikeAdCard({
  model,
  allowSelect,
  onCopyBlock,
}: {
  model: AdViewModel;
  allowSelect?: boolean;
  onCopyBlock?: () => void;
}) {
  const { ad, siteLinks } = model;

  return (
    <div
      onCopy={(e) => {
        if (!allowSelect) {
          e.preventDefault();
          onCopyBlock?.();
        }
      }}
      style={{
        background: "white",
        borderRadius: 16,
        padding: 16,
        userSelect: allowSelect ? "text" : "none",
        WebkitUserSelect: allowSelect ? "text" : "none",
        MozUserSelect: allowSelect ? "text" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#111827" }}>
        <div
          aria-hidden="true"
          style={{
            width: 22,
            height: 22,
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 12,
            color: "#111827",
          }}
        >
          {ad.siteName.slice(0, 1).toUpperCase()}
        </div>
        <div style={{ fontWeight: 700 }}>{ad.siteName}</div>
        <div style={{ color: "#6b7280" }}>{ad.displayUrl}</div>
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 18,
          fontWeight: 700,
          color: "#1a0dab",
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
        {ad.headline1} · {ad.headline2} · {ad.headline3}
      </div>

      <div style={{ marginTop: 8, fontSize: 14, color: "#111827", lineHeight: 1.35 }}>
        <div>{ad.description1}</div>
        <div>{ad.description2}</div>
      </div>

      <div
        style={{
          marginTop: 10,
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          fontSize: 14,
          color: "#1a0dab",
          fontWeight: 600,
        }}
      >
        {siteLinks.slice(0, 4).map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function RightSideBlurLock({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <div style={{ position: "relative" }}>
      <div>{children}</div>

      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "42%",
          pointerEvents: "none",
          overflow: "hidden",
          borderTopRightRadius: 16,
          borderBottomRightRadius: 16,
        }}
      >
        <div style={{ height: "100%", filter: "blur(10px)", opacity: 0.98 }}>{children}</div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "42%",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 12,
        }}
      >
        <div style={{ fontWeight: 900, textAlign: "center", maxWidth: 260, color: "#111827" }}>{text}</div>
      </div>
    </div>
  );
}

function LockedBox({
  children,
  title,
  text,
  ctaLabel,
  ctaHref,
}: {
  children: React.ReactNode;
  title: string;
  text: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: "1px solid #e5e7eb" }}>
      <div style={{ filter: "blur(12px)", opacity: 0.65, transform: "scale(1.02)" }}>{children}</div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(15,23,42,0.15) 0%, rgba(15,23,42,0.40) 40%, rgba(15,23,42,0.75) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "52%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            background: "rgba(255,255,255,0.95)",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "#111827",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 18,
              }}
              aria-hidden="true"
            >
              🔒
            </div>
            <div style={{ fontWeight: 900, fontSize: 16, color: "#111827" }}>{title}</div>
          </div>

          <div style={{ marginTop: 10, color: "#111827", fontWeight: 800, lineHeight: 1.35 }}>{text}</div>

          <a
            href={ctaHref}
            style={{
              display: "inline-block",
              marginTop: 12,
              width: "auto",
              textAlign: "center",
              background: "#2563eb",
              color: "white",
              fontWeight: 900,
              textDecoration: "none",
              padding: "10px 12px",
              borderRadius: 12,
            }}
          >
            {ctaLabel}
          </a>

          <div style={{ marginTop: 10, color: "#6b7280", fontWeight: 800, fontSize: 12 }}>
            Pēc atbloķēšanas varēsi kopēt un rediģēt visu kampaņas struktūru.
          </div>
        </div>
      </div>
    </div>
  );
}

/** =========================
 * Page
 * ========================= */
export default function AiPage() {
  const router = useRouter();

  const [plan, setPlan] = useState<"FREE" | "PRO">("FREE");
  const isFree = plan === "FREE";
  const [lang, setLang] = useState<Lang>("lv");

  const [demoCount, setDemoCount] = useState<number>(0);

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState<Paywall | null>(null);
  const [generated, setGenerated] = useState<AdViewModel | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editable, setEditable] = useState<AdViewModel | null>(null);

  // keywords + manual settings
  const [keywords, setKeywords] = useState<string[]>([]);
  const [campaignBudget, setCampaignBudget] = useState<string>("15");
  const [campaignLocation, setCampaignLocation] = useState<string>("");
  const [campaignBidding, setCampaignBidding] = useState<string>("");
  const [campaignGoal, setCampaignGoal] = useState<string>("Leads");

  // keyword editor
  const [kwDraft, setKwDraft] = useState<string>("");
  const [kwEditIndex, setKwEditIndex] = useState<number | null>(null);
  const [kwEditValue, setKwEditValue] = useState<string>("");

  const normalizedUrl = useMemo(() => normalizeInputUrl(url), [url]);
  const urlOk = useMemo(() => isLikelyUrl(normalizedUrl), [normalizedUrl]);

  const pricingPath = "/pricing";
  const overlayText = "Izveido kampaņu, lai atbloķētu un rediģētu arī citus paraugus.";

  const dailyLimit = 3;
  const limitMsg = `Šodienas limits (${dailyLimit} ģenerācijas) ir sasniegts. Izveido kampaņu.`;


  const remainingToday = useMemo(() => {
    if (plan !== "FREE") return dailyLimit;
    const current = Number.isFinite(demoCount) ? demoCount : 0;
    return Math.max(0, dailyLimit - current);
  }, [plan, demoCount]);

  // centered container
  const pageShell: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    padding: 24,
  };
  const pageInner: React.CSSProperties = { width: "100%", maxWidth: 980 };

  const instantExample: AdViewModel = useMemo(() => {
    const domain = "example.com";
    const goal = "Leads";
    const theme = lang === "en" ? "digital marketing" : "digitālais mārketings";

    const ad = makeAdPreview({
      theme,
      domain,
      goal,
      finalUrl: `https://example.com/services/marketing`,
      lang,
    });

    const siteLinks =
      lang === "en"
        ? ["Services and Pricing", "Reviews and Results", "Solutions and Options", "Request and Next Steps"]
            .map((s) => expandTo25(s, lang))
            .map((s) => fitWords(s, 25))
        : ["Pakalpojumi un cenas", "Atsauksmes un pieredze", "Risinājumi un iespējas", "Pieteikums un soļi"]
            .map((s) => expandTo25(s, lang))
            .map((s) => fitWords(s, 25));

    return { ad, siteLinks };
  }, [lang]);

  useEffect(() => {
    setPlan(readPlan());
    setLang(readLang());
    setDemoCount(readDemoCount());

    try {
      const u = new URL(window.location.href);
      const success = u.searchParams.get("success");
      if (success === "1") {
        setProPlan();
        setPlan("PRO");
        setError("✅ Paldies! PRO ir atbloķēts.");
        setPaywall(null);

        u.searchParams.delete("success");
        const clean = u.pathname + (u.searchParams.toString() ? `?${u.searchParams.toString()}` : "");
        router.replace(clean);
      }
    } catch {}
  }, [router]);

  useEffect(() => {
    if (generated) {
      setEditable(JSON.parse(JSON.stringify(generated)) as AdViewModel);
      setIsEditing(false);

      setCampaignLocation(lang === "en" ? "United States" : "Latvia");
      setCampaignBidding(lang === "en" ? "Maximize clicks" : "Maksimizēt klikšķus");
    } else {
      setEditable(null);
      setIsEditing(false);
    }
  }, [generated, lang]);

  async function onGenerate() {
    setError(null);
    setPaywall(null);
    const v = normalizeInputUrl(url.trim());

    if (!isLikelyUrl(v)) {
      setError("Lūdzu ievadi mājaslapas URL (piem.: www.example.com vai https://example.com)");
      return;
    }

    if (plan === "FREE") {
      const current = readDemoCount();
      setDemoCount(current);
      if (current >= dailyLimit) {
        setError(limitMsg);
        setPaywall({
          title: lang === "en" ? "Unlock PRO" : "Atbloķē FREE",
          text:
            lang === "en"
              ? "Removes the daily limit and unlocks copy + editing."
              : "Tas noņem dienas limitu un atbloķē kopēšanu + rediģēšanu.",
          ctaLabel: lang === "en" ? "Unlock full access" : "Atbloķēt FREE",
          ctaHref: pricingPath,
          note: lang === "en" ? "Activates instantly." : "Aktivizējas uzreiz.",
        });
        return;
      }
    }

    setGenerated(null);

    setLoading(true);
    try {
      const r = await fetch(`/api/ai/fetch-url?url=${encodeURIComponent(v)}`, { cache: "no-store" });
      const j = await r.json().catch(() => null);

      let pageText = "";
      if (r.ok && j?.ok) pageText = String(j?.text || "");

      const goal = pageText ? guessGoal(pageText) : "Leads";
      setCampaignGoal(goal);

      const domain = basicDomain(v) || "example.com";

      let themes: string[] = [];
      if (pageText) {
        const seeds = topWords(tokenize(pageText, lang), 60);
        themes = pickThemes(seeds, lang);
      }

      if (!themes.length) {
        const path = safePathFromUrl(v).replace(/[-_]+/g, " ").trim();
        const fromUrl = path ? path.split(/\s+/).slice(0, 8) : [];
        const fromDomain = domain.split(".")[0]?.split(/[-_]+/).filter(Boolean) || [];
        themes = [...fromUrl, ...fromDomain].filter(Boolean);
      }

      if (!themes.length) {
        themes = lang === "en" ? ["services", "solutions", "pricing", "delivery", "deals"] : ["pakalpojumi", "risinājumi", "cenas", "piegāde", "akcijas"];
      }

      setKeywords(themes.slice(0, 12));

      let linksResp: FetchLinksResp | null = null;
      try {
        const lr = await fetch(`/api/ai/fetch-links?url=${encodeURIComponent(v)}`, { cache: "no-store" });
        const lj = (await lr.json().catch(() => null)) as FetchLinksResp | null;
        if (lr.ok && lj?.ok) linksResp = lj;
      } catch {}

      const links = linksResp?.links || [];
            // ✅ OpenAI ģenerācija (FREE + PRO)
      try {
        const gr = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: v,
            lang,
            plan, // "FREE" | "PRO"
            pageText,
            links,
          }),
        });

        const gText = await gr.text();
        let gj: any = null;
        try {
          gj = JSON.parse(gText);
        } catch {
          // ignore
        }

        if (gr.ok && gj?.ok && gj?.ad && Array.isArray(gj?.siteLinks)) {
          // OpenAI atbildēja — izmantojam to
          if (Array.isArray(gj?.keywords) && gj.keywords.length) {
            setKeywords(gj.keywords.slice(0, 12));
          }

          const openAiModel = {
            ad: {
              siteName: String(gj.ad.siteName || ""),
              displayUrl: String(gj.ad.displayUrl || ""),
              headline1: String(gj.ad.headline1 || ""),
              headline2: String(gj.ad.headline2 || ""),
              headline3: String(gj.ad.headline3 || ""),
              description1: String(gj.ad.description1 || ""),
              description2: String(gj.ad.description2 || ""),
            },
            siteLinks: gj.siteLinks.slice(0, 4).map((x: any) => String(x || "")),
          };

          if (plan === "FREE") setDemoCount(incDemoCount());
          setGenerated(openAiModel);
          return; // ✅ BEIDZAM, lai neiet uz heuristiku
        } else {
          // ja OpenAI kļūdās, turpinām ar heuristiku (nekas nelūzt)
          console.warn("OpenAI generate failed, fallback to heuristic:", { status: gr.status, gText });
        }
      } catch (e) {
        console.warn("OpenAI generate crashed, fallback to heuristic:", e);
      }


      const candidates: AdViewModel[] = [];
      const chosenThemes = shuffle(themes).slice(0, 8);

      for (const theme of chosenThemes) {
        for (let i = 0; i < 4; i++) {
          const ad = makeAdPreview({ theme, domain, goal, finalUrl: v, lang });

          const siteLinks = pickSiteLinks({ links, goal, lang })
            .map((s) => expandTo25(s, lang))
            .map((s) => fitWords(s, 25));

          candidates.push({ ad, siteLinks });
        }
      }

      const chosen = candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : null;
      if (!chosen) {
        setError("Neizdevās izveidot paraugu. Pamēģini citu URL.");
        return;
      }

      if (plan === "FREE") setDemoCount(incDemoCount());
      setGenerated(chosen);
    } catch {
      setError("Radās servera kļūda. Pamēģini vēlreiz.");
    } finally {
      setLoading(false);
    }
  }

  function onNewSample() {
    setGenerated(null);
    setEditable(null);
    setIsEditing(false);
    setError(null);
    setLoading(false);
    setKeywords([]);
    setKwDraft("");
    setKwEditIndex(null);
    setKwEditValue("");
  }

  const showTop = !generated;
  const modelToShow = (plan === "PRO" ? (editable ?? generated) : generated) ?? null;

  function LangToggle() {
    const btn = (active: boolean): React.CSSProperties => ({
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      background: active ? "#111827" : "white",
      color: active ? "white" : "#111827",
      fontWeight: 900,
      cursor: "pointer",
      minWidth: 54,
    });

    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          type="button"
          style={btn(lang === "lv")}
          onClick={() => {
            setLang("lv");
            saveLang("lv");
          }}
        >
          LV
        </button>
        <button
          type="button"
          style={btn(lang === "en")}
          onClick={() => {
            setLang("en");
            saveLang("en");
          }}
        >
          EN
        </button>
      </div>
    );
  }

  const languageLabel = lang === "en" ? "English" : "Latvian";
  const campaignTypeLabel = lang === "en" ? "Search" : "Meklēšana";
  const goalLabel =
    campaignGoal === "E-commerce"
      ? lang === "en"
        ? "Sales (E-commerce)"
        : "Pārdošana (E-komercija)"
      : lang === "en"
      ? "Leads"
      : "Pieteikumi";

  const defaultNegatives = useMemo(() => {
    return lang === "en"
      ? ["free", "job", "jobs", "career", "cv", "used", "second hand", "download", "torrent"]
      : ["bezmaksas", "darbs", "vakance", "cv", "lietots", "lejupielāde", "torents"];
  }, [lang]);

  const keywordList = useMemo(() => {
    const base = (keywords || []).map(cleanKeyword).filter(Boolean);
    const uniq = Array.from(new Set(base));
    return uniq.slice(0, 12);
  }, [keywords]);

  const adGroups = useMemo(() => {
    const groups = chunk(keywordList, 4).slice(0, 3);
    return groups.map((kws, i) => {
      const nameBase = kws[0] ? toName(kws[0]) : lang === "en" ? `Ad group ${i + 1}` : `Reklāmu grupa ${i + 1}`;
      const name = fitWords(nameBase, 28) || nameBase;
      const lines = kws.flatMap(keywordLines);
      return { name, lines, kws };
    });
  }, [keywordList, lang]);

  // ✅ CSV exports
  const csvKeywords = useMemo(() => {
    const rows: string[][] = [["AdGroup", "Keyword", "MatchType"]];
    for (const g of adGroups) {
      for (const kw of g.kws) {
        const k = cleanKeyword(kw);
        if (!k) continue;
        rows.push([g.name, k, "Phrase"]);
        rows.push([g.name, k, "Exact"]);
      }
    }
    return rowsToCsv(rows);
  }, [adGroups]);

  const csvAdsSitelinks = useMemo(() => {
    const m = modelToShow;
    const rows: string[][] = [["Type", "Field", "Value"]];
    if (m) {
      rows.push(["Ad", "Headline 1", m.ad.headline1]);
      rows.push(["Ad", "Headline 2", m.ad.headline2]);
      rows.push(["Ad", "Headline 3", m.ad.headline3]);
      rows.push(["Ad", "Description 1", m.ad.description1]);
      rows.push(["Ad", "Description 2", m.ad.description2]);

      m.siteLinks.slice(0, 4).forEach((s, idx) => {
        rows.push(["Sitelink", `Sitelink ${idx + 1}`, s]);
      });
    }
    return rowsToCsv(rows);
  }, [modelToShow]);

  const csvFull = useMemo(() => {
    const m = modelToShow;
    const finalUrl = normalizeInputUrl(url.trim());
    const domain = basicDomain(finalUrl) || (m?.ad.siteName ?? "");

    const rows: string[][] = [["Section", "Key", "Value"]];

    rows.push(["Campaign", "Type", campaignTypeLabel]);
    rows.push(["Campaign", "Goal", goalLabel]);
    rows.push(["Campaign", "Location", campaignLocation || (lang === "en" ? "United States" : "Latvia")]);
    rows.push(["Campaign", "Language", languageLabel]);
    rows.push(["Campaign", "Bidding", campaignBidding || (lang === "en" ? "Maximize clicks" : "Maksimizēt klikšķus")]);
    rows.push(["Campaign", "Daily budget", `${campaignBudget}${lang === "en" ? " USD" : " EUR"}`]);
    rows.push(["Campaign", "Final URL", finalUrl]);
    rows.push(["Campaign", "Display URL", domain]);

    rows.push(["", "", ""]);

    for (const g of adGroups) {
      rows.push(["AdGroup", "Name", g.name]);
      for (const kw of g.kws) {
        const k = cleanKeyword(kw);
        if (!k) continue;
        rows.push(["Keyword", "Phrase", k]);
        rows.push(["Keyword", "Exact", k]);
      }
      rows.push(["", "", ""]);
    }

    if (m) {
      rows.push(["Ad", "Headline 1", m.ad.headline1]);
      rows.push(["Ad", "Headline 2", m.ad.headline2]);
      rows.push(["Ad", "Headline 3", m.ad.headline3]);
      rows.push(["Ad", "Description 1", m.ad.description1]);
      rows.push(["Ad", "Description 2", m.ad.description2]);
      rows.push(["", "", ""]);

      m.siteLinks.slice(0, 4).forEach((s, idx) => rows.push(["Sitelink", `Sitelink ${idx + 1}`, s]));
      rows.push(["", "", ""]);
    }

    defaultNegatives.forEach((n) => rows.push(["Negative", "Keyword", n]));

    return rowsToCsv(rows);
  }, [
    modelToShow,
    url,
    campaignTypeLabel,
    goalLabel,
    campaignLocation,
    languageLabel,
    campaignBidding,
    campaignBudget,
    lang,
    adGroups,
    defaultNegatives,
  ]);

  const manualTextAll = useMemo(() => {
    const m = modelToShow;
    const finalUrl = normalizeInputUrl(url.trim());
    const domain = basicDomain(finalUrl) || (m?.ad.siteName ?? "");

    const header = [
      `Campaign type: ${campaignTypeLabel}`,
      `Goal: ${goalLabel}`,
      `Location: ${campaignLocation || (lang === "en" ? "United States" : "Latvia")}`,
      `Language: ${languageLabel}`,
      `Bidding: ${campaignBidding || (lang === "en" ? "Maximize clicks" : "Maksimizēt klikšķus")}`,
      `Daily budget: ${campaignBudget}${lang === "en" ? " USD" : " EUR"}`,
      `Final URL: ${finalUrl || ""}`,
      `Display URL: ${domain}`,
      ``,
      `Keywords (by ad group):`,
    ].filter(Boolean);

    const groupsText = adGroups.flatMap((g, idx) => [
      ``,
      `Ad group ${idx + 1}: ${g.name}`,
      ...g.lines.map((l) => `- ${l}`),
    ]);

    const adText = m
      ? [
          ``,
          `Ad headlines:`,
          `- ${m.ad.headline1}`,
          `- ${m.ad.headline2}`,
          `- ${m.ad.headline3}`,
          ``,
          `Descriptions:`,
          `- ${m.ad.description1}`,
          `- ${m.ad.description2}`,
          ``,
          `Sitelinks:`,
          ...m.siteLinks.slice(0, 4).map((s) => `- ${s}`),
        ]
      : [];

    const negText = [
      ``,
      `Negative keywords:`,
      ...defaultNegatives.map((n) => `- ${n}`),
    ];

    return [...header, ...groupsText, ...adText, ...negText].join("\n").trim();
  }, [
    modelToShow,
    url,
    campaignTypeLabel,
    goalLabel,
    campaignLocation,
    languageLabel,
    campaignBidding,
    campaignBudget,
    lang,
    adGroups,
    defaultNegatives,
  ]);

  const manualTextKeywordsOnly = useMemo(() => {
    const lines: string[] = [];
    adGroups.forEach((g, idx) => {
      lines.push(`Ad group ${idx + 1}: ${g.name}`);
      g.lines.forEach((l) => lines.push(l));
      lines.push("");
    });
    return lines.join("\n").trim();
  }, [adGroups]);

  const manualTextAdsOnly = useMemo(() => {
    const m = modelToShow;
    if (!m) return "";
    return [
      `Headlines:`,
      m.ad.headline1,
      m.ad.headline2,
      m.ad.headline3,
      ``,
      `Descriptions:`,
      m.ad.description1,
      m.ad.description2,
      ``,
      `Sitelinks:`,
      ...m.siteLinks.slice(0, 4),
    ].join("\n");
  }, [modelToShow]);

  async function handleCopy(label: string, text: string) {
    if (!text) {
      setError(lang === "en" ? "Nothing to copy." : "Nav ko kopēt.");
      return;
    }
    const ok = await copyToClipboard(text);
    if (ok) setError(label);
    else setError(lang === "en" ? "Copy failed. Please copy manually." : "Neizdevās nokopēt. Nokopē manuāli.");
  }

  function addKeyword() {
    const k = cleanKeyword(kwDraft);
    if (!k) return;
    setKeywords((prev) => {
      const next = [...prev.map(cleanKeyword).filter(Boolean), k];
      const uniq = Array.from(new Set(next));
      return uniq.slice(0, 12);
    });
    setKwDraft("");
  }

  function saveEdit() {
    if (kwEditIndex === null) return;
    const k = cleanKeyword(kwEditValue);
    setKeywords((prev) => {
      const next = [...prev];
      if (!k) next.splice(kwEditIndex, 1);
      else next[kwEditIndex] = k;
      const uniq = Array.from(new Set(next.map(cleanKeyword).filter(Boolean)));
      return uniq.slice(0, 12);
    });
    setKwEditIndex(null);
    setKwEditValue("");
  }

  function removeKeyword(i: number) {
    setKeywords((prev) => {
      const next = [...prev];
      next.splice(i, 1);
      const uniq = Array.from(new Set(next.map(cleanKeyword).filter(Boolean)));
      return uniq.slice(0, 12);
    });
  }

  const modelToShowSafe = modelToShow;

  return (
    <div style={pageShell}>
      <main style={{ ...pageInner, fontFamily: "Arial, sans-serif" }}>
        {showTop && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Piemērs</div>

            <button
              onClick={() => router.back()}
              style={{
                marginLeft: "auto",
                border: 0,
                background: "transparent",
                color: "#2563eb",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              ← Atpakaļ
            </button>
          </div>
        )}

        {showTop && (
          <>
            <div style={{ borderRadius: 16, background: "#f8fafc", padding: 12 }}>
              <GoogleLikeAdCard model={instantExample} allowSelect />
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
              <a
                href={pricingPath}
                style={{
                  display: "inline-block",
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "#2563eb",
                  color: "white",
                  fontWeight: 900,
                  textDecoration: "none",
                }}
              >
                Izveidot kampaņu
              </a>

              {plan === "PRO" && <div style={{ fontWeight: 900, color: "#16a34a" }}>PRO atbloķēts</div>}

              <div style={{ marginLeft: "auto" }}>
                <LangToggle />
              </div>
            </div>

            
            {plan === "FREE" && (
              <div style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: remainingToday <= 0 ? "#dc2626" : "#6b7280" }}>
                FREE: {remainingToday} / {dailyLimit} ģenerācijas palikušas šodien
              </div>
            )}

            <div style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "center" }}>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Ievadi mājaslapas URL (piem.: www.example.com)"
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: 0,
                  outline: "none",
                  background: "#f3f4f6",
                  fontSize: 16,
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (!loading) void onGenerate();
                  }
                }}
              />

              <button
                onClick={onGenerate}
                disabled={!urlOk || loading}
                style={{
                  padding: "12px 18px",
                  borderRadius: 14,
                  border: 0,
                  background: !urlOk || loading ? "#93c5fd" : "#2563eb",
                  color: "white",
                  fontWeight: 900,
                  cursor: !urlOk || loading ? "not-allowed" : "pointer",
                  fontSize: 16,
                  minWidth: 240,
                }}
              >
                {loading ? "Ģenerē..." : "Izveidot savu paraugu"}
              </button>
            </div>

            {url.trim() && normalizedUrl && normalizedUrl !== url.trim() && (
              <div style={{ marginTop: 8, color: "#6b7280", fontSize: 13, fontWeight: 700 }}>
                Tiks izmantots: {normalizedUrl}
              </div>
            )}
          </>
        )}

        {error && (
          <div style={{ marginTop: 14, color: error.startsWith("✅") ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
            {error}
          </div>
        )}

        {plan === "FREE" && paywall && (
          <div
            style={{
              marginTop: 12,
              borderRadius: 16,
              border: "1px solid #e5e7eb",
              background: "white",
              padding: 14,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 16, color: "#111827" }}>{paywall.title}</div>
            <div style={{ marginTop: 8, color: "#374151", fontWeight: 700, lineHeight: 1.35 }}>{paywall.text}</div>
            <a
              href={paywall.ctaHref}
              style={{
                display: "inline-block",
                marginTop: 12,
                textAlign: "center",
                background: "#2563eb",
                color: "white",
                fontWeight: 900,
                textDecoration: "none",
                padding: "12px 16px",
                borderRadius: 12,
              }}
            >
              {paywall.ctaLabel}
            </a>
            {paywall.note && (
              <div style={{ marginTop: 10, color: "#6b7280", fontWeight: 800, fontSize: 12 }}>{paywall.note}</div>
            )}
          </div>
        )}

        {generated && (
          <div style={{ marginTop: 26 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontSize: 28, fontWeight: 900 }}>Tavs paraugs</div>
              <button
                onClick={() => router.back()}
                style={{
                  border: 0,
                  background: "transparent",
                  color: "#2563eb",
                  fontWeight: 900,
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                ← Atpakaļ
              </button>
            </div>

            <div style={{ marginTop: 12, borderRadius: 16, background: "#f8fafc", padding: 12 }}>
              {plan === "PRO" && modelToShowSafe ? (
                <GoogleLikeAdCard model={modelToShowSafe} allowSelect />
              ) : (
                <RightSideBlurLock text={overlayText}>
                  <GoogleLikeAdCard
                    model={generated}
                    allowSelect={false}
                    onCopyBlock={() => {
                      setError(lang === "en" ? "Copy is locked on FREE." : "Kopēšana FREE režīmā ir bloķēta.");
                      setPaywall({
                        title: lang === "en" ? "Unlock copy + editing" : "Atbloķē kopēšanu + rediģēšanu",
                        text:
                          lang === "en"
                            ? "Upgrade to PRO to copy, edit, and export your campaign."
                            : "Atbloķē FREE, lai kopētu, rediģētu un eksportētu kampaņu.",
                        ctaLabel: lang === "en" ? "Unlock full access" : "Atbloķēt FREE",
                        ctaHref: pricingPath,
                        note: lang === "en" ? "Takes less than a minute." : "Aizņem mazāk nekā minūti.",
                      });
                    }}
                  />
                </RightSideBlurLock>
              )}
            </div>

            {/* PRO editing */}
            {plan === "PRO" && editable && (
              <div style={{ marginTop: 16, borderRadius: 16, border: "1px solid #e5e7eb", padding: 14, background: "white" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ fontWeight: 900 }}>Rediģēšana</div>
                  <button
                    onClick={() => setIsEditing((v) => !v)}
                    style={{
                      marginLeft: "auto",
                      border: 0,
                      background: "#2563eb",
                      color: "white",
                      fontWeight: 900,
                      borderRadius: 12,
                      padding: "10px 14px",
                      cursor: "pointer",
                    }}
                  >
                    {isEditing ? "Aizvērt rediģēšanu" : "Rediģēt"}
                  </button>
                </div>

                {isEditing && (
                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={{ display: "grid", gap: 6 }}>
                      <div style={{ fontWeight: 800 }}>Virsraksti</div>
                      <input
                        value={editable.ad.headline1}
                        onChange={(e) =>
                          setEditable((p) => (p ? { ...p, ad: { ...p.ad, headline1: fitWords(e.target.value, 30) } } : p))
                        }
                        style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }}
                      />
                      <input
                        value={editable.ad.headline2}
                        onChange={(e) =>
                          setEditable((p) => (p ? { ...p, ad: { ...p.ad, headline2: fitWords(e.target.value, 30) } } : p))
                        }
                        style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }}
                      />
                      <input
                        value={editable.ad.headline3}
                        onChange={(e) =>
                          setEditable((p) => (p ? { ...p, ad: { ...p.ad, headline3: fitWords(e.target.value, 30) } } : p))
                        }
                        style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }}
                      />
                    </div>

                    <div style={{ display: "grid", gap: 6 }}>
                      <div style={{ fontWeight: 800 }}>Apraksti</div>
                      <input
                        value={editable.ad.description1}
                        onChange={(e) =>
                          setEditable((p) => (p ? { ...p, ad: { ...p.ad, description1: fitWords(e.target.value, 90) } } : p))
                        }
                        style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }}
                      />
                      <input
                        value={editable.ad.description2}
                        onChange={(e) =>
                          setEditable((p) => (p ? { ...p, ad: { ...p.ad, description2: fitWords(e.target.value, 90) } } : p))
                        }
                        style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }}
                      />
                    </div>

                    <div style={{ display: "grid", gap: 6 }}>
                      <div style={{ fontWeight: 800 }}>Sitelinki (4)</div>
                      {editable.siteLinks.slice(0, 4).map((s, idx) => (
                        <input
                          key={idx}
                          value={s}
                          onChange={(e) =>
                            setEditable((p) => {
                              if (!p) return p;
                              const next = [...p.siteLinks];
                              next[idx] = fitWords(e.target.value, 25);
                              return { ...p, siteLinks: next };
                            })
                          }
                          style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2 blue buttons */}
            <div style={{ marginTop: 16, display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a
                href={pricingPath}
                style={{
                  display: "inline-block",
                  padding: "14px 18px",
                  borderRadius: 14,
                  background: "#2563eb",
                  color: "white",
                  fontWeight: 900,
                  textDecoration: "none",
                  minWidth: 240,
                  textAlign: "center",
                }}
              >
                Izveidot kampaņu
              </a>

              <button
                onClick={onNewSample}
                style={{
                  padding: "14px 18px",
                  borderRadius: 14,
                  border: 0,
                  background: "#2563eb",
                  color: "white",
                  fontWeight: 900,
                  cursor: "pointer",
                  minWidth: 260,
                }}
              >
                Izveidot jaunu paraugu
              </button>
            </div>

            {/* ✅ IMPORTANT FIX:
                Manual Campaign Builder is ALWAYS rendered after generation.
                In FREE it shows LockedBox (so it won't "disappear").
            */}
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>Kampaņas struktūra (Manual)</div>

              {plan === "PRO" ? (
                <div style={{ borderRadius: 16, border: "1px solid #e5e7eb", padding: 14, background: "white" }}>
                  <div style={{ display: "grid", gap: 12 }}>
                    {/* Keywords editor */}
                    <div style={{ display: "grid", gap: 10 }}>
                      <div style={{ fontWeight: 900 }}>Keywords (rediģējami)</div>

                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <input
                          value={kwDraft}
                          onChange={(e) => setKwDraft(e.target.value)}
                          placeholder={lang === "en" ? "Add a keyword (e.g. plumbing service)" : "Pievieno atslēgvārdu (piem. santehniķis)"}
                          style={{
                            flex: 1,
                            minWidth: 240,
                            padding: 10,
                            borderRadius: 12,
                            border: "1px solid #e5e7eb",
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addKeyword();
                            }
                          }}
                        />

                        <button
                          onClick={addKeyword}
                          style={{
                            border: 0,
                            background: "#111827",
                            color: "white",
                            fontWeight: 900,
                            borderRadius: 12,
                            padding: "10px 12px",
                            cursor: "pointer",
                          }}
                        >
                          + {lang === "en" ? "Add" : "Pievienot"}
                        </button>

                        <button
                          onClick={() => handleCopy(lang === "en" ? "✅ Keywords copied" : "✅ Atslēgvārdi nokopēti", manualTextKeywordsOnly)}
                          style={{
                            border: 0,
                            background: "#2563eb",
                            color: "white",
                            fontWeight: 900,
                            borderRadius: 12,
                            padding: "10px 12px",
                            cursor: "pointer",
                          }}
                        >
                          <>
                          {isFree && <span style={{ marginRight: 6 }}>🔒</span>}
                          {lang === "en" ? "Copy keywords" : "Kopēt atslēgvārdus"}
                        </>
                        </button>
                      </div>

                      {keywordList.length === 0 ? (
                        <div style={{ color: "#6b7280", fontWeight: 700 }}>{lang === "en" ? "No keywords yet." : "Pagaidām nav atslēgvārdu."}</div>
                      ) : (
                        <div style={{ display: "grid", gap: 8 }}>
                          {keywordList.map((k, i) => (
                            <div
                              key={`${k}-${i}`}
                              style={{
                                display: "flex",
                                gap: 10,
                                alignItems: "center",
                                border: "1px solid #e5e7eb",
                                borderRadius: 12,
                                padding: 10,
                                background: "#fafafa",
                              }}
                            >
                              {kwEditIndex === i ? (
                                <>
                                  <input
                                    value={kwEditValue}
                                    onChange={(e) => setKwEditValue(e.target.value)}
                                    style={{
                                      flex: 1,
                                      padding: 10,
                                      borderRadius: 12,
                                      border: "1px solid #e5e7eb",
                                      background: "white",
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        saveEdit();
                                      }
                                      if (e.key === "Escape") {
                                        e.preventDefault();
                                        setKwEditIndex(null);
                                        setKwEditValue("");
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={saveEdit}
                                    style={{
                                      border: 0,
                                      background: "#111827",
                                      color: "white",
                                      fontWeight: 900,
                                      borderRadius: 12,
                                      padding: "10px 12px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {lang === "en" ? "Save" : "Saglabāt"}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <div style={{ flex: 1, fontWeight: 900, color: "#111827" }}>{k}</div>

                                  <button
                                    onClick={() => {
                                      setKwEditIndex(i);
                                      setKwEditValue(k);
                                    }}
                                    style={{
                                      border: "1px solid #d1d5db",
                                      background: "white",
                                      color: "#111827",
                                      fontWeight: 900,
                                      borderRadius: 12,
                                      padding: "10px 12px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {lang === "en" ? "Edit" : "Labot"}
                                  </button>

                                  <button
                                    onClick={() => removeKeyword(i)}
                                    style={{
                                      border: "1px solid #fecaca",
                                      background: "white",
                                      color: "#b91c1c",
                                      fontWeight: 900,
                                      borderRadius: 12,
                                      padding: "10px 12px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {lang === "en" ? "Delete" : "Dzēst"}
                                  </button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* CSV export buttons */}
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                        <button
                          onClick={() => handleCopy(lang === "en" ? "✅ CSV (keywords) copied" : "✅ CSV (atslēgvārdi) nokopēts", csvKeywords)}
                          style={{
                            border: 0,
                            background: "#111827",
                            color: "white",
                            fontWeight: 900,
                            borderRadius: 12,
                            padding: "10px 12px",
                            cursor: "pointer",
                          }}
                        >
                          <>
                          {isFree && <span style={{ marginRight: 6 }}>🔒</span>}
                          {lang === "en" ? "Copy CSV (Keywords)" : "Kopēt CSV (atslēgvārdi)"}
                          </>
                        </button>

                        <button
                          onClick={() => handleCopy(lang === "en" ? "✅ CSV (ads) copied" : "✅ CSV (reklāmas) nokopēts", csvAdsSitelinks)}
                          style={{
                            border: 0,
                            background: "#2563eb",
                            color: "white",
                            fontWeight: 900,
                            borderRadius: 12,
                            padding: "10px 12px",
                            cursor: "pointer",
                          }}
                        >
                          <>
                          {isFree && <span style={{ marginRight: 6 }}>🔒</span>}
                          {lang === "en" ? "Copy CSV (Ads + Sitelinks)" : "Kopēt CSV (teksti + sitelinki)"}
                          </>
                        </button>

                        <button
                          onClick={() => downloadTextFile("campaign-export.csv", csvFull)}
                          style={{
                            border: "1px solid #d1d5db",
                            background: "white",
                            color: "#111827",
                            fontWeight: 900,
                            borderRadius: 12,
                            padding: "10px 12px",
                            cursor: "pointer",
                          }}
                        >
                          <>
                          {isFree && <span style={{ marginRight: 6 }}>🔒</span>}
                          <>
                          {isFree && <span style={{ marginRight: 6 }}>🔒</span>}
                          {lang === "en" ? "Download CSV (Full)" : "Lejupielādēt CSV (viss)"}
                          </>
                        </>
                        </button>
                      </div>

                      <div style={{ color: "#6b7280", fontWeight: 700, fontSize: 12 }}>
                        {lang === "en"
                          ? "CSV tip: Open Google Sheets → File → Import → Paste data, or download the file."
                          : "CSV padoms: Atver Google Sheets → File → Import → Paste data, vai lejupielādē failu."}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
                      <button
                        onClick={() => handleCopy(lang === "en" ? "✅ Campaign copied" : "✅ Kampaņa nokopēta", manualTextAll)}
                        style={{
                          border: 0,
                          background: "#2563eb",
                          color: "white",
                          fontWeight: 900,
                          borderRadius: 14,
                          padding: "12px 14px",
                          cursor: "pointer",
                          minWidth: 240,
                        }}
                      >
                        <>
                          {isFree && <span style={{ marginRight: 6 }}>🔒</span>}
                          {lang === "en" ? "Copy full campaign" : "Kopēt visu kampaņu"}
                        </>
                      </button>

                      <button
                        onClick={() => handleCopy(lang === "en" ? "✅ Ad texts copied" : "✅ Reklāmas teksti nokopēti", manualTextAdsOnly)}
                        style={{
                          border: "1px solid #2563eb",
                          background: "white",
                          color: "#2563eb",
                          fontWeight: 900,
                          borderRadius: 14,
                          padding: "12px 14px",
                          cursor: "pointer",
                          minWidth: 240,
                        }}
                      >
                        <>
                          {isFree && <span style={{ marginRight: 6 }}>🔒</span>}
                          {lang === "en" ? "Copy ad texts" : "Kopēt reklāmas tekstus"}
                        </>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <LockedBox
                  title="Manual Campaign Builder (bloķēts)"
                  text="Šeit ir gatava kampaņas struktūra: ad groups, atslēgvārdi, negatīvie vārdi un copy-paste eksports uz Google Ads."
                  ctaLabel="Atbloķēt Manual (Izveidot kampaņu)"
                  ctaHref={pricingPath}
                >
                  {/* FREE: show a plausible “hidden” manual layout, but keep it visible (locked) */}
                  <div style={{ borderRadius: 16, border: "1px solid #e5e7eb", padding: 14, background: "white" }}>
                    <div style={{ fontWeight: 900, marginBottom: 8 }}>Campaign settings</div>
                    <div style={{ height: 120, background: "#fafafa", borderRadius: 14, border: "1px solid #e5e7eb" }} />
                    <div style={{ height: 14 }} />
                    <div style={{ fontWeight: 900, marginBottom: 8 }}>Ad groups & keywords</div>
                    <div style={{ height: 160, background: "#fafafa", borderRadius: 14, border: "1px solid #e5e7eb" }} />
                  </div>
                </LockedBox>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

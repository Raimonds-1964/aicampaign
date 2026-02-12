"use client";

import { Container } from "../../components/Container";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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

type Lang = "en";

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

function expandTo25(label: string) {
  let t = (label || "").replace(/\s+/g, " ").trim();
  t = t.replace(/[|•·]/g, " ").replace(/\s+/g, " ").trim();
  if (!t) return "";

  const addOns = ["and pricing", "and delivery", "and discounts", "and deals", "and options", "and selection"];

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

function nicePathText(u: string) {
  try {
    const url = new URL(u);
    const p = decodeURIComponent(url.pathname || "/");
    const s = p.replace(/^\/+/, "").replace(/\/+$/, "");
    if (!s) return "Home";
    const parts = s.split("/").filter(Boolean);
    const last = parts[parts.length - 1] || s;
    return last
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^./, (c) => c.toUpperCase());
  } catch {
    return "Home";
  }
}

/** =========================
 * Theme extraction (simple)
 * ========================= */
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
  ].map((s) => s.toLowerCase())
);

const TOPIC_BLACKLIST_EN = new Set(
  ["privacy", "policy", "terms", "cookies", "contact", "login", "register", "faq", "en"].map((s) => s.toLowerCase())
);

function tokenize(text: string) {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}-]/gu, ""))
    .filter((w) => w.length >= 3)
    .filter((w) => !STOPWORDS_EN.has(w))
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
  if (t.includes("cart") || t.includes("checkout") || t.includes("order") || t.includes("buy") || t.includes("payment")) return "Sales";
  return "Leads";
}

function pickThemes(seeds: string[]) {
  const cleaned = seeds
    .map((w) => w.toLowerCase().trim())
    .filter((w) => !STOPWORDS_EN.has(w))
    .filter((w) => !TOPIC_BLACKLIST_EN.has(w));

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

function makeHeadlines(params: { theme: string; goal: string }) {
  const { theme, goal } = params;
  const niceTheme = toName(theme);
  const isShop = goal === "Sales";

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

function makeAdPreview(params: { theme: string; domain: string; goal: string; finalUrl: string }): AdPreview {
  const { theme, domain, goal, finalUrl } = params;

  const path = safePathFromUrl(finalUrl);
  const displayUrl = `${domain}${path ? `/${path}` : ""}`.replace(/\/$/, "");
  const { headline1, headline2, headline3 } = makeHeadlines({ theme, goal });
  const isShop = goal === "Sales";

  const descPartsShop = [
    "Browse the selection and pick the best fit",
    "Order online in minutes and get fast delivery",
    "Great prices, clear terms, and helpful support",
    "Secure checkout with a smooth buying process",
    "Discover deals, bundles, and new arrivals",
    "Find options that match your needs and budget",
  ];

  const descPartsLead = [
    "Tell us what you need and get a tailored quote",
    "Clear pricing, expert guidance, and fast response",
    "A simple process from first message to results",
    "Get practical recommendations and next steps",
    "Book a quick call and move forward today",
    "Reliable service with a professional approach",
  ];

  const desc2Shop = [
    "Compare options and choose the right one",
    "Fast delivery, secure payments, and support",
    "Save with discounts and limited-time deals",
    "Check availability and order with confidence",
    "New arrivals and top picks available now",
  ];

  const desc2Lead = [
    "Send a request and get a fast response",
    "Transparent terms and predictable costs",
    "Start with a quick message and next steps",
    "We help you choose the best approach",
    "Get a quote and practical guidance today",
  ];

  const description1 = buildDescriptionNear90(isShop ? descPartsShop : descPartsLead, 82, 90);
  const description2 = buildDescriptionNear90(isShop ? desc2Shop : desc2Lead, 82, 90);

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
      p.includes("privacy") ||
      p.includes("terms") ||
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
  return s === "en" || s === "english";
}
function pickSiteLinks(params: { links: Array<{ url: string; text: string | null }>; goal: string }) {
  const { links, goal } = params;

  const candidates = (links || [])
    .filter((l) => l?.url && !isBadLink(l.url))
    .map((l) => {
      const raw = (l.text || "").replace(/\s+/g, " ").trim();
      const labelBase = raw ? raw : nicePathText(l.url);
      return labelBase;
    })
    .filter((t) => !!t && !isLanguageSwitchText(t));

  const shuffled = shuffle(candidates);

  const picks: string[] = [];
  for (const s of shuffled) {
    if (picks.length >= 4) break;
    const expanded = expandTo25(s);
    if (!expanded) continue;
    if (!picks.includes(expanded)) picks.push(expanded);
  }

  const isShop = goal === "Sales";
  const standard = isShop
    ? ["Deals and Discounts", "Products and Selection", "Delivery and Pricing", "Best Offers Today"]
    : ["Services and Pricing", "Reviews and Results", "Solutions and Options", "Request and Next Steps"];

  for (const s of shuffle(standard)) {
    if (picks.length >= 4) break;
    const expanded = expandTo25(s);
    if (expanded && !picks.includes(expanded)) picks.push(expanded);
  }

  while (picks.length < 4) {
    const s = expandTo25("Learn more");
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

const PLAN_KEY = "aiads:plan"; // "pro" | (missing) = free
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

// Keep key for backwards compatibility, but always EN.
const LANG_KEY = "aiads:lang"; // "en"
function readLang(): Lang {
  try {
    const v = localStorage.getItem(LANG_KEY);
    return v === "en" ? "en" : "en";
  } catch {
    return "en";
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

function looksNonEnglish(text: string) {
  // quick heuristic: non-ASCII diacritics often indicate unexpected language output
  return /[^\x09\x0A\x0D\x20-\x7E]/.test(text || "");
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
            After unlocking, you can copy and edit the full campaign structure.
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
  const paywallRef = useRef<HTMLDivElement | null>(null);

  const [mounted, setMounted] = useState(false);

  const [plan, setPlan] = useState<"FREE" | "PRO">("FREE");
  const isFree = plan === "FREE";

  const [lang, setLang] = useState<Lang>("en");
  const langRef = useRef<Lang>("en");

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
  const [campaignBudget, setCampaignBudget] = useState<string>("25");
  const [campaignLocation, setCampaignLocation] = useState<string>("United States");
  const [campaignBidding, setCampaignBidding] = useState<string>("Maximize clicks");
  const [campaignGoal, setCampaignGoal] = useState<string>("Leads");

  // keyword editor
  const [kwDraft, setKwDraft] = useState<string>("");
  const [kwEditIndex, setKwEditIndex] = useState<number | null>(null);
  const [kwEditValue, setKwEditValue] = useState<string>("");

  const normalizedUrl = useMemo(() => normalizeInputUrl(url), [url]);
  const urlOk = useMemo(() => isLikelyUrl(normalizedUrl), [normalizedUrl]);

  const pricingPath = "/pricing";
  const overlayText = "Generate a sample to unlock and edit additional examples.";

  const dailyLimit = 20;
  const limitMsg = `Daily limit reached (${dailyLimit} generations).`;

  const remainingToday = useMemo(() => {
    if (plan !== "FREE") return dailyLimit;
    const current = Number.isFinite(demoCount) ? demoCount : 0;
    return Math.max(0, dailyLimit - current);
  }, [plan, demoCount]);

  const isGenBlocked = plan === "FREE" && remainingToday <= 0;

  const instantExample: AdViewModel = useMemo(() => {
    const domain = "example.com";
    const goal = "Leads";
    const theme = "digital marketing";

    const ad = makeAdPreview({
      theme,
      domain,
      goal,
      finalUrl: `https://example.com/services/marketing`,
    });

    const siteLinks = ["Services and Pricing", "Reviews and Results", "Solutions and Options", "Request and Next Steps"]
      .map((s) => expandTo25(s))
      .map((s) => fitWords(s, 25));

    return { ad, siteLinks };
  }, []);

  useEffect(() => {
    setMounted(true);
    setPlan(readPlan());
    const storedLang = readLang();
    setLang(storedLang);
    langRef.current = storedLang;
    setDemoCount(readDemoCount());

    try {
      const u = new URL(window.location.href);
      const success = u.searchParams.get("success");
      if (success === "1") {
        setProPlan();
        setPlan("PRO");
        setError("✅ Thanks! PRO is now unlocked.");
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

      setCampaignLocation("United States");
      setCampaignBidding("Maximize clicks");
    } else {
      setEditable(null);
      setIsEditing(false);
    }
  }, [generated]);

  async function onGenerate() {
    setError(null);
    setPaywall(null);

    const v = normalizeInputUrl(url.trim());
    if (!isLikelyUrl(v)) {
      setError("Please enter a valid website URL (e.g., www.example.com or https://example.com).");
      return;
    }

    if (plan === "FREE") {
      const current = readDemoCount();
      setDemoCount(current);
      if (current >= dailyLimit) {
        setError(limitMsg);
        setPaywall({
          title: "Unlock unlimited generation",
          text: "Choose a plan and build a complete Google Ads campaign in minutes.",
          ctaLabel: "View pricing",
          ctaHref: pricingPath,
          note: "Unlocks instantly.",
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
        const seeds = topWords(tokenize(pageText), 60);
        themes = pickThemes(seeds);
      }

      if (!themes.length) {
        const path = safePathFromUrl(v).replace(/[-_]+/g, " ").trim();
        const fromUrl = path ? path.split(/\s+/).slice(0, 8) : [];
        const fromDomain = domain.split(".")[0]?.split(/[-_]+/).filter(Boolean) || [];
        themes = [...fromUrl, ...fromDomain].filter(Boolean);
      }

      if (!themes.length) {
        themes = ["services", "solutions", "pricing", "delivery", "deals"];
      }

      setKeywords(themes.slice(0, 12));

      let linksResp: FetchLinksResp | null = null;
      try {
        const lr = await fetch(`/api/ai/fetch-links?url=${encodeURIComponent(v)}`, { cache: "no-store" });
        const lj = (await lr.json().catch(() => null)) as FetchLinksResp | null;
        if (lr.ok && lj?.ok) linksResp = lj;
      } catch {}

      const links = linksResp?.links || [];

      // OpenAI generation (FREE + PRO)
      try {
        const gr = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: v,
            lang: "en",
            plan, // "FREE" | "PRO"
            pageText,
            links,
          }),
        });

        const gText = await gr.text();
        let gj: any = null;
        try {
          gj = JSON.parse(gText);
        } catch {}

        if (gr.ok && gj?.ok && gj?.ad && Array.isArray(gj?.siteLinks)) {
          if (Array.isArray(gj?.keywords) && gj.keywords.length) {
            setKeywords(gj.keywords.slice(0, 12));
          }

          const openAiModel: AdViewModel = {
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

          const combined = `${openAiModel.ad.headline1} ${openAiModel.ad.headline2} ${openAiModel.ad.headline3} ${openAiModel.ad.description1} ${openAiModel.ad.description2} ${openAiModel.siteLinks.join(" ")}`;
          if (!looksNonEnglish(combined)) {
            if (plan === "FREE") setDemoCount(incDemoCount());
            setGenerated(openAiModel);
            return;
          } else {
            console.warn("Non-English characters detected while EN selected. Falling back to heuristic.");
          }
        } else {
          console.warn("OpenAI generate failed, falling back to heuristic:", { status: gr.status, gText });
        }
      } catch (e) {
        console.warn("OpenAI generate crashed, falling back to heuristic:", e);
      }

      // Heuristic fallback
      const candidates: AdViewModel[] = [];
      const chosenThemes = shuffle(themes).slice(0, 8);

      for (const theme of chosenThemes) {
        for (let i = 0; i < 4; i++) {
          const ad = makeAdPreview({ theme, domain, goal, finalUrl: v });
          const siteLinks = pickSiteLinks({ links, goal })
            .map((s) => expandTo25(s))
            .map((s) => fitWords(s, 25));

          candidates.push({ ad, siteLinks });
        }
      }

      const chosen = candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : null;
      if (!chosen) {
        setError("Couldn't generate a sample. Please try a different URL.");
        return;
      }

      if (plan === "FREE") setDemoCount(incDemoCount());
      setGenerated(chosen);
    } catch {
      setError("A server error occurred. Please try again.");
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

    if (plan === "FREE") {
      const current = readDemoCount();
      if (current >= dailyLimit) {
        setError(limitMsg);
        setPaywall({
          title: "Unlock unlimited generation",
          text: "Choose a plan and build a complete Google Ads campaign in minutes.",
          ctaLabel: "View pricing",
          ctaHref: pricingPath,
          note: "Unlocks instantly.",
        });
        setTimeout(() => {
          paywallRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
    }
  }

  const showTop = !generated;
  const modelToShow = (plan === "PRO" ? (editable ?? generated) : generated) ?? null;

  const campaignTypeLabel = "Search";
  const goalLabel = campaignGoal === "Sales" ? "Sales" : "Leads";

  const defaultNegatives = useMemo(() => {
    return ["free", "job", "jobs", "career", "resume", "used", "second hand", "download", "torrent"];
  }, []);

  const keywordList = useMemo(() => {
    const base = (keywords || []).map(cleanKeyword).filter(Boolean);
    const uniq = Array.from(new Set(base));
    return uniq.slice(0, 12);
  }, [keywords]);

  const adGroups = useMemo(() => {
    const groups = chunk(keywordList, 4).slice(0, 3);
    return groups.map((kws, i) => {
      const nameBase = kws[0] ? toName(kws[0]) : `Ad group ${i + 1}`;
      const name = fitWords(nameBase, 28) || nameBase;
      const lines = kws.flatMap(keywordLines);
      return { name, lines, kws };
    });
  }, [keywordList]);

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
    rows.push(["Campaign", "Location", campaignLocation || "United States"]);
    rows.push(["Campaign", "Language", "English"]);
    rows.push(["Campaign", "Bidding", campaignBidding || "Maximize clicks"]);
    rows.push(["Campaign", "Daily budget", `${campaignBudget} USD`]);
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
  }, [modelToShow, url, campaignTypeLabel, goalLabel, campaignLocation, campaignBidding, campaignBudget, adGroups, defaultNegatives]);

  const manualTextAll = useMemo(() => {
    const m = modelToShow;
    const finalUrl = normalizeInputUrl(url.trim());
    const domain = basicDomain(finalUrl) || (m?.ad.siteName ?? "");

    const header = [
      `Campaign type: ${campaignTypeLabel}`,
      `Goal: ${goalLabel}`,
      `Location: ${campaignLocation || "United States"}`,
      `Language: English`,
      `Bidding: ${campaignBidding || "Maximize clicks"}`,
      `Daily budget: ${campaignBudget} USD`,
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

    const negText = [``, `Negative keywords:`, ...defaultNegatives.map((n) => `- ${n}`)];

    return [...header, ...groupsText, ...adText, ...negText].join("\n").trim();
  }, [modelToShow, url, campaignTypeLabel, goalLabel, campaignLocation, campaignBidding, campaignBudget, adGroups, defaultNegatives]);

  const manualTextMini = useMemo(() => {
    const lines = (manualTextAll || "").split("\n").filter(Boolean).slice(0, 10);
    return lines.join("\n");
  }, [manualTextAll]);

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
      setError("Nothing to copy.");
      return;
    }
    const ok = await copyToClipboard(text);
    if (ok) setError(label);
    else setError("Copy failed. Please copy manually.");
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

  function openUpgradePaywall() {
    setError("This feature is locked on FREE.");
    setPaywall({
      title: "Unlock copy + editing",
      text: "Choose a plan to copy, edit, and export your campaign.",
      ctaLabel: "Upgrade now",
      ctaHref: pricingPath,
      note: "Takes less than a minute.",
    });
  }

  if (!mounted) return null;

  return (
    <main style={{ padding: "24px 0 110px", fontFamily: "Arial, sans-serif" }}>
      <Container>
        {showTop && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Example</div>

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
              ← Back
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
                View pricing plans
              </a>

              {plan === "PRO" && <div style={{ fontWeight: 900, color: "#16a34a" }}>PRO unlocked</div>}

              <div style={{ marginLeft: "auto" }} />
            </div>

            {plan === "FREE" && remainingToday > 1 && (
              <div style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: "#6b7280" }}>
                FREE: {remainingToday} / {dailyLimit} generations left today
              </div>
            )}

            {plan === "FREE" && remainingToday === 1 && (
              <div style={{ marginTop: 14, fontSize: 13, fontWeight: 900, color: "#dc2626" }}>
                ⚠️ Last generation available today
              </div>
            )}

            <div style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter a website URL (e.g., www.example.com)"
                  disabled={isGenBlocked}
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 44px",
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

                {isGenBlocked && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 18,
                      opacity: 0.65,
                      pointerEvents: "none",
                    }}
                  >
                    🔒
                  </span>
                )}
              </div>

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
                {loading ? "Generating…" : "Generate new sample"}
              </button>
            </div>

            {isGenBlocked && (
              <div style={{ marginTop: 10, color: "#111827", fontWeight: 800, fontSize: 13 }}>
                🔓 Upgrade to keep generating without limits.
              </div>
            )}

            {!isGenBlocked && url.trim() && normalizedUrl && normalizedUrl !== url.trim() && (
              <div style={{ marginTop: 8, color: "#6b7280", fontSize: 13, fontWeight: 700 }}>
                Using: {normalizedUrl}
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
            ref={paywallRef}
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
              <div style={{ fontSize: 28, fontWeight: 900 }}>Your sample</div>
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
                ← Back
              </button>
            </div>

            <div style={{ marginTop: 12, borderRadius: 16, background: "#f8fafc", padding: 12 }}>
              {plan === "PRO" && modelToShow ? (
                <GoogleLikeAdCard model={modelToShow} allowSelect />
              ) : (
                <RightSideBlurLock text={overlayText}>
                  <GoogleLikeAdCard
                    model={generated}
                    allowSelect={false}
                    onCopyBlock={() => {
                      openUpgradePaywall();
                    }}
                  />
                </RightSideBlurLock>
              )}

              {plan === "FREE" && (
                <div
                  style={{
                    marginTop: 12,
                    borderRadius: 16,
                    border: "1px solid #e5e7eb",
                    background: "white",
                    padding: 12,
                  }}
                >
                  <div style={{ fontWeight: 900, color: "#111827" }}>Like this result?</div>
                  <div style={{ marginTop: 6, color: "#374151", fontWeight: 700, lineHeight: 1.35 }}>
                    Upgrade to build a complete Google Ads Search campaign in minutes.
                  </div>
                </div>
              )}
            </div>

            {plan === "PRO" && editable && (
              <div style={{ marginTop: 16, borderRadius: 16, border: "1px solid #e5e7eb", padding: 14, background: "white" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ fontWeight: 900 }}>Editing</div>
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
                    {isEditing ? "Close editor" : "Edit"}
                  </button>
                </div>

                {isEditing && (
                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={{ display: "grid", gap: 6 }}>
                      <div style={{ fontWeight: 800 }}>Headlines</div>
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
                      <div style={{ fontWeight: 800 }}>Descriptions</div>
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
                      <div style={{ fontWeight: 800 }}>Sitelinks (4)</div>
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
                View pricing
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
                Generate another sample
              </button>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>Campaign structure (Manual)</div>

              {plan === "PRO" ? (
                <div style={{ borderRadius: 16, border: "1px solid #e5e7eb", padding: 14, background: "white" }}>
                  <div style={{ display: "grid", gap: 12 }}>
                    <div style={{ display: "grid", gap: 10 }}>
                      <div style={{ fontWeight: 900 }}>Keywords (editable)</div>

                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <input
                          value={kwDraft}
                          onChange={(e) => setKwDraft(e.target.value)}
                          placeholder="Add a keyword (e.g., plumbing service)"
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
                          + Add
                        </button>

                        <button
                          onClick={() => handleCopy("✅ Keywords copied", manualTextKeywordsOnly)}
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
                          Copy keywords
                        </button>
                      </div>

                      {keywordList.length === 0 ? (
                        <div style={{ color: "#6b7280", fontWeight: 700 }}>No keywords yet.</div>
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
                                    Save
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
                                    Edit
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
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                        <button
                          onClick={() => handleCopy("✅ CSV (keywords) copied", csvKeywords)}
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
                          Copy CSV (Keywords)
                        </button>

                        <button
                          onClick={() => handleCopy("✅ CSV (ads) copied", csvAdsSitelinks)}
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
                          Copy CSV (Ads + Sitelinks)
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
                          Download CSV (Full)
                        </button>
                      </div>

                      <div style={{ color: "#6b7280", fontWeight: 700, fontSize: 12 }}>
                        CSV tip: Open Google Sheets → File → Import → Paste data, or download the file.
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
                      <button
                        onClick={() => handleCopy("✅ Campaign copied", manualTextAll)}
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
                        Copy full campaign
                      </button>

                      <button
                        onClick={() => handleCopy("✅ Ad texts copied", manualTextAdsOnly)}
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
                        Copy ad texts
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <LockedBox
                  title="Manual Campaign Builder (Locked)"
                  text="Get a ready-to-use structure: ad groups, keywords, negatives, plus copy/paste exports for Google Ads."
                  ctaLabel="Unlock Manual Builder"
                  ctaHref={pricingPath}
                >
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                    <button
                      type="button"
                      onClick={() => openUpgradePaywall()}
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
                      <span style={{ marginRight: 6 }}>🔒</span>
                      Copy keywords
                    </button>

                    <button
                      type="button"
                      onClick={() => openUpgradePaywall()}
                      style={{
                        border: "1px solid #2563eb",
                        background: "white",
                        color: "#2563eb",
                        fontWeight: 900,
                        borderRadius: 12,
                        padding: "10px 12px",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ marginRight: 6 }}>🔒</span>
                      Copy ad texts
                    </button>

                    <button
                      type="button"
                      onClick={() => openUpgradePaywall()}
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
                      <span style={{ marginRight: 6 }}>🔒</span>
                      Download CSV
                    </button>
                  </div>

                  <div
                    style={{
                      borderRadius: 16,
                      border: "1px solid #e5e7eb",
                      background: "white",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <div style={{ padding: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ fontWeight: 900, color: "#0f172a" }}>Manual Builder (Preview)</div>
                        <div
                          style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            background: "#eef2ff",
                            color: "#1e40af",
                            fontWeight: 900,
                            fontSize: 12,
                            whiteSpace: "nowrap",
                          }}
                        >
                          PREVIEW
                        </div>
                      </div>

                      <div style={{ marginTop: 6, color: "#475569", fontWeight: 700, fontSize: 13, lineHeight: 1.35 }}>
                        This is the format. Copy/export unlocks with any paid plan.
                      </div>

                      <pre
                        style={{
                          marginTop: 10,
                          background: "#f8fafc",
                          border: "1px solid #e5e7eb",
                          borderRadius: 14,
                          padding: 12,
                          fontSize: 12,
                          lineHeight: 1.45,
                          color: "#0f172a",
                          whiteSpace: "pre-wrap",
                          userSelect: "none",
                          filter: "blur(4px)",
                          maxHeight: 120,
                          overflow: "hidden",
                        }}
                      >
                        {manualTextMini || "Campaign type: …\nGoal: …\nLocation: …\nKeywords: …"}
                      </pre>
                    </div>

                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 80,
                        background: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.95))",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </LockedBox>
              )}
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}

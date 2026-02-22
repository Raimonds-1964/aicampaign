"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import SectionHeader from "@/app/(basic)/basic/administrator/_ui/SectionHeader";
import KeywordsTable from "@/app/(basic)/basic/administrator/_ui/KeywordsTable";

import CampaignParamCard from "@/app/(basic)/basic/shared/ui/CampaignParamCard";

import {
  useAgencyStore,
  getAgencyStore,
  agencySelectors,
} from "@/app/(basic)/basic/shared/_data/agencyStore";

type Health = "ok" | "warning" | "critical";

type Props = {
  mode: "admin" | "manager";
  accountId: string;
  campaignId: string; // e.g. "ai-c-104"
};

const MAX_BASIC_PARAMS = 4;

const card =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm overflow-hidden";
const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10";

function HealthBadge({ h }: { h: Health }) {
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold";

  if (h === "ok") {
    return (
      <span
        className={
          base +
          " border-emerald-400/30 text-emerald-200 bg-emerald-500/10"
        }
      >
        OK
      </span>
    );
  }

  if (h === "warning") {
    return (
      <span
        className={base + " border-amber-400/30 text-amber-200 bg-amber-500/10"}
      >
        Needs attention
      </span>
    );
  }

  return (
    <span className={base + " border-red-400/30 text-red-200 bg-red-500/10"}>
      Critical
    </span>
  );
}

function budgetBarClass(pct: number) {
  if (pct >= 80) return "bg-red-400/70";
  if (pct >= 50) return "bg-amber-300/80";
  return "bg-emerald-300/80";
}

function healthFromScore(score?: number): Health {
  const v = Number(score ?? 0);
  if (v >= 75) return "ok";
  if (v >= 45) return "warning";
  return "critical";
}

type AiParamGroup =
  | "Budget & delivery"
  | "Search terms"
  | "Ads & assets"
  | "Bids"
  | "Landing page"
  | "Audience"
  | "Geo"
  | "Tracking"
  | "Auction & quality";

type AiParamDef = {
  key: string;
  title: string;
  group: AiParamGroup;
  description: string;
  defaultSelected?: boolean;
};

// ✅ Same 16 as Pro/Agency
const AI_PARAM_CATALOG: AiParamDef[] = [
  {
    key: "budget_pacing",
    title: "Budget pacing",
    group: "Budget & delivery",
    description: "Daily budget pacing, overspend/underspend and delivery stability.",
    defaultSelected: true,
  },
  {
    key: "search_terms",
    title: "Search terms (irrelevant queries)",
    group: "Search terms",
    description: "Wasted spend signals from irrelevant queries + negatives suggestions.",
  },
  {
    key: "ads_strength",
    title: "Ad strength (RSA assets)",
    group: "Ads & assets",
    description: "Headline/description variety, ad strength signals and asset coverage.",
  },
  {
    key: "bids_cpc",
    title: "CPC / bid adjustments",
    group: "Bids",
    description: "Avg CPC changes, bid pressure, and basic bid adjustment recommendations.",
  },
  {
    key: "landing_page",
    title: "Landing page relevance",
    group: "Landing page",
    description: "Message match, page relevance and basic UX/speed mismatch signals.",
  },
  {
    key: "audiences",
    title: "Audience signals / remarketing",
    group: "Audience",
    description: "Audience signals, remarketing coverage and expansion opportunities.",
  },
  {
    key: "geo",
    title: "Geo (where spend is going)",
    group: "Geo",
    description: "Location performance monitoring and exclusion / bid adjustment signals.",
  },
  {
    key: "conversion_tracking",
    title: "Conversion tracking",
    group: "Tracking",
    description: "Conversion completeness and tracking health signals.",
  },

  // +8 critical
  {
    key: "impression_share",
    title: "Impression share (lost to budget/rank)",
    group: "Auction & quality",
    description:
      "Monitor Search IS + Lost IS (budget/rank) to catch hidden growth caps and rank pressure.",
  },
  {
    key: "quality_score",
    title: "Quality score signals",
    group: "Auction & quality",
    description:
      "Quality Score + components (expected CTR, ad relevance, landing page experience) where available.",
  },
  {
    key: "policy_issues",
    title: "Policy / disapprovals",
    group: "Ads & assets",
    description:
      "Detect disapproved ads/assets and policy risks that block delivery or reduce reach.",
  },
  {
    key: "rsa_asset_coverage",
    title: "RSA asset coverage & pinning risk",
    group: "Ads & assets",
    description:
      "Missing assets, weak coverage, or heavy pinning that reduces learning and performance.",
  },
  {
    key: "device_performance",
    title: "Device performance split",
    group: "Bids",
    description:
      "Compare performance by device to suggest bid adjustments or landing page fixes.",
  },
  {
    key: "geo_outliers",
    title: "Geo outliers (spend without results)",
    group: "Geo",
    description:
      "Spot locations with spend but poor conversion/value to exclude or down-bid quickly.",
  },
  {
    key: "ad_schedule_hours",
    title: "Ad schedule (hours/day) outliers",
    group: "Budget & delivery",
    description:
      "Find expensive hours/days and propose schedule tuning to protect CPA/ROAS.",
  },
  {
    key: "landing_page_speed",
    title: "Landing page speed / experience risk",
    group: "Landing page",
    description:
      "Flag likely speed/UX friction that harms CVR and QS (useful before deeper audits).",
  },
];

function normalizeToSet(v: unknown): Set<string> {
  if (Array.isArray(v)) return new Set(v.map(String));
  return new Set<string>();
}

function safeReadJson(key: string): unknown {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function safeWriteJson(key: string, value: unknown) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export default function CampaignDetails(props: Props) {
  useAgencyStore();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [keywordsOpen, setKeywordsOpen] = useState(true);

  // ✅ Default collapsed (like Agency)
  const [aiParamsOpen, setAiParamsOpen] = useState(false);
  const [aiParamQuery, setAiParamQuery] = useState("");
  const [aiParamLimitMsg, setAiParamLimitMsg] = useState<string | null>(null);

  // ✅ approve state for cards
  const [approved, setApproved] = useState<Record<string, boolean>>({});

  const accountId = String(props.accountId ?? "");
  const campaignId = String(props.campaignId ?? "");

  // ✅ IMPORTANT: plan-prefixed key (so Basic doesn't collide with Pro/Agency)
  const aiSelectedStorageKey = `basic:acc:${accountId}:cmp:${campaignId}:ai_params_selected`;

  // ✅ Hydration guard: we only write after we loaded THIS key
  const hydratedKeyRef = useRef<string | null>(null);

  const defaultSelectedKeys = useMemo(() => {
    // In Basic, we keep the same “recommended” baseline as Agency:
    // budget pacing is recommended by default
    return AI_PARAM_CATALOG.filter((p) => p.defaultSelected).map((p) => p.key);
  }, []);

  const [selectedAiParamKeys, setSelectedAiParamKeys] = useState<Set<string>>(
    () => new Set(defaultSelectedKeys)
  );

  // ✅ LOAD per-campaign selection (and enforce max 4)
  useEffect(() => {
    if (!mounted) return;

    hydratedKeyRef.current = null;
    setAiParamLimitMsg(null);

    // show defaults immediately (nice UX), then load real values
    setSelectedAiParamKeys(new Set(defaultSelectedKeys));

    const v = safeReadJson(aiSelectedStorageKey);
    const s = normalizeToSet(v);

    if (s.size === 0) {
      hydratedKeyRef.current = aiSelectedStorageKey;
      return;
    }

    const arr = Array.from(s);
    const capped = new Set(arr.slice(0, MAX_BASIC_PARAMS));
    setSelectedAiParamKeys(capped);

    hydratedKeyRef.current = aiSelectedStorageKey;
  }, [mounted, aiSelectedStorageKey, defaultSelectedKeys]);

  // ✅ SAVE per-campaign selection (ONLY after load completed for this key)
  useEffect(() => {
    if (!mounted) return;
    if (hydratedKeyRef.current !== aiSelectedStorageKey) return;

    safeWriteJson(aiSelectedStorageKey, Array.from(selectedAiParamKeys));
  }, [mounted, aiSelectedStorageKey, selectedAiParamKeys]);

  const toggleAiParam = useCallback((key: string) => {
    setSelectedAiParamKeys((prev) => {
      const next = new Set(prev);

      // uncheck always allowed
      if (next.has(key)) {
        next.delete(key);
        return next;
      }

      // check — enforce Basic max 4
      if (next.size >= MAX_BASIC_PARAMS) {
        setAiParamLimitMsg(`Basic plan limit: max ${MAX_BASIC_PARAMS} parameters.`);
        return next;
      }

      next.add(key);
      setAiParamLimitMsg(null);
      return next;
    });
  }, []);

  const selectRecommended = useCallback(() => {
    const capped = new Set(defaultSelectedKeys.slice(0, MAX_BASIC_PARAMS));
    setSelectedAiParamKeys(capped);
    setAiParamLimitMsg(null);
  }, [defaultSelectedKeys]);

  const selectAllAiParams = useCallback(() => {
    // Basic can't truly "select all" — pick first 4 by catalog order
    const first = AI_PARAM_CATALOG.slice(0, MAX_BASIC_PARAMS).map((p) => p.key);
    setSelectedAiParamKeys(new Set(first));
    setAiParamLimitMsg(`Basic plan limit: max ${MAX_BASIC_PARAMS} parameters.`);
  }, []);

  const clearAllAiParams = useCallback(() => {
    setSelectedAiParamKeys(new Set());
    setAiParamLimitMsg(null);
  }, []);

  // ✅ Checks (same 16 demo cards as Agency/Pro)
  const paramCards = useMemo(() => {
    return [
      {
        key: "budget_pacing",
        title: "Budget pacing",
        status: "warning" as const,
        summary: "Budget pacing monitoring is enabled (demo).",
        aiSuggestion: "Review ad schedule and reduce delivery during high-cost hours.",
      },
      {
        key: "search_terms",
        title: "Search terms (irrelevant queries)",
        status: "warning" as const,
        summary: "Signals indicate wasted spend from irrelevant queries (demo).",
        aiSuggestion: "Add 5–10 negative keywords and tighten match types for top ad groups.",
      },
      {
        key: "ads_strength",
        title: "Ad strength (RSA assets)",
        status: "warning" as const,
        summary: "Not enough headline/description variety (demo).",
        aiSuggestion: "Add 3 new headlines (USPs) + 2 descriptions with clear CTAs.",
      },
      {
        key: "bids_cpc",
        title: "CPC / bid adjustments",
        status: "ok" as const,
        summary: "Average CPC is stable (demo).",
        aiSuggestion: "Keep as-is, but monitor Top IS % drops and competitive pressure.",
      },
      {
        key: "landing_page",
        title: "Landing page relevance",
        status: "warning" as const,
        summary: "Potential mismatch between intent and landing page (demo).",
        aiSuggestion: "Review H1 messaging, page speed, and align the page with the ad promise.",
      },
      {
        key: "audiences",
        title: "Audience signals / remarketing",
        status: "ok" as const,
        summary: "Audience signals are enabled (demo).",
        aiSuggestion: "Expand with 1–2 new segments (in-market / similar audiences).",
      },
      {
        key: "geo",
        title: "Geo (where spend is going)",
        status: "warning" as const,
        summary: "Some spend is going to lower-quality locations (demo).",
        aiSuggestion: "Exclude 1–2 locations or apply a -20% bid adjustment where ROI is weak.",
      },
      {
        key: "conversion_tracking",
        title: "Conversion tracking",
        status: "critical" as const,
        summary: "Conversion data may be incomplete (demo).",
        aiSuggestion: "Verify primary conversions, tag status, and attribution model settings.",
      },

      {
        key: "impression_share",
        title: "Impression share (lost to budget/rank)",
        status: "warning" as const,
        summary: "Impression Share indicates missed reach (demo).",
        aiSuggestion:
          "Check Lost IS (rank) vs (budget). If rank-driven: improve ads/QS; if budget-driven: raise budget or reallocate.",
      },
      {
        key: "quality_score",
        title: "Quality score signals",
        status: "warning" as const,
        summary: "Quality signals show room for improvement (demo).",
        aiSuggestion:
          "Improve ad relevance and landing page match for top spend keywords; add stronger RSAs aligned to intent.",
      },
      {
        key: "policy_issues",
        title: "Policy / disapprovals",
        status: "critical" as const,
        summary: "Potential disapprovals detected (demo).",
        aiSuggestion: "Review policy details, fix the flagged assets, and re-submit ads to restore delivery.",
      },
      {
        key: "rsa_asset_coverage",
        title: "RSA asset coverage & pinning risk",
        status: "warning" as const,
        summary: "RSA asset coverage looks thin (demo).",
        aiSuggestion:
          "Add more unique headlines/descriptions; avoid excessive pinning to improve learning and combinations.",
      },
      {
        key: "device_performance",
        title: "Device performance split",
        status: "warning" as const,
        summary: "Mobile performance differs from desktop (demo).",
        aiSuggestion:
          "If CPA is worse on a device: adjust bids (where applicable) or improve device-specific landing experience.",
      },
      {
        key: "geo_outliers",
        title: "Geo outliers (spend without results)",
        status: "warning" as const,
        summary: "Some locations spend without strong results (demo).",
        aiSuggestion: "Exclude low-performing locations or apply -10% to -30% adjustments where ROI is weak.",
      },
      {
        key: "ad_schedule_hours",
        title: "Ad schedule (hours/day) outliers",
        status: "warning" as const,
        summary: "High-cost hours detected (demo).",
        aiSuggestion: "Reduce exposure during expensive hours/days; shift budget to peak-converting windows.",
      },
      {
        key: "landing_page_speed",
        title: "Landing page speed / experience risk",
        status: "warning" as const,
        summary: "Landing page speed may hurt CVR (demo).",
        aiSuggestion:
          "Optimize LCP/CLS, compress images, reduce scripts; align above-the-fold CTA with ad intent.",
      },
    ];
  }, []);

  const store = getAgencyStore();
  const account = agencySelectors.accountById(store, accountId);
  const campaigns = agencySelectors.campaignsByAccountId(store, accountId) ?? [];
  const campaign = campaigns.find((c) => String((c as any)?.id) === String(campaignId)) as any;

  const campaignTitle = mounted ? (campaign?.name ?? "Campaign") : "Campaign";
  const accountTitle = mounted ? (account?.name ?? accountId) : accountId;

  // ✅ Support both field naming variants
  const spend = Number(campaign?.spentToday ?? campaign?.budgetSpentToday ?? 0);
  const budget = Number(campaign?.dailyBudget ?? campaign?.budgetToday ?? 0);

  const spentPct = useMemo(() => {
    if (!budget) return 0;
    const p = (spend / budget) * 100;
    return Math.max(0, Math.min(100, Math.round(p)));
  }, [spend, budget]);

  // health may be numeric or string-like; we keep existing logic
  const health: Health = mounted
    ? (typeof campaign?.health === "string"
        ? (campaign.health as Health)
        : healthFromScore(campaign?.health))
    : "warning";

  const paramCardsWithBudget = useMemo(() => {
    const pct = spentPct;
    return paramCards.map((p) => {
      if (p.key !== "budget_pacing") return p;

      return {
        ...p,
        status: (pct >= 80 ? "critical" : pct >= 50 ? "warning" : "ok") as
          | "ok"
          | "warning"
          | "critical",
        summary: `Spent ${pct}% of today’s budget.`,
        aiSuggestion:
          pct >= 80
            ? "Reduce bids or shift spend to later hours / tomorrow to avoid capping out too early."
            : pct >= 50
            ? "Review ad schedule and limit high-cost hours."
            : "Looks stable. Keep monitoring.",
      };
    });
  }, [paramCards, spentPct]);

  const aiCatalogFiltered = useMemo(() => {
    const q = aiParamQuery.trim().toLowerCase();
    if (!q) return AI_PARAM_CATALOG;
    return AI_PARAM_CATALOG.filter((p) => {
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.group.toLowerCase().includes(q)
      );
    });
  }, [aiParamQuery]);

  const aiCatalogByGroup = useMemo(() => {
    const m = new Map<AiParamGroup, AiParamDef[]>();
    for (const p of aiCatalogFiltered) {
      const arr = m.get(p.group) ?? [];
      arr.push(p);
      m.set(p.group, arr);
    }
    return Array.from(m.entries());
  }, [aiCatalogFiltered]);

  const checksToRender = useMemo(() => {
    const cards = mounted ? paramCardsWithBudget : paramCards;
    return cards.filter((c) => selectedAiParamKeys.has(c.key));
  }, [mounted, paramCardsWithBudget, paramCards, selectedAiParamKeys]);

  // ✅ Back: browser-friendly + fallback
  const fallbackHref = `/basic/administrator/accounts/${encodeURIComponent(accountId)}/campaigns`;
  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }, [router, fallbackHref]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-white/60">Campaign details</div>
          <div className="mt-2 text-2xl font-semibold text-white/90">{campaignTitle}</div>
          <div className="mt-2 text-sm text-white/70">
            Account: <span className="font-semibold text-white/90">{accountTitle}</span> · ID:{" "}
            <span className="font-mono text-white/80">{campaignId}</span>
          </div>
        </div>

        <button className={btn} type="button" onClick={handleBack}>
          Back
        </button>
      </div>

      {/* TOP CARD */}
      <div className={card + " mt-6"}>
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-white/70">
                Status: <span className="font-semibold text-white/90">Active</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                Health: <HealthBadge h={health} />
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-white/60">Today’s budget</div>
              <div className="text-xl font-semibold text-white/90">
                ${Number(spend).toFixed(2)} / ${Number(budget).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full ${budgetBarClass(spentPct)}`}
              style={{ width: `${spentPct}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-white/50">Spent: {spentPct}%</div>
        </div>
      </div>

      {/* AI CONTROL PARAMETERS */}
      <div className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <SectionHeader title="AI control parameters" />
          <button type="button" className={btn} onClick={() => setAiParamsOpen((v) => !v)}>
            {aiParamsOpen ? "Collapse" : "Expand"}
          </button>
        </div>

        <div className="mt-2 text-sm text-white/60">
          Basic plan limit:{" "}
          <span className="font-semibold text-white/85">select up to {MAX_BASIC_PARAMS}</span>.
          Default view shows only{" "}
          <span className="text-white/80 font-semibold">Daily budget</span> +{" "}
          <span className="text-white/80 font-semibold">keyword ad situation</span>.
        </div>

        {aiParamsOpen ? (
          <div className={card + " mt-4"}>
            <div className="p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="text-xs font-semibold text-white/60">Search parameters</div>
                  <input
                    value={aiParamQuery}
                    onChange={(e) => setAiParamQuery(e.target.value)}
                    placeholder="Search (e.g., bids, geo, tracking)"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 placeholder:text-white/30 outline-none focus:border-white/20"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" className={btn} onClick={selectRecommended}>
                    Select recommended
                  </button>
                  <button type="button" className={btn} onClick={selectAllAiParams}>
                    Select all
                  </button>
                  <button type="button" className={btn} onClick={clearAllAiParams}>
                    Clear all
                  </button>
                </div>
              </div>

              <div className="mt-4 text-sm text-white/60">
                Selected:{" "}
                <span className="font-semibold text-white/90">{selectedAiParamKeys.size}</span>
                {aiParamLimitMsg ? (
                  <span className="ml-3 text-amber-200/80">{aiParamLimitMsg}</span>
                ) : null}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {aiCatalogByGroup.map(([group, items]) => (
                  <div
                    key={group}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="text-sm font-semibold text-white/85">{group}</div>

                    <div className="mt-3 space-y-2">
                      {items.map((p) => {
                        const checked = selectedAiParamKeys.has(p.key);
                        const disabled =
                          !checked && selectedAiParamKeys.size >= MAX_BASIC_PARAMS;

                        return (
                          <label
                            key={p.key}
                            className={
                              "flex items-start gap-3 rounded-xl border bg-black/20 p-3 " +
                              (disabled
                                ? "cursor-not-allowed border-white/5 opacity-60"
                                : "cursor-pointer border-white/10 hover:border-white/15")
                            }
                            title={disabled ? `Basic limit: max ${MAX_BASIC_PARAMS}` : undefined}
                          >
                            <input
                              type="checkbox"
                              className="mt-1 h-4 w-4 accent-white"
                              checked={checked}
                              disabled={disabled}
                              onChange={() => toggleAiParam(p.key)}
                            />
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-white/90">
                                {p.title}
                              </span>
                              <span className="mt-1 block text-xs text-white/55">
                                {p.description}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {aiCatalogFiltered.length === 0 ? (
                <div className="mt-4 text-sm text-white/50">
                  No matches for “{aiParamQuery}”.
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {/* CHECKS */}
      <div className="mt-10">
        <SectionHeader title="Checks" />
        <div className="mt-2 text-sm text-white/60">
          AI can prepare recommendations after approval. (Basic: up to {MAX_BASIC_PARAMS} checks)
        </div>

        {checksToRender.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/60">
            No checks selected. Open{" "}
            <span className="font-semibold text-white/85">AI control parameters</span>{" "}
            and enable up to {MAX_BASIC_PARAMS}.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {checksToRender.map((p) => {
              // ✅ per-campaign + per-param persist key
              const persistKey = `basic:acc:${accountId}:cmp:${campaignId}:param:${p.key}`;

              return (
                <CampaignParamCard
                  key={persistKey}
                  persistKey={persistKey}
                  title={p.title}
                  status={p.status}
                  summary={p.summary}
                  aiSuggestion={p.aiSuggestion}
                  approved={!!approved[p.key]}
                  onApproveAi={() => setApproved((s) => ({ ...s, [p.key]: true }))}
                  googleAdsDisabled
                  googleAdsUrl={undefined}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* KEYWORDS */}
      <div className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <SectionHeader title="Keywords" />
          <button type="button" className={btn} onClick={() => setKeywordsOpen((v) => !v)}>
            {keywordsOpen ? "Collapse" : "Expand"}
          </button>
        </div>

        {keywordsOpen ? (
          <div className="mt-4">
            <KeywordsTable rows={(campaign?.keywords ?? []) as any} />
          </div>
        ) : (
          <div className="mt-3 text-sm text-white/50">Keywords table is collapsed.</div>
        )}
      </div>
    </div>
  );
}

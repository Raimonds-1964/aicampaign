"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import SectionHeader from "@/app/(pro)/pro/administrator/_ui/SectionHeader";
import KeywordsTable from "@/app/(pro)/pro/administrator/_ui/KeywordsTable";
import ReportModal from "@/app/(pro)/pro/administrator/_ui/ReportModal";

import CampaignParamCard from "@/app/(pro)/pro/shared/ui/CampaignParamCard";

import {
  useAgencyStore,
  getAgencyStore,
  agencySelectors,
  type KeywordRow,
} from "@/app/(pro)/pro/shared/_data/agencyStore";

type Health = "ok" | "warning" | "critical";
type Mode = "admin" | "manager";

type Props = {
  mode: Mode;
  accountId: string;
  campaignId: string;
};

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

export default function CampaignDetails(props: Props) {
  useAgencyStore();

  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [reportOpen, setReportOpen] = useState(false);
  const [keywordsOpen, setKeywordsOpen] = useState(true);

  const paramCards = useMemo(
    () => [
      {
        key: "budget_pacing",
        title: "Budget pacing",
        status: "warning" as const,
        summary: "The budget is spending too fast early in the day.",
        aiItems: [
          {
            id: "bp1",
            text: "Use ad scheduling to reduce spend during peak hours.",
          },
          {
            id: "bp2",
            text: "Lower bids in the morning (if using Manual CPC).",
          },
          {
            id: "bp3",
            text: "Reallocate budget toward campaigns/ad groups with higher conversion rates.",
          },
          {
            id: "bp4",
            text: "If demand supports it, increase daily budget gradually (+10–20%).",
          },
        ],
      },
      {
        key: "bidding_strategy",
        title: "Bidding strategy",
        status: "warning" as const,
        summary: "The bidding strategy may not align with your conversion goal (demo).",
        aiItems: [
          {
            id: "bs1",
            text: "Switch to Maximize Conversions (if you have enough conversion signals).",
          },
          {
            id: "bs2",
            text: "Set a conservative Target CPA and test for 7 days before evaluating.",
          },
          {
            id: "bs3",
            text: "Confirm Primary conversions are correctly selected for optimization.",
          },
        ],
      },
      {
        key: "search_terms",
        title: "Search terms",
        status: "critical" as const,
        summary: "High share of irrelevant queries (demo).",
        aiItems: [
          {
            id: "st1",
            text: "Add negative keywords (top 10 waste queries).",
          },
          {
            id: "st2",
            text: "Review Broad match usage in problem ad groups.",
          },
          {
            id: "st3",
            text: "Create separate ad groups for top-converting queries using Phrase/Exact.",
          },
        ],
      },
      {
        key: "match_types",
        title: "Keyword match types",
        status: "warning" as const,
        summary: "Broad match dominates without enough controls (demo).",
        aiItems: [
          {
            id: "mt1",
            text: "Move top queries to Phrase/Exact keywords.",
          },
          {
            id: "mt2",
            text: "Reduce Broad match where CPA is above target.",
          },
          {
            id: "mt3",
            text: "Expand negative keywords based on Search Terms data.",
          },
        ],
      },
      {
        key: "ads_quality",
        title: "Ad strength (RSAs)",
        status: "warning" as const,
        summary: "Not enough headline/description variety (demo).",
        aiItems: [
          {
            id: "aq1",
            text: "Add 6–8 new headlines with core USPs and target keywords.",
          },
          { id: "aq2", text: "Add 2–3 new descriptions with a clear CTA." },
          {
            id: "aq3",
            text: "Reduce pinned assets if they limit combinations.",
          },
        ],
      },
      {
        key: "landing_page",
        title: "Landing page relevance",
        status: "warning" as const,
        summary: "Conversion rate may be below industry benchmarks (demo).",
        aiItems: [
          {
            id: "lp1",
            text: "Improve CTA (one primary action, clear headline above the fold).",
          },
          {
            id: "lp2",
            text: "Reduce load time (images, scripts, lazy-load, caching).",
          },
          {
            id: "lp3",
            text: "Align landing page messaging with ad copy (message match).",
          },
        ],
      },
      {
        key: "conversion_tracking",
        title: "Conversion tracking",
        status: "critical" as const,
        summary: "Conversion setup/attribution may be incorrect (demo).",
        aiItems: [
          {
            id: "ct1",
            text: "Mark the right conversions as Primary and exclude secondary conversions from optimization.",
          },
          {
            id: "ct2",
            text: "Fix duplicates (double-counting via GTM + gtag).",
          },
          {
            id: "ct3",
            text: "Review attribution model and conversion window for business fit.",
          },
        ],
      },
      {
        key: "budget_distribution",
        title: "Budget allocation",
        status: "warning" as const,
        summary: "Budget may be going to low-performing segments (demo).",
        aiItems: [
          {
            id: "bd1",
            text: "Reduce spend on ad groups/queries with low conversion rates.",
          },
          {
            id: "bd2",
            text: "Increase budget for top segments (best CPA/ROAS).",
          },
          {
            id: "bd3",
            text: "Exclude/limit placements or audiences burning spend without results.",
          },
        ],
      },
    ],
    []
  );

  const store = getAgencyStore();
  const account = agencySelectors.accountById(store, props.accountId);
  const campaigns = agencySelectors.campaignsByAccountId(store, props.accountId);
  const campaign = campaigns.find(
    (c) => String(c.id) === String(props.campaignId)
  );

  const campaignTitle = mounted ? campaign?.name ?? "Campaign" : "Campaign";
  const accountTitle = mounted
    ? account?.name ?? props.accountId
    : props.accountId;

  const spend = Number(campaign?.budgetSpentToday ?? 0);
  const budget = Number(campaign?.budgetToday ?? 0);

  const spentPct = useMemo(() => {
    if (!budget) return 0;
    return Math.min(100, Math.round((spend / budget) * 100));
  }, [spend, budget]);

  const health = healthFromScore(campaign?.health);

  const keywordRows: KeywordRow[] = useMemo(
    () => [
      { keyword: "google ads agency", matchType: "PHRASE" },
      { keyword: "ppc management", matchType: "EXACT" },
      { keyword: "free audit", matchType: "BROAD" },
      { keyword: "ad agency", matchType: "BROAD", isNegative: true },
    ],
    []
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-white/60">Campaign details</div>
          <div className="mt-2 text-2xl font-semibold text-white/90">
            {campaignTitle}
          </div>
          <div className="mt-2 text-sm text-white/70">
            Account:{" "}
            <span className="font-semibold text-white/90">{accountTitle}</span>{" "}
            · ID: <span className="font-mono">{props.campaignId}</span>
          </div>
        </div>

        <button
          type="button"
          className={btn}
          onClick={() => {
            try {
              const ref = document.referrer;
              const path = ref ? new URL(ref).pathname : "";
              if (path.startsWith("/pro/")) {
                router.back();
                return;
              }
            } catch {
              // ignore
            }
            router.push(`/pro/administrator/accounts/${props.accountId}/campaaigns`);
          }}
        >
          Back
        </button>
      </div>

      {/* TOP CARD */}
      <div className={card + " mt-6"}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                Status: <b>{campaign?.status ?? "ACTIVE"}</b>
              </div>
              <HealthBadge h={health} />
            </div>

            <div className="text-right">
              <div className="text-sm text-white/60">Today&apos;s budget</div>
              <div className="text-xl font-semibold">
                ${spend.toFixed(2)} / ${budget.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div
              className={`h-full ${budgetBarClass(spentPct)}`}
              style={{ width: `${spentPct}%` }}
            />
          </div>

          <div className="mt-4">
            <button
              type="button"
              className="rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-black"
              onClick={() => setReportOpen(true)}
            >
              Generate report
            </button>
          </div>
        </div>
      </div>

      {/* CHECKS */}
      <div className="mt-10">
        <SectionHeader title="Checks" />

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {paramCards.map((p) => {
            const persistKey = `acc:${props.accountId}:cmp:${props.campaignId}:${p.key}`;

            return (
              <CampaignParamCard
                key={persistKey}
                persistKey={persistKey}
                title={p.title}
                status={p.status}
                summary={p.summary}
                aiSuggestion={(p.aiItems?.[0]?.text ?? p.summary) + " (demo)"}
                googleAdsDisabled
                aiChanges={(p.aiItems ?? []).map((x: any) => ({
                  id: String(x.id),
                  title: String(x.text),
                  details: "",
                  risk:
                    p.status === "critical"
                      ? "high"
                      : p.status === "warning"
                        ? "medium"
                        : "low",
                }))}
                onApproveAi={(changeIds: string[]) => {
                  console.log("AI APPROVE", { persistKey, changeIds });
                }}
              />
            );
          })}
        </div>
      </div>

      {/* KEYWORDS */}
      <div className="mt-10">
        <div className="flex justify-between">
          <SectionHeader title="Keywords" />
          <button
            type="button"
            className={btn}
            onClick={() => setKeywordsOpen((v) => !v)}
          >
            {keywordsOpen ? "Collapse" : "Expand"}
          </button>
        </div>

        {keywordsOpen && (
          <div className="mt-4">
            <KeywordsTable rows={keywordRows as any} />
          </div>
        )}
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        campaignName={campaignTitle}
      />
    </div>
  );
}

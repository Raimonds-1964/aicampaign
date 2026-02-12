"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import SectionHeader from "@/app/(basic)/basic/administrator/_ui/SectionHeader";
import KeywordsTable from "@/app/(basic)/basic/administrator/_ui/KeywordsTable";

import CampaignParamCard, {
  type Status as ParamStatus,
} from "@/app/(basic)/basic/shared/ui/CampaignParamCard";

import {
  useAgencyStore,
  getAgencyStore,
  agencySelectors,
  type KeywordRow,
} from "@/app/(basic)/basic/shared/_data/agencyStore";

type Health = "ok" | "warning" | "critical";
type Mode = "admin" | "manager";

type Props = {
  mode: Mode;
  accountId: string;
  campaignId: string;
};

type AiItem = { id: string; text: string };

type ParamCard = {
  key: string;
  title: string;
  status: ParamStatus;
  summary: string;
  aiItems: AiItem[];
};

const card =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm overflow-hidden";
const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10";

function HealthBadge({ h }: { h: Health }) {
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold";

  if (h === "ok")
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

  if (h === "warning")
    return (
      <span
        className={
          base + " border-amber-400/30 text-amber-200 bg-amber-500/10"
        }
      >
        Needs improvement
      </span>
    );

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

  const [keywordsOpen, setKeywordsOpen] = useState(true);

  // ✅ BASIC: only the most important checks (budget/performance)
  const paramCards: ParamCard[] = useMemo(
    () => [
      {
        key: "budget_pacing",
        title: "Budget pacing",
        status: "warning",
        summary: "Budget is spending too quickly early in the day.",
        aiItems: [
          {
            id: "bp1",
            text: "Use ad scheduling to reduce spend during peak hours.",
          },
          {
            id: "bp2",
            text: "Shift budget toward segments with higher conversion rates.",
          },
          {
            id: "bp3",
            text: "If demand is stable, increase daily budget gradually (+10–20%).",
          },
        ],
      },
      {
        key: "bidding_strategy",
        title: "Bidding strategy",
        status: "warning",
        summary: "Bidding strategy may not align with your conversion goal (demo).",
        aiItems: [
          {
            id: "bs1",
            text: "Switch to Maximize Conversions (if you have enough conversion signals).",
          },
          {
            id: "bs2",
            text: "Set a conservative Target CPA and test for 7 days.",
          },
          {
            id: "bs3",
            text: "Review which Primary conversions the campaign is optimizing for.",
          },
        ],
      },
      {
        key: "search_terms",
        title: "Search terms",
        status: "critical",
        summary: "High share of irrelevant queries (demo).",
        aiItems: [
          {
            id: "st1",
            text: "Add negative keywords (top 10 wasted queries).",
          },
          {
            id: "st2",
            text: "Reduce Broad match where CPA is above target.",
          },
          {
            id: "st3",
            text: "Create separate ad groups for top-converting queries (Phrase/Exact).",
          },
        ],
      },
      {
        key: "budget_distribution",
        title: "Budget allocation",
        status: "warning",
        summary: "Budget may be flowing into low-performing segments (demo).",
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
            text: "Pause or limit segments that burn spend without results.",
          },
        ],
      },
    ],
    []
  );

  const store = getAgencyStore();
  const account = agencySelectors.accountById(store, props.accountId);
  const campaigns = agencySelectors.campaignsByAccountId(store, props.accountId);
  const campaign = campaigns.find((c) => String(c.id) === String(props.campaignId));

  const campaignTitle = mounted ? campaign?.name ?? "Campaign" : "Campaign";
  const accountTitle = mounted ? account?.name ?? props.accountId : props.accountId;

  // Support both dailyBudget/spentToday and legacy fields (if still present)
  const spend = Number(
    (campaign as any)?.spentToday ?? (campaign as any)?.budgetSpentToday ?? 0
  );
  const budget = Number((campaign as any)?.dailyBudget ?? (campaign as any)?.budgetToday ?? 0);

  const spentPct = useMemo(() => {
    if (!budget) return 0;
    return Math.min(100, Math.round((spend / budget) * 100));
  }, [spend, budget]);

  const health = healthFromScore((campaign as any)?.health);

  const keywordRows: KeywordRow[] = useMemo(
    () => [
      { keyword: "google ads", matchType: "PHRASE" },
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
          <div className="mt-2 text-2xl font-semibold text-white/90">{campaignTitle}</div>
          <div className="mt-2 text-sm text-white/70">
            Account:{" "}
            <span className="font-semibold text-white/90">{accountTitle}</span> · ID:{" "}
            <span className="font-mono">{props.campaignId}</span>
          </div>
        </div>

        <button
          className={btn}
          onClick={() => {
            try {
              const ref = document.referrer;
              const path = ref ? new URL(ref).pathname : "";
              if (path.startsWith("/basic/")) {
                router.back();
                return;
              }
            } catch {}
            router.push(`/basic/administrator/accounts/${props.accountId}/campaigns`);
          }}
        >
          Back
        </button>
      </div>

      {/* TOP CARD (no reports button) */}
      <div className={card + " mt-6"}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                Status: <b>{(campaign as any)?.status ?? "ACTIVE"}</b>
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
        </div>
      </div>

      {/* CHECKS */}
      <div className="mt-10">
        <SectionHeader title="Checks" />
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {paramCards.map((p) => {
            const persistKey = `acc:${props.accountId}:cmp:${props.campaignId}:${p.key}`;

            const allIds = p.aiItems.map((x) => x.id);
            const aiChanges = p.aiItems.map((x) => ({ id: x.id, title: x.text }));
            const aiSuggestion =
              p.aiItems[0]?.text ?? "Open the AI suggestion and approve changes.";

            return (
              <CampaignParamCard
                key={persistKey}
                persistKey={persistKey}
                title={p.title}
                status={p.status}
                summary={p.summary}
                aiSuggestion={aiSuggestion}
                aiChanges={aiChanges}
                googleAdsDisabled
                onApproveAi={(selectedChangeIds: string[]) => {
                  const approved = selectedChangeIds;
                  const rejected = allIds.filter((id) => !selectedChangeIds.includes(id));

                  console.log("AI APPLY (BASIC)", {
                    persistKey,
                    approved,
                    rejected,
                  });
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
          <button className={btn} onClick={() => setKeywordsOpen((v) => !v)}>
            {keywordsOpen ? "Collapse" : "Expand"}
          </button>
        </div>

        {keywordsOpen && (
          <div className="mt-4">
            <KeywordsTable rows={keywordRows as any} />
          </div>
        )}
      </div>
    </div>
  );
}

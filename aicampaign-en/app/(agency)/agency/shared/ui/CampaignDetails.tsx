"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import SectionHeader from "@/app/(agency)/agency/administrator/_ui/SectionHeader";
import KeywordsTable from "@/app/(agency)/agency/administrator/_ui/KeywordsTable";
import ReportModal from "@/app/(agency)/agency/administrator/_ui/ReportModal";

// IMPORTANT: CampaignParamCard must support the `persistKey` prop
import CampaignParamCard from "@/app/(agency)/agency/shared/ui/CampaignParamCard";

import {
  useAgencyStore,
  getAgencyStore,
  agencySelectors,
} from "@/app/(agency)/agency/shared/_data/agencyStore";

type Health = "ok" | "warning" | "critical";
type Mode = "admin" | "manager";

/**
 * Expanded props to support:
 * - legacy mode (mode/accountId/campaignId)
 * - newer callers (titlePrefix/campaign/accountName/googleAdsHref/topRightLabel)
 * + NEW: onBack (so callers can use router.back())
 */
type Props = {
  // ===== legacy =====
  mode?: Mode;
  accountId?: string;
  campaignId?: string;
  backHref?: string;
  managerId?: string;

  // ===== new callers =====
  titlePrefix?: string;
  campaign?: any;
  accountName?: string;
  googleAdsHref?: string | null;
  topRightLabel?: ReactNode;

  // NEW: browser-style back behavior
  onBack?: () => void;
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
        Healthy
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
    <span className={base + " border-rose-400/30 text-rose-200 bg-rose-500/10"}>
      Critical
    </span>
  );
}

function budgetBarClass(pct: number) {
  if (pct >= 80) return "bg-red-400/70";
  if (pct >= 50) return "bg-amber-300/80";
  return "bg-emerald-300/80";
}

export default function CampaignDetails(props: Props) {
  // 1) Hooks are always called in the same order
  useAgencyStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [reportOpen, setReportOpen] = useState(false);
  const [keywordsOpen, setKeywordsOpen] = useState(true);
  const [approved, setApproved] = useState<Record<string, boolean>>({});

  // If caller provides campaign/accountName, use those (priority).
  // Otherwise fall back to store lookup by accountId/campaignId.
  const campaignId = (props.campaignId ?? props.campaign?.id ?? "").toString();
  const accountId = (props.accountId ?? props.campaign?.accountId ?? "").toString();

  // 2) paramCards are stable (not store-dependent)
  const paramCards = useMemo(() => {
    return [
      {
        key: "budget_pacing",
        title: "Budget pacing",
        status: "warning" as const,
        summary: "Budget pacing monitoring is enabled (demo).",
        aiSuggestion:
          "Review ad schedule and reduce delivery during high-cost hours.",
      },
      {
        key: "search_terms",
        title: "Search terms (irrelevant queries)",
        status: "warning" as const,
        summary: "Signals indicate wasted spend from irrelevant queries (demo).",
        aiSuggestion:
          "Add 5–10 negative keywords and tighten match types for top ad groups.",
      },
      {
        key: "ads_strength",
        title: "Ad strength (RSA assets)",
        status: "warning" as const,
        summary: "Not enough headline/description variety (demo).",
        aiSuggestion:
          "Add 3 new headlines (USPs) + 2 descriptions with clear CTAs.",
      },
      {
        key: "bids_cpc",
        title: "CPC / bid adjustments",
        status: "ok" as const,
        summary: "Average CPC is stable (demo).",
        aiSuggestion:
          "Keep as-is, but monitor Top IS % drops and competitive pressure.",
      },
      {
        key: "landing_page",
        title: "Landing page relevance",
        status: "warning" as const,
        summary: "Potential mismatch between intent and landing page (demo).",
        aiSuggestion:
          "Review H1 messaging, page speed, and align the page with the ad promise.",
      },
      {
        key: "audiences",
        title: "Audience signals / remarketing",
        status: "ok" as const,
        summary: "Audience signals are enabled (demo).",
        aiSuggestion:
          "Expand with 1–2 new segments (in-market / similar audiences).",
      },
      {
        key: "geo",
        title: "Geo (where spend is going)",
        status: "warning" as const,
        summary: "Some spend is going to lower-quality locations (demo).",
        aiSuggestion:
          "Exclude 1–2 locations or apply a -20% bid adjustment where ROI is weak.",
      },
      {
        key: "conversion_tracking",
        title: "Conversion tracking",
        status: "critical" as const,
        summary: "Conversion data may be incomplete (demo).",
        aiSuggestion:
          "Verify primary conversions, tag status, and attribution model settings.",
      },
    ];
  }, []);

  // 3) Read store consistently, then decide what to show after mount
  const store = getAgencyStore();

  const account =
    !props.accountName && accountId
      ? agencySelectors.accountById(store, accountId)
      : null;

  const campaigns = accountId
    ? agencySelectors.campaignsByAccountId(store, accountId) ?? []
    : [];

  const campaignFromStore = campaigns.find(
    (c) => String(c?.id) === String(campaignId)
  );

  const campaign = (props.campaign ?? campaignFromStore) as any;

  const campaignTitleReal = campaign?.name ?? "Campaign";
  const accountTitleReal =
    props.accountName ?? account?.name ?? (accountId ? accountId : "—");

  const healthReal: Health = (campaign?.health as Health) ?? "warning";
  const spendReal = Number(campaign?.spentToday ?? 0);
  const budgetReal = Number(campaign?.dailyBudget ?? 0);

  const spentPctReal = useMemo(() => {
    if (!budgetReal) return 0;
    const p = (spendReal / budgetReal) * 100;
    return Math.max(0, Math.min(100, Math.round(p)));
  }, [spendReal, budgetReal]);

  const paramCardsWithBudget = useMemo(() => {
    const pct = spentPctReal;

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
  }, [paramCards, spentPctReal]);

  // 4) UI values: before mount show stable placeholders to avoid hydration mismatch
  const campaignTitle = mounted ? campaignTitleReal : "Campaign";
  const accountTitle = mounted ? accountTitleReal : accountId || "—";
  const health = mounted ? healthReal : ("warning" as Health);
  const spend = mounted ? spendReal : 0;
  const budget = mounted ? budgetReal : 0;
  const spentPct = mounted ? spentPctReal : 0;

  const backHref = props.backHref;

  const headerPrefix =
    props.titlePrefix ??
    (props.mode === "admin"
      ? "Admin / Campaign details"
      : "Manager / Campaign details");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-white/60">{headerPrefix}</div>
          <div className="mt-2 text-2xl font-semibold text-white/90">
            {campaignTitle}
          </div>
          <div className="mt-2 text-sm text-white/70">
            Account:{" "}
            <span className="font-semibold text-white/90">{accountTitle}</span>{" "}
            · ID: <span className="font-mono text-white/80">{campaignId}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {props.topRightLabel ? (
            <div className="hidden sm:block">{props.topRightLabel}</div>
          ) : null}

          {/* onBack takes priority */}
          {props.onBack ? (
            <button className={btn} type="button" onClick={props.onBack}>
              Back
            </button>
          ) : backHref ? (
            <Link className={btn} href={backHref}>
              Back
            </Link>
          ) : (
            <button className={btn} type="button" onClick={() => history.back()}>
              Back
            </button>
          )}
        </div>
      </div>

      {/* ======= TOP CARD ======= */}
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
                ${spend.toFixed(2)} / ${budget.toFixed(2)}
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

          <div className="mt-5 flex items-center gap-3">
            <button
              className="rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
              onClick={() => setReportOpen(true)}
            >
              Generate report
            </button>

            {props.googleAdsHref ? (
              <a
                className={btn}
                href={props.googleAdsHref}
                target="_blank"
                rel="noreferrer noopener"
              >
                Open Google Ads ↗
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* ======= CHECKS / PARAMETERS ======= */}
      <div className="mt-10">
        <SectionHeader title="Checks" />
        <div className="mt-2 text-sm text-white/60">
          8 daily checks. AI can prepare and apply recommendations after approval.
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {(mounted ? paramCardsWithBudget : paramCards).map((p) => {
            const persistKey = `acc:${accountId}:cmp:${campaignId}:param:${p.key}`;
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
                googleAdsDisabled={true}
                googleAdsUrl={undefined}
              />
            );
          })}
        </div>
      </div>

      {/* ======= KEYWORDS ======= */}
      <div className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <SectionHeader title="Keywords" />
          <button
            type="button"
            className={btn}
            onClick={() => setKeywordsOpen((v) => !v)}
          >
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

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        campaignName={campaignTitle}
      />
    </div>
  );
}

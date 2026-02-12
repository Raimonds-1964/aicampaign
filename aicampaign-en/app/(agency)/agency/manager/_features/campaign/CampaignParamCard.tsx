"use client";

import React from "react";
import type { CheckStatus } from "../../_data/accounts";

const badge = (s: CheckStatus) =>
  s === "ok"
    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
    : s === "warning"
    ? "bg-yellow-500/15 text-yellow-300 border-yellow-500/30"
    : "bg-red-500/15 text-red-300 border-red-500/30";

const label = (s: CheckStatus) =>
  s === "ok" ? "OK" : s === "warning" ? "Needs improvement" : "Critical";

export default function CampaignParamCard(props: {
  title: string;
  status: CheckStatus;
  summary: string;
  aiSuggestion: string;
  onView?: () => void;
  viewLabel?: string;

  // auto-fix / task
  onAutoFix?: () => void; // if provided: runs the automatic fix
  onCreateTask?: () => void; // if auto-fix is not available: creates a manual task
  canAutoFix?: boolean;

  googleAdsUrl?: string;
}) {
  const {
    title,
    status,
    summary,
    aiSuggestion,
    onView,
    viewLabel = "View",
    onAutoFix,
    onCreateTask,
    canAutoFix,
    googleAdsUrl,
  } = props;

  const handleFix = () => {
    if (canAutoFix && onAutoFix) return onAutoFix();
    if (onCreateTask) return onCreateTask();
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-base font-semibold text-white/90">{title}</div>
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${badge(
                status
              )}`}
            >
              {label(status)}
            </span>
          </div>

          <div className="mt-2 text-sm text-white/70">{summary}</div>

          <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="text-xs font-semibold text-white/60">AI recommendation</div>
            <div className="mt-1 text-sm text-white/85">{aiSuggestion}</div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          {googleAdsUrl ? (
            <a
              href={googleAdsUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/85 hover:bg-white/10"
            >
              View in Google Ads ↗
            </a>
          ) : null}

          {onView ? (
            <button
              onClick={onView}
              className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15"
            >
              {viewLabel}
            </button>
          ) : null}

          {/* ✅ Always white */}
          <button
            onClick={handleFix}
            className="rounded-lg bg-white px-3 py-2 text-sm text-black hover:opacity-90"
            title={canAutoFix ? "Apply automatically" : "Create a manual task"}
          >
            Apply AI recommendation
          </button>
        </div>
      </div>
    </div>
  );
}

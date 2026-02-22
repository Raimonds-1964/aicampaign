// app/(agency)/agency/administrator/_ui/ReportModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

type Preset = "yesterday" | "last7" | "last30" | "custom";
type Format = "pdf" | "csv" | "xlsx";

function iso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

type FieldItem = {
  id: string; // stable id for future API mapping
  label: string;
  hint?: string;
};

type FieldGroup = {
  title: string;
  items: FieldItem[];
};

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

function normalizeSelected(v: unknown): Record<string, boolean> {
  if (!v || typeof v !== "object") return {};
  const obj = v as Record<string, unknown>;
  const out: Record<string, boolean> = {};
  for (const k of Object.keys(obj)) out[k] = obj[k] === true;
  return out;
}

export default function ReportModal({
  open,
  onClose,
  campaignName,
}: {
  open: boolean;
  onClose: () => void;
  campaignName: string;
}) {
  const today = useMemo(() => new Date(), []);
  const [preset, setPreset] = useState<Preset>("last7");

  const [from, setFrom] = useState<string>(iso(addDays(today, -7)));
  const [to, setTo] = useState<string>(iso(today));

  const [format, setFormat] = useState<Format>("pdf");

  // ✅ Expanded groups + stable field ids (future API-friendly)
  const groups: FieldGroup[] = useMemo(
    () => [
      {
        title: "Account",
        items: [
          { id: "account.name", label: "Account name" },
          { id: "account.id", label: "Account ID" },
          { id: "account.currency", label: "Currency" },
          { id: "account.timezone", label: "Timezone" },
        ],
      },
      {
        title: "Campaigns",
        items: [
          { id: "campaign.name", label: "Campaign name" },
          { id: "campaign.id", label: "Campaign ID" },
          { id: "campaign.status", label: "Status" },
          { id: "campaign.type", label: "Campaign type" },
          { id: "campaign.bidding_strategy", label: "Bidding strategy" },
          { id: "campaign.daily_budget", label: "Daily budget" },
          { id: "campaign.cost", label: "Cost (spend)" },
          { id: "campaign.impressions", label: "Impressions" },
          { id: "campaign.clicks", label: "Clicks" },
          { id: "campaign.ctr", label: "CTR" },
          { id: "campaign.avg_cpc", label: "Avg. CPC" },
          { id: "campaign.conversions", label: "Conversions" },
          { id: "campaign.conv_rate", label: "Conversion rate" },
          { id: "campaign.cpa", label: "Cost / conv (CPA)" },
          { id: "campaign.conv_value", label: "Conversion value" },
          { id: "campaign.roas", label: "ROAS" },

          { id: "campaign.search_impr_share", label: "Search impression share" },
          { id: "campaign.search_lost_is_budget", label: "Lost IS (budget)" },
          { id: "campaign.search_lost_is_rank", label: "Lost IS (rank)" },
          { id: "campaign.top_impr_share", label: "Top impression share" },
          { id: "campaign.abs_top_impr_share", label: "Absolute top impression share" },
        ],
      },
      {
        title: "Ad groups",
        items: [
          { id: "adgroup.name", label: "Ad group name" },
          { id: "adgroup.id", label: "Ad group ID" },
          { id: "adgroup.status", label: "Status" },
          { id: "adgroup.cost", label: "Cost (spend)" },
          { id: "adgroup.impressions", label: "Impressions" },
          { id: "adgroup.clicks", label: "Clicks" },
          { id: "adgroup.ctr", label: "CTR" },
          { id: "adgroup.avg_cpc", label: "Avg. CPC" },
          { id: "adgroup.conversions", label: "Conversions" },
          { id: "adgroup.cpa", label: "Cost / conv (CPA)" },
        ],
      },
      {
        title: "Keywords",
        items: [
          { id: "keyword.text", label: "Keyword" },
          { id: "keyword.match_type", label: "Match type" },
          { id: "keyword.status", label: "Status" },
          { id: "keyword.final_url", label: "Final URL" },

          { id: "keyword.impressions", label: "Impressions" },
          { id: "keyword.clicks", label: "Clicks" },
          { id: "keyword.ctr", label: "CTR" },
          { id: "keyword.avg_cpc", label: "Avg. CPC" },
          { id: "keyword.cost", label: "Cost (spend)" },
          { id: "keyword.conversions", label: "Conversions" },
          { id: "keyword.cpa", label: "Cost / conv (CPA)" },
          { id: "keyword.conv_rate", label: "Conversion rate" },
          { id: "keyword.conv_value", label: "Conversion value" },

          { id: "keyword.top_of_page_rate", label: "Top of page rate" },
          { id: "keyword.abs_top_of_page_rate", label: "Absolute top of page rate" },
          { id: "keyword.quality_score", label: "Quality score" },
          { id: "keyword.expected_ctr", label: "Expected CTR (QS component)" },
          { id: "keyword.ad_relevance", label: "Ad relevance (QS component)" },
          { id: "keyword.landing_page_exp", label: "Landing page exp. (QS component)" },

          { id: "keyword.search_impr_share", label: "Search impression share" },
          { id: "keyword.search_lost_is_rank", label: "Lost IS (rank)" },
          { id: "keyword.search_lost_is_budget", label: "Lost IS (budget)" },

          { id: "keyword.search_terms", label: "Search terms", hint: "If enabled/available via API" },
        ],
      },
      {
        title: "Ads",
        items: [
          { id: "ad.type", label: "Ad type" },
          { id: "ad.status", label: "Ad status" },
          { id: "ad.ad_strength", label: "Ad strength (RSA)" },
          { id: "ad.policy_status", label: "Policy status / disapprovals" },
          { id: "ad.assets", label: "Assets" },

          { id: "ad.impressions", label: "Impressions" },
          { id: "ad.clicks", label: "Clicks" },
          { id: "ad.ctr", label: "CTR" },
          { id: "ad.avg_cpc", label: "Avg. CPC" },
          { id: "ad.cost", label: "Cost (spend)" },
          { id: "ad.conversions", label: "Conversions" },
          { id: "ad.cpa", label: "Cost / conv (CPA)" },
          { id: "ad.conv_value", label: "Conversion value" },
        ],
      },
      {
        title: "Segments",
        items: [
          { id: "segment.device", label: "Device" },
          { id: "segment.network", label: "Network" },
          { id: "segment.location", label: "Location" },
          { id: "segment.day_of_week", label: "Day of week" },
          { id: "segment.hour", label: "Hour of day" },
        ],
      },
    ],
    []
  );

  // Build a flat set of valid ids (so we can ignore removed/unknown ids from storage)
  const validIds = useMemo(() => {
    const s = new Set<string>();
    for (const g of groups) for (const it of g.items) s.add(it.id);
    return s;
  }, [groups]);

  // ✅ Persist per campaignName (stable-enough for demo). Later replace with campaignId/accountId.
  const persistKey = useMemo(() => {
    const safe = (campaignName || "unknown")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_-]/g, "");
    return `agency_report_fields__cmp_${safe}`;
  }, [campaignName]);

  // ✅ Default: no checkboxes selected
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const g of groups) for (const it of g.items) init[it.id] = false;
    return init;
  });

  // ✅ Load saved selection when modal opens
  useEffect(() => {
    if (!open) return;

    const raw = safeReadJson(persistKey);
    const saved = normalizeSelected(raw);

    setSelected((prev) => {
      // Start from "all false"
      const next: Record<string, boolean> = {};
      for (const id of validIds) next[id] = false;

      // Apply saved only for existing ids
      for (const k of Object.keys(saved)) {
        if (validIds.has(k)) next[k] = saved[k] === true;
      }

      // Keep any ids that may be in prev but also valid (safety)
      for (const id of Object.keys(prev)) {
        if (validIds.has(id) && next[id] === undefined) next[id] = !!prev[id];
      }

      return next;
    });
  }, [open, persistKey, validIds]);

  // ✅ Save selection whenever it changes (while modal is open)
  useEffect(() => {
    if (!open) return;
    safeWriteJson(persistKey, selected);
  }, [open, persistKey, selected]);

  const selectedCount = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]).length,
    [selected]
  );

  function setAll(v: boolean) {
    setSelected(() => {
      const next: Record<string, boolean> = {};
      for (const id of validIds) next[id] = v;
      return next;
    });
  }

  function selectRecommended() {
    const recommended = new Set<string>([
      "campaign.name",
      "campaign.status",
      "campaign.daily_budget",
      "campaign.cost",
      "campaign.impressions",
      "campaign.clicks",
      "campaign.ctr",
      "campaign.avg_cpc",
      "campaign.conversions",
      "campaign.cpa",
      "campaign.conv_value",
      "campaign.roas",
      "campaign.search_impr_share",
      "campaign.search_lost_is_budget",
      "campaign.search_lost_is_rank",
    ]);

    setSelected(() => {
      const next: Record<string, boolean> = {};
      for (const id of validIds) next[id] = recommended.has(id);
      return next;
    });
  }

  function applyPreset(p: Preset) {
    setPreset(p);
    const t = new Date();

    if (p === "yesterday") {
      const y = addDays(t, -1);
      setFrom(iso(y));
      setTo(iso(y));
      return;
    }
    if (p === "last7") {
      setFrom(iso(addDays(t, -7)));
      setTo(iso(t));
      return;
    }
    if (p === "last30") {
      setFrom(iso(addDays(t, -30)));
      setTo(iso(t));
      return;
    }
    // custom: keep current dates
  }

  function onFromChange(v: string) {
    setFrom(v);
    if (v && to && v > to) setTo(v);
  }

  function onToChange(v: string) {
    setTo(v);
    if (from && v && v < from) setFrom(v);
  }

  function generate() {
    const ids = Object.keys(selected).filter((k) => selected[k]);

    alert(
      `Report generated (mock)\n\nCampaign: ${campaignName}\nDate range: ${from} → ${to}\nFormat: ${format.toUpperCase()}\nFields: ${ids.length}\n\nField IDs:\n- ${ids.join(
        "\n- "
      )}`
    );
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div
        className="absolute left-1/2 top-1/2 w-[min(920px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f16] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="text-base font-semibold text-white/90">
            Create report: {campaignName}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto p-4">
          {/* Date range */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white/90">Date range</div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => applyPreset("yesterday")}
                className={`rounded-lg px-3 py-2 text-sm ${
                  preset === "yesterday"
                    ? "bg-white/90 text-black"
                    : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                Yesterday
              </button>

              <button
                onClick={() => applyPreset("last7")}
                className={`rounded-lg px-3 py-2 text-sm ${
                  preset === "last7"
                    ? "bg-white/90 text-black"
                    : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                Last 7 days
              </button>

              <button
                onClick={() => applyPreset("last30")}
                className={`rounded-lg px-3 py-2 text-sm ${
                  preset === "last30"
                    ? "bg-white/90 text-black"
                    : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                Last 30 days
              </button>

              <button
                onClick={() => setPreset("custom")}
                className={`rounded-lg px-3 py-2 text-sm ${
                  preset === "custom"
                    ? "bg-white/90 text-black"
                    : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                Custom range
              </button>
            </div>

            {preset === "custom" && (
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="text-sm text-white/80">
                  From
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => onFromChange(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white/90"
                  />
                </label>

                <label className="text-sm text-white/80">
                  To
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => onToChange(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white/90"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Fields */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold text-white/90">
                  Fields (select what to include)
                </div>
                <div className="mt-1 text-sm text-white/60">
                  Selected:{" "}
                  <span className="font-semibold text-white/90">{selectedCount}</span>
                  <span className="ml-2 text-xs text-white/40">
                    (Saved automatically for this campaign)
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={selectRecommended}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  Select recommended
                </button>
                <button
                  type="button"
                  onClick={() => setAll(true)}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => setAll(false)}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  Clear all
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
              {groups.map((g) => (
                <div
                  key={g.title}
                  className="rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="text-sm font-semibold text-white/90">{g.title}</div>
                  <div className="mt-2 space-y-2">
                    {g.items.map((it) => {
                      const checked = !!selected[it.id];
                      return (
                        <label
                          key={it.id}
                          className="flex items-start gap-2 text-sm text-white/80"
                          title={it.id}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              setSelected((s) => ({ ...s, [it.id]: e.target.checked }))
                            }
                            className="mt-0.5 h-4 w-4"
                          />
                          <span className="min-w-0">
                            <span className="block">{it.label}</span>
                            {it.hint ? (
                              <span className="mt-0.5 block text-xs text-white/45">
                                {it.hint}
                              </span>
                            ) : null}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Format */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white/90">Format</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["pdf", "csv", "xlsx"] as Format[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`rounded-lg px-3 py-2 text-sm uppercase ${
                    format === f
                      ? "bg-white/90 text-black"
                      : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/10 px-4 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Cancel
          </button>

          <button
            onClick={generate}
            className="rounded-lg bg-white/90 px-3 py-2 text-sm text-black hover:opacity-90"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}

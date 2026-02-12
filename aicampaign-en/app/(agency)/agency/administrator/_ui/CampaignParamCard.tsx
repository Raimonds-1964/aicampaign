"use client";

import { useEffect, useMemo, useState } from "react";

export type Status = "ok" | "warning" | "critical";

function pill(status: Status) {
  if (status === "critical") return "bg-red-500/15 text-red-200 border-red-500/30";
  if (status === "warning") return "bg-yellow-500/15 text-yellow-200 border-yellow-500/30";
  return "bg-emerald-500/15 text-emerald-200 border-emerald-500/30";
}

function label(status: Status) {
  if (status === "critical") return "Critical";
  if (status === "warning") return "Needs attention";
  return "OK";
}

type AiChange = {
  id: string;
  title: string;
  details?: string; // short "from → to" or brief explanation
  risk?: "low" | "medium" | "high";
};

function riskBadge(risk?: AiChange["risk"]) {
  if (!risk) return null;

  const cls =
    risk === "high"
      ? "border-red-500/30 bg-red-500/15 text-red-200"
      : risk === "medium"
      ? "border-yellow-500/30 bg-yellow-500/15 text-yellow-200"
      : "border-emerald-500/30 bg-emerald-500/15 text-emerald-200";

  const text = risk === "high" ? "High risk" : risk === "medium" ? "Medium risk" : "Low risk";

  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${cls}`}>{text}</span>;
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
      aria-pressed={checked}
      title={label}
    >
      <span
        className={`h-4 w-7 rounded-full border border-white/15 transition ${
          checked ? "bg-white/80" : "bg-white/10"
        }`}
        style={{ position: "relative" }}
      >
        <span
          className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-black transition ${
            checked ? "left-[14px]" : "left-[2px]"
          }`}
        />
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

function makeStorageKey(title: string) {
  const safe = (title || "card")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
  return `agency_ai_enabled__${safe}`;
}

export default function CampaignParamCard(props: {
  title: string;
  status: Status;
  summary: string;
  aiSuggestion: string;

  /** Demo: after approval, can be marked as completed */
  approved?: boolean;

  /**
   * When the user approves changes (checked items),
   * returns the list of selected change IDs.
   */
  onApproveAi?: (selectedChangeIds: string[]) => void;

  /** (Optional) Provide an actual "change plan" from outside */
  aiChanges?: AiChange[];

  /** Links are not meaningful without the API — allow "disabled" mode */
  googleAdsUrl?: string;
  googleAdsDisabled?: boolean;

  /** Default AI toggle (if needed) */
  defaultAiEnabled?: boolean;
}) {
  const {
    title,
    status,
    summary,
    aiSuggestion,
    approved,
    onApproveAi,
    aiChanges,
    googleAdsUrl,
    googleAdsDisabled,
    defaultAiEnabled = true,
  } = props;

  const storageKey = useMemo(() => makeStorageKey(title), [title]);

  const [aiEnabled, setAiEnabled] = useState<boolean>(defaultAiEnabled);
  const [modalOpen, setModalOpen] = useState(false);

  // ✅ Persist across refresh (learn from localStorage)
  useEffect(() => {
    try {
      const v = localStorage.getItem(storageKey);
      if (v === "1") setAiEnabled(true);
      if (v === "0") setAiEnabled(false);
    } catch {
      // ignore
    }
  }, [storageKey]);

  function setAiEnabledPersist(v: boolean) {
    setAiEnabled(v);
    try {
      localStorage.setItem(storageKey, v ? "1" : "0");
    } catch {
      // ignore
    }
  }

  // Demo change plan if not provided externally
  const changes: AiChange[] = useMemo(() => {
    if (aiChanges && aiChanges.length) return aiChanges;
    return [
      {
        id: "chg-1",
        title: "Increase Max CPC for a keyword",
        details: '$0.45 → $0.60 (keyword: "PPC management")',
        risk: "medium",
      },
      {
        id: "chg-2",
        title: "Change keyword match type",
        details: 'Phrase → Exact (keyword: "google ads agency")',
        risk: "high",
      },
      {
        id: "chg-3",
        title: "Refresh an RSA headline asset",
        details: 'Headline #2 → "Free audit in 24 hours"',
        risk: "low",
      },
    ];
  }, [aiChanges]);

  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const c of changes) init[c.id] = true; // default: all checked
    return init;
  });

  // ✅ If changes update, keep selected in sync (no useMemo side-effects)
  useEffect(() => {
    setSelected((prev) => {
      const next = { ...prev };
      for (const c of changes) if (next[c.id] === undefined) next[c.id] = true;
      for (const k of Object.keys(next)) {
        if (!changes.some((c) => c.id === k)) delete next[k];
      }
      return next;
    });
  }, [changes]);

  const effectiveStatus: Status | "off" = aiEnabled ? status : "off";

  function openAiOffer() {
    if (!aiEnabled) return;
    setModalOpen(true);
  }

  function approveSelected() {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    onApproveAi?.(ids);
    setModalOpen(false);
  }

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-base font-semibold text-white/90">{title}</div>

              {effectiveStatus === "off" ? (
                <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs text-white/70">
                  AI is off
                </span>
              ) : (
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${pill(effectiveStatus)}`}>
                  {label(effectiveStatus)}
                </span>
              )}

              {approved ? (
                <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs text-white/70">
                  Changes approved
                </span>
              ) : null}

              <Toggle
                checked={aiEnabled}
                onChange={(v) => setAiEnabledPersist(v)}
                label={aiEnabled ? "AI: On" : "AI: Off"}
              />
            </div>

            {/* ✅ FIX: when AI is off, do not show summary */}
            {aiEnabled ? <div className="mt-1 text-sm text-white/70">{summary}</div> : null}

            {/* ✅ FIX: when AI is off, do not show the suggestion */}
            {aiEnabled ? (
              <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-xs font-semibold text-white/60">AI suggestion</div>
                <div className="mt-1 text-sm text-white/80">{aiSuggestion}</div>
              </div>
            ) : null}
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto">
            {/* Open Google Ads (demo) */}
            <a
              href={googleAdsUrl || "#"}
              target={googleAdsDisabled ? undefined : "_blank"}
              rel={googleAdsDisabled ? undefined : "noreferrer"}
              onClick={(e) => {
                if (googleAdsDisabled || !googleAdsUrl) e.preventDefault();
              }}
              className={`rounded-lg border border-white/15 px-3 py-2 text-sm text-center ${
                googleAdsDisabled || !googleAdsUrl
                  ? "bg-white/5 text-white/40 cursor-not-allowed"
                  : "bg-white/5 text-white/85 hover:bg-white/10"
              }`}
              title={googleAdsDisabled ? "Demo mode: link is disabled without the API" : "Open Google Ads"}
            >
              Open Google Ads ↗
            </a>

            {/* AI recommendations */}
            <button
              type="button"
              onClick={openAiOffer}
              className={`rounded-lg px-3 py-2 text-sm ${
                !aiEnabled ? "bg-white/10 text-white/50 cursor-not-allowed" : "bg-white text-black hover:opacity-90"
              }`}
              title={!aiEnabled ? "Turn on AI to view recommendations" : "View AI recommendations"}
            >
              AI recommendations
            </button>
          </div>
        </div>
      </div>

      {/* ===================== AI recommendations (modal) ===================== */}
      {modalOpen ? (
        <div className="fixed inset-0 z-[80]">
          <button
            className="absolute inset-0 bg-black/70"
            aria-label="Close"
            onClick={() => setModalOpen(false)}
          />

          <div
            className="absolute left-1/2 top-1/2 w-[min(920px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f16] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <div className="text-base font-semibold text-white/90">AI recommendations</div>
                <div className="text-sm text-white/60">{title}</div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto p-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-white/90">Suggested changes</div>
                <div className="mt-2 text-sm text-white/60">
                  Select what to apply. (In Live mode, this will show exact “from → to” values and objects from the API.)
                </div>

                <div className="mt-4 space-y-3">
                  {changes.map((c) => (
                    <label
                      key={c.id}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3 hover:bg-black/30"
                    >
                      <input
                        type="checkbox"
                        checked={!!selected[c.id]}
                        onChange={(e) => setSelected((s) => ({ ...s, [c.id]: e.target.checked }))}
                        className="mt-1 h-4 w-4"
                      />

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-semibold text-white/90">{c.title}</div>
                          {riskBadge(c.risk)}
                        </div>
                        {c.details ? <div className="mt-1 text-sm text-white/65">{c.details}</div> : null}
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-white/45">
                    Selected:{" "}
                    <span className="text-white/70 font-semibold">
                      {Object.keys(selected).filter((k) => selected[k]).length}
                    </span>{" "}
                    / {changes.length}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelected(() => {
                          const next: Record<string, boolean> = {};
                          for (const c of changes) next[c.id] = false;
                          return next;
                        })
                      }
                      className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                    >
                      Clear all
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSelected(() => {
                          const next: Record<string, boolean> = {};
                          for (const c of changes) next[c.id] = true;
                          return next;
                        })
                      }
                      className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                    >
                      Select all
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-white/10 px-4 py-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                Dismiss
              </button>

              <button
                type="button"
                onClick={approveSelected}
                className="rounded-lg bg-white px-3 py-2 text-sm text-black hover:opacity-90"
              >
                Approve selected
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type Status = "ok" | "warning" | "critical";

function pill(status: Status) {
  if (status === "critical") return "bg-red-500/15 text-red-200 border-red-500/30";
  if (status === "warning") return "bg-yellow-500/15 text-yellow-200 border-yellow-500/30";
  return "bg-emerald-500/15 text-emerald-200 border-emerald-500/30";
}

function statusLabel(status: Status) {
  if (status === "critical") return "Critical";
  if (status === "warning") return "Needs attention";
  return "OK";
}

type AiChange = {
  id: string;
  title: string;
  details?: string;
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

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${cls}`}>
      {text}
    </span>
  );
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
        className={`relative h-4 w-7 rounded-full border border-white/15 transition ${
          checked ? "bg-white/80" : "bg-white/10"
        }`}
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

function normalizePersistKey(persistKey: string) {
  const k = (persistKey || "").trim();
  if (k.startsWith("admin:")) return k.slice("admin:".length);
  if (k.startsWith("manager:")) return k.slice("manager:".length);
  return k;
}

function makeStorageKey(persistKey: string) {
  const normalized = normalizePersistKey(persistKey);
  const safe = (normalized || "unknown")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9:_-]/g, "");
  return `agency_ai_enabled__${safe}`;
}

function readEnabled(storageKey: string, fallback: boolean) {
  try {
    const v = localStorage.getItem(storageKey);
    if (v === "1") return true;
    if (v === "0") return false;
  } catch {
    // ignore
  }
  return fallback;
}

export default function CampaignParamCard(props: {
  title: string;
  status: Status;
  summary: string;
  aiSuggestion: string;

  /** unique per account+campaign+param */
  persistKey: string;

  approved?: boolean;
  onApproveAi?: (selectedChangeIds: string[]) => void;
  aiChanges?: AiChange[];

  googleAdsUrl?: string;
  googleAdsDisabled?: boolean;

  defaultAiEnabled?: boolean;
}) {
  const {
    title,
    status,
    summary,
    aiSuggestion,
    persistKey,
    approved,
    onApproveAi,
    aiChanges,
    googleAdsUrl,
    googleAdsDisabled,
    defaultAiEnabled = true,
  } = props;

  const storageKey = useMemo(() => makeStorageKey(persistKey), [persistKey]);

  const [aiEnabled, setAiEnabled] = useState<boolean>(defaultAiEnabled);
  const [modalOpen, setModalOpen] = useState(false);
  const bcRef = useRef<BroadcastChannel | null>(null);

  // init from localStorage
  useEffect(() => {
    setAiEnabled(readEnabled(storageKey, defaultAiEnabled));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // sync across tabs/windows
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== localStorage) return;
      if (e.key !== storageKey) return;
      setAiEnabled(readEnabled(storageKey, defaultAiEnabled));
    };
    window.addEventListener("storage", onStorage);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("agency_ai_toggle");
      bcRef.current = bc;
      bc.onmessage = (ev) => {
        const data = ev?.data as { storageKey?: string; value?: "1" | "0" } | undefined;
        if (!data?.storageKey || data.storageKey !== storageKey) return;
        if (data.value === "1") setAiEnabled(true);
        if (data.value === "0") setAiEnabled(false);
      };
    } catch {
      bcRef.current = null;
    }

    const onCustom = (e: Event) => {
      const ce = e as CustomEvent<{ storageKey: string; value: "1" | "0" }>;
      if (!ce.detail || ce.detail.storageKey !== storageKey) return;
      setAiEnabled(ce.detail.value === "1");
    };
    window.addEventListener("agency:ai-toggle", onCustom as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("agency:ai-toggle", onCustom as EventListener);
      try {
        bc?.close();
      } catch {
        // ignore
      }
      if (bcRef.current === bc) bcRef.current = null;
    };
  }, [storageKey, defaultAiEnabled]);

  function setAiEnabledPersist(v: boolean) {
    setAiEnabled(v);
    const value: "1" | "0" = v ? "1" : "0";

    try {
      localStorage.setItem(storageKey, value);
    } catch {}

    try {
      bcRef.current?.postMessage({ storageKey, value });
    } catch {}

    try {
      window.dispatchEvent(
        new CustomEvent("agency:ai-toggle", { detail: { storageKey, value } })
      );
    } catch {}
  }

  const changes: AiChange[] = useMemo(() => {
    if (aiChanges && aiChanges.length) return aiChanges;

    // Demo suggestions — US-style, Google Ads terminology
    return [
      {
        id: "chg-1",
        title: "Increase Max CPC for a keyword",
        details: '$0.45 → $0.60 (keyword: "ppc management")',
        risk: "medium",
      },
      {
        id: "chg-2",
        title: "Tighten match type",
        details: 'Phrase → Exact (keyword: "google ads agency")',
        risk: "high",
      },
      {
        id: "chg-3",
        title: "Refresh an RSA headline asset",
        details: 'Headline #2 → "Free account audit in 24 hours"',
        risk: "low",
      },
    ];
  }, [aiChanges]);

  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const c of changes) init[c.id] = true;
    return init;
  });

  useEffect(() => {
    setSelected((prev) => {
      const next = { ...prev };
      for (const c of changes) if (next[c.id] === undefined) next[c.id] = true;
      for (const k of Object.keys(next)) if (!changes.some((c) => c.id === k)) delete next[k];
      return next;
    });
  }, [changes]);

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

              {!aiEnabled ? (
                <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs text-white/70">
                  AI off
                </span>
              ) : (
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${pill(status)}`}>
                  {statusLabel(status)}
                </span>
              )}

              {approved ? (
                <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs text-white/70">
                  Changes approved
                </span>
              ) : null}

              <Toggle
                checked={aiEnabled}
                onChange={setAiEnabledPersist}
                label={aiEnabled ? "AI: On" : "AI: Off"}
              />
            </div>

            {/* Requirement: if AI is off -> show nothing (summary/aiSuggestion) */}
            {aiEnabled ? (
              <>
                <div className="mt-1 text-sm text-white/70">{summary}</div>

                <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="text-xs font-semibold text-white/60">AI recommendation</div>
                  <div className="mt-1 text-sm text-white/80">{aiSuggestion}</div>
                </div>
              </>
            ) : null}
          </div>

          {/* Requirement: if AI is off -> hide buttons/CTA */}
          {aiEnabled ? (
            <div className="flex w-full flex-col gap-2 sm:w-auto">
              <a
                href={googleAdsUrl || "#"}
                target={googleAdsDisabled ? undefined : "_blank"}
                rel={googleAdsDisabled ? undefined : "noreferrer"}
                onClick={(e) => {
                  if (googleAdsDisabled || !googleAdsUrl) e.preventDefault();
                }}
                className={`rounded-lg border border-white/15 px-3 py-2 text-center text-sm ${
                  googleAdsDisabled || !googleAdsUrl
                    ? "cursor-not-allowed bg-white/5 text-white/40"
                    : "bg-white/5 text-white/85 hover:bg-white/10"
                }`}
                title={googleAdsDisabled ? "Demo mode: link disabled until API is connected" : "Open in Google Ads"}
              >
                Open in Google Ads ↗
              </a>

              <button
                type="button"
                onClick={openAiOffer}
                className="rounded-lg bg-white/90 px-3 py-2 text-sm text-black hover:opacity-90"
                title="Review proposed changes"
              >
                Review AI changes
              </button>
            </div>
          ) : null}
        </div>
      </div>

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
                <div className="text-base font-semibold text-white">AI recommendations</div>
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
                <div className="text-sm font-semibold text-white/90">Proposed changes</div>
                <div className="mt-2 text-sm text-white/60">Select what to apply. (Demo)</div>

                <div className="mt-4 space-y-3">
                  {changes.map((c) => (
                    <label
                      key={c.id}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3 hover:bg-black/30"
                    >
                      <input
                        type="checkbox"
                        checked={!!selected[c.id]}
                        onChange={(e) =>
                          setSelected((s) => ({ ...s, [c.id]: e.target.checked }))
                        }
                        className="mt-1 h-4 w-4"
                      />

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-semibold text-white/90">{c.title}</div>
                          {riskBadge(c.risk)}
                        </div>
                        {c.details ? (
                          <div className="mt-1 text-sm text-white/65">{c.details}</div>
                        ) : null}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-white/10 px-4 py-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={approveSelected}
                className="rounded-lg bg-white px-3 py-2 text-sm text-black hover:opacity-90"
              >
                Approve changes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

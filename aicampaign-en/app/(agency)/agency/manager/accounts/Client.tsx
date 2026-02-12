"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useManagerStore, managerSelectors } from "../_data/store";
import type { Campaign } from "@/app/(agency)/agency/shared/_data/agencyStore";

const card =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm overflow-hidden";
const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10";
const input =
  "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function budgetPct(spent: number, budget: number) {
  if (!budget || budget <= 0) return 0;
  return clamp((spent / budget) * 100, 0, 999);
}
function pctPillClass(pct: number) {
  if (pct < 50) return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  if (pct < 80) return "border-yellow-400/30 bg-yellow-400/10 text-yellow-200";
  return "border-red-400/30 bg-red-400/10 text-red-200";
}
function healthDotClass(health: Campaign["health"]) {
  if (health === "ok") return "bg-emerald-400/80";
  if (health === "warning") return "bg-yellow-400/80";
  return "bg-red-400/80";
}

function googleAdsCampaignUrl(campaignId: string) {
  // Demo – replace with the real deep link once the API is connected.
  return `https://ads.google.com/aw/overview?campaign=${encodeURIComponent(campaignId)}`;
}

export default function Client() {
  const s = useManagerStore();
  const router = useRouter();
  const sp = useSearchParams();

  const managers = useMemo(() => managerSelectors.managers(s), [s]);

  const managerIdFromUrl = sp.get("managerId") ?? "";

  const candidates = useMemo(() => new Set<string>(managers.map((m: any) => m.id)), [managers]);

  // Pick initial managerId: URL -> localStorage -> first available
  const [activeManagerId, setActiveManagerId] = useState<string>(() => {
    if (managerIdFromUrl && candidates.has(managerIdFromUrl)) return managerIdFromUrl;

    if (typeof window !== "undefined") {
      const fromLs = window.localStorage.getItem("managerId") ?? "";
      if (fromLs && candidates.has(fromLs)) return fromLs;
    }

    return (managers as any[])[0]?.id ?? "";
  });

  // Keep in sync when URL/managers change
  useEffect(() => {
    if (!managers.length) return;

    // URL has priority if valid
    if (managerIdFromUrl && candidates.has(managerIdFromUrl)) {
      if (activeManagerId !== managerIdFromUrl) setActiveManagerId(managerIdFromUrl);
      return;
    }

    // If current selection is still valid, keep it
    if (activeManagerId && candidates.has(activeManagerId)) return;

    // Otherwise fall back to first manager
    setActiveManagerId((managers as any[])[0]?.id ?? "");
  }, [managers, managerIdFromUrl, candidates, activeManagerId]);

  // Persist selection (demo)
  useEffect(() => {
    if (!activeManagerId) return;
    try {
      window.localStorage.setItem("managerId", activeManagerId);
    } catch {}
  }, [activeManagerId]);

  // UI
  const [q, setQ] = useState("");

  const allCampaigns = useMemo(() => managerSelectors.campaigns(s) as Array<any>, [s]);

  const myCampaigns = useMemo(() => {
    if (!activeManagerId) return [];
    return allCampaigns.filter((c) => c.ownerId === activeManagerId);
  }, [allCampaigns, activeManagerId]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return myCampaigns;
    return myCampaigns.filter((c) => {
      const name = String(c.name ?? "").toLowerCase();
      const id = String(c.id ?? "").toLowerCase();
      return name.includes(query) || id.includes(query);
    });
  }, [myCampaigns, q]);

  function onChangeManager(nextId: string) {
    setActiveManagerId(nextId);
    // ✅ Keep managerId in the URL so TopBar navigation preserves context
    router.replace(`/agency/manager/campaigns?managerId=${encodeURIComponent(nextId)}`);
  }

  const activeManagerName = useMemo(() => {
    return (managers as any[]).find((m) => m.id === activeManagerId)?.name ?? "";
  }, [managers, activeManagerId]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-3xl font-semibold text-white">Campaigns</div>
          <div className="mt-1 text-sm text-white/60">
            Manager view (demo): you only see campaigns assigned to you.
          </div>
        </div>

        {/* Demo “View as manager” */}
        <div className="flex flex-col items-end gap-2">
          <div className="text-xs text-white/45">View as manager</div>

          <select
            value={activeManagerId}
            onChange={(e) => onChangeManager(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
          >
            {(managers as any[]).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.id})
              </option>
            ))}
          </select>

          {activeManagerId ? (
            <div className="text-xs text-white/45">
              Active: <span className="text-white/70">{activeManagerName}</span>
            </div>
          ) : (
            <div className="text-xs text-white/45">No managers available (demo data not loaded)</div>
          )}
        </div>
      </div>

      <div className={card + " mt-6"}>
        <div className="border-b border-white/10 p-4">
          <div className="text-sm font-semibold text-white/90">Campaign list</div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="w-full max-w-md">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search campaigns by name or ID…"
                className={input}
              />
            </div>

            <div className="text-sm text-white/50">
              Total: <span className="font-semibold text-white/80">{filtered.length}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full text-left text-sm">
            <thead className="text-white/60">
              <tr className="border-b border-white/10">
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Budget</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="text-white/85">
              {filtered.map((c: any) => {
                const pct = budgetPct(Number(c.spentToday), Number(c.dailyBudget));
                const accountId = String(c.accountId ?? "");

                const detailsHref =
                  `/agency/manager/accounts/${encodeURIComponent(accountId)}/campaigns/${encodeURIComponent(
                    c.id
                  )}` + `?managerId=${encodeURIComponent(activeManagerId)}`;

                return (
                  <tr key={c.id} className="border-b border-white/5 last:border-b-0">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-white/95">{c.name}</div>
                      <div className="mt-1 font-mono text-xs text-white/45">{c.id}</div>
                    </td>

                    {/* Status: dot only */}
                    <td className="px-4 py-4">
                      <span
                        className={
                          "inline-flex h-3 w-3 rounded-full shadow-sm ring-1 ring-white/10 " +
                          healthDotClass(c.health)
                        }
                        title={c.health}
                        aria-label={c.health}
                      />
                    </td>

                    {/* Budget: % pill only */}
                    <td className="px-4 py-4 text-right">
                      <span
                        className={
                          "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold " +
                          pctPillClass(pct)
                        }
                        title={`${Number(c.spentToday).toFixed(2)} / ${Number(c.dailyBudget).toFixed(
                          2
                        )} USD`}
                      >
                        {pct.toFixed(0)}%
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Link className={btn} href={detailsHref}>
                          Open details →
                        </Link>

                        <a
                          className={btn}
                          href={googleAdsCampaignUrl(String(c.id))}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open in Google Ads ↗
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-white/50" colSpan={4}>
                    No campaigns assigned to this manager. Assign campaigns in the Admin panel.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="border-t border-white/10 px-4 py-3 text-xs text-white/40">
          Tip: you can search by campaign name or ID.
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  useManagerStore,
  managerSelectors,
  type Campaign,
  type Manager,
} from "@/app/(agency)/agency/manager/_data/store";

const card =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm overflow-hidden";
const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35";
const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition";
const btnDisabled =
  "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/35 cursor-not-allowed opacity-70";
const pillBase =
  "inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold";

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

/** Status indicator (Admin-style): color dot only (no text) */
function healthDotClass(health: Campaign["health"]) {
  if (health === "ok") return "bg-emerald-400/20 border-emerald-400/35";
  if (health === "warning") return "bg-yellow-400/20 border-yellow-400/35";
  return "bg-red-400/20 border-red-400/35";
}

export default function CampaignsClient() {
  const s = useManagerStore();
  const sp = useSearchParams();
  const managerId = sp.get("managerId") ?? "m1"; // demo default

  const managers = useMemo(() => managerSelectors.managers(s) as Manager[], [s]);
  const manager = useMemo(
    () => managers.find((m) => m.id === managerId) ?? null,
    [managers, managerId]
  );

  const [q, setQ] = useState("");

  // All campaigns from shared store
  const all = useMemo(() => managerSelectors.campaigns(s), [s]);

  // Only campaigns assigned to the selected manager
  const mine = useMemo(() => {
    const query = q.trim().toLowerCase();
    return all
      .filter((c: any) => c.ownerId === managerId)
      .filter((c: any) => {
        if (!query) return true;
        return (
          String(c.name).toLowerCase().includes(query) ||
          String(c.id).toLowerCase().includes(query)
        );
      });
  }, [all, managerId, q]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm text-white/60">Campaigns</div>
          <div className="mt-1 text-2xl font-semibold text-white">Campaigns</div>
          <div className="mt-2 text-white/60">
            Manager view: you only see campaigns assigned to you.
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-sm text-white/60">View as</div>
          <select
            className="w-[260px] rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none"
            value={managerId}
            onChange={(e) => {
              const next = e.target.value;
              const url = `/agency/manager/campaigns?managerId=${encodeURIComponent(next)}`;
              window.location.assign(url);
            }}
          >
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.id})
              </option>
            ))}
          </select>

          {!manager ? (
            <div className="text-sm text-white/45">
              Manager not found (demo data not loaded)
            </div>
          ) : (
            <div className="text-sm text-white/45">
              Viewing: <span className="text-white/80">{manager.name}</span>
            </div>
          )}
        </div>
      </div>

      <div className={card}>
        <div className="border-b border-white/10 p-5">
          <div className="text-base font-semibold text-white">Campaign list</div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              className={input}
              placeholder="Search campaigns by name or ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <div className="md:col-span-2 text-sm text-white/50 md:justify-self-end md:self-center">
              Total: <span className="font-semibold text-white/80">{mine.length}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="text-white/60">
              <tr className="border-b border-white/10">
                <th className="px-5 py-3">Campaign</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Budget</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="text-white/85">
              {mine.map((c: any) => {
                const pct = budgetPct(Number(c.spentToday), Number(c.dailyBudget));
                const pctText = `${pct.toFixed(0)}%`;

                const accountId: string = c.accountId;
                const detailsHref = `/agency/manager/accounts/${encodeURIComponent(
                  accountId
                )}/campaigns/${encodeURIComponent(c.id)}?managerId=${encodeURIComponent(
                  managerId
                )}`;

                // Button is always rendered; disabled if link isn't available yet
                const googleAdsHref: string | null =
                  (c.googleAdsUrl as string | undefined) ?? null;

                return (
                  <tr key={c.id} className="border-b border-white/5 last:border-b-0">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="mt-1 font-mono text-xs text-white/45">{c.id}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={"inline-block h-6 w-6 rounded-full border " + healthDotClass(c.health)}
                        title={c.health}
                        aria-label={c.health}
                      />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span className={pillBase + " " + pctPillClass(pct)}>{pctText}</span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link className={btn} href={detailsHref}>
                          Open details →
                        </Link>

                        {googleAdsHref ? (
                          <a
                            className={btn}
                            href={googleAdsHref}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View in Google Ads ↗
                          </a>
                        ) : (
                          <button
                            type="button"
                            className={btnDisabled}
                            disabled
                            title="A Google Ads deep link will be available once the API is connected."
                          >
                            View in Google Ads ↗
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {mine.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-white/60" colSpan={4}>
                    No campaigns assigned to this manager.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 text-xs text-white/45">
          Only campaigns with <span className="font-mono">ownerId = {managerId}</span> are shown here.
          The Admin pool (admin) is not shown in this view.
        </div>
      </div>
    </div>
  );
}

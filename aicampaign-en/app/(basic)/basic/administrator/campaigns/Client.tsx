"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAgencyStore } from "@/app/(basic)/basic/shared/_data/agencyStore";

type AnyAccount = { id: string; name: string };
type AnyCampaign = {
  id: string;
  accountId: string;
  name: string;
  status?: string; // "active" | "paused" | "ACTIVE" etc.
  health?: number; // 0..100
  healthLabel?: "ok" | "warning" | "critical";
  healthStatus?: "ok" | "warning" | "critical";
  dailyBudget?: number;
  spentToday?: number;
  budgetPct?: number; // 0..999
  googleAdsUrl?: string;
};

const card =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm overflow-hidden";

const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition";

const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35";

const select =
  "w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function calcBudgetPct(spent: number, budget: number) {
  const s = Number(spent) || 0;
  const b = Number(budget) || 0;
  if (!b || b <= 0) return 0;
  return clamp((s / b) * 100, 0, 999);
}

function pctPillClass(pct: number) {
  if (pct < 50) return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  if (pct < 80) return "border-yellow-400/30 bg-yellow-400/10 text-yellow-200";
  return "border-red-400/30 bg-red-400/10 text-red-200";
}

function statusDotClass(health: "ok" | "warning" | "critical") {
  if (health === "ok") return "bg-emerald-400/20 border-emerald-400/40";
  if (health === "warning") return "bg-yellow-400/20 border-yellow-400/40";
  return "bg-red-400/20 border-red-400/40";
}

function inferHealthStatus(c: AnyCampaign): "ok" | "warning" | "critical" {
  if (c.healthStatus) return c.healthStatus;
  if (c.healthLabel) return c.healthLabel;

  const h = Number(c.health);
  if (Number.isFinite(h)) {
    if (h >= 70) return "ok";
    if (h >= 40) return "warning";
    return "critical";
  }
  return "warning";
}

function googleAdsAccountUrl(accountId: string) {
  return `https://ads.google.com/aw/overview?account=${encodeURIComponent(accountId)}`;
}

function googleAdsCampaignUrl(accountId: string, campaignId: string) {
  return `https://ads.google.com/aw/campaigns?account=${encodeURIComponent(
    accountId
  )}&campaignId=${encodeURIComponent(campaignId)}`;
}

export default function Client() {
  const accounts = useAgencyStore((s) => s.accounts) as unknown as AnyAccount[];
  const campaigns = useAgencyStore((s) => s.campaigns) as unknown as AnyCampaign[];
  const deleteCampaign = useAgencyStore((s) => s.deleteCampaign);

  const [q, setQ] = useState("");
  const [accountFilter, setAccountFilter] = useState<string>("all");

  const allCampaigns = useMemo(() => {
    // stable sort for nicer UI
    return [...campaigns].sort((a, b) => String(a?.name ?? "").localeCompare(String(b?.name ?? "")));
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    const query = q.trim().toLowerCase();

    return allCampaigns.filter((c) => {
      const matchesAccount = accountFilter === "all" ? true : String(c.accountId) === String(accountFilter);

      const matchesQuery =
        !query ||
        String(c.name ?? "").toLowerCase().includes(query) ||
        String(c.id ?? "").toLowerCase().includes(query);

      return matchesAccount && matchesQuery;
    });
  }, [allCampaigns, q, accountFilter]);

  function budgetCell(c: AnyCampaign) {
    const spent = Number(c.spentToday) || 0;
    const budget = Number(c.dailyBudget) || 0;
    const pct =
      typeof c.budgetPct === "number" && Number.isFinite(c.budgetPct)
        ? c.budgetPct
        : calcBudgetPct(spent, budget);

    return (
      <div className="flex items-center justify-end gap-2">
        <span
          className={
            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold " +
            pctPillClass(pct)
          }
          title={`Spent today: $${spent.toFixed(2)}${budget ? ` / $${budget.toFixed(2)}` : ""}`}
        >
          {pct.toFixed(0)}%
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-2xl font-semibold text-white/90">Campaigns</div>

          {/* Header controls (match Pro layout) */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="min-w-[260px]">
              <select
                className={select}
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
              >
                <option value="all">All accounts</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.id})
                  </option>
                ))}
              </select>
            </div>

            <a
              className={btn}
              href={accountFilter === "all" ? undefined : googleAdsAccountUrl(accountFilter)}
              target="_blank"
              rel="noreferrer"
              aria-disabled={accountFilter === "all"}
              onClick={(e) => {
                if (accountFilter === "all") e.preventDefault();
              }}
            >
              View in Google Ads ↗
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2" />
      </div>

      <div className={card}>
        <div className="border-b border-white/10 p-5">
          <div className="text-base font-semibold text-white/90">All campaigns</div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              className={input}
              placeholder="Search campaigns by name or ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <div className="text-sm text-white/50 md:justify-self-end md:self-center">
              Total: <span className="font-semibold text-white/80">{filteredCampaigns.length}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="text-white/60">
              <tr className="border-b border-white/10">
                <th className="px-5 py-3">Campaign</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Budget</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="text-white/85">
              {filteredCampaigns.map((c) => {
                const healthStatus = inferHealthStatus(c);

                return (
                  <tr key={c.id} className="border-b border-white/5 last:border-b-0">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white/90">{c.name}</div>
                      <div className="mt-1 font-mono text-xs text-white/45">{c.id}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          "inline-flex h-7 w-7 items-center justify-center rounded-full border " +
                          statusDotClass(healthStatus)
                        }
                        title={healthStatus}
                      />
                    </td>

                    <td className="px-5 py-4 text-right">{budgetCell(c)}</td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          className={btn}
                          href={`/basic/administrator/accounts/${encodeURIComponent(
                            c.accountId
                          )}/campaigns/${encodeURIComponent(c.id)}`}
                        >
                          Details →
                        </Link>

                        <a
                          className={btn}
                          href={googleAdsCampaignUrl(c.accountId, c.id)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View in Google Ads ↗
                        </a>

                        <button
                          type="button"
                          className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-500/20 transition"
                          onClick={() => {
                            if (confirm("Delete this campaign?")) {
                              deleteCampaign(String(c.id));
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-white/60" colSpan={4}>
                    No results found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 text-xs text-white/45" />
      </div>
    </div>
  );
}

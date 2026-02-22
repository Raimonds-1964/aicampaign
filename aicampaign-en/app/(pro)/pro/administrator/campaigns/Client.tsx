// app/(pro)/pro/administrator/campaigns/Client.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  useAdminStore,
  adminSelectors,
  adminActions,
  ADMIN_OWNER_ID,
  type Account,
  type Manager,
} from "@/app/(pro)/pro/administrator/_data/store";

const card =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm overflow-hidden";
const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition";
const btnPrimary =
  "rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition";
const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35";
const select =
  "w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none";

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

function statusDotClass(health: "ok" | "warning" | "critical") {
  if (health === "ok") return "bg-emerald-400/20 border-emerald-400/40";
  if (health === "warning") return "bg-yellow-400/20 border-yellow-400/40";
  return "bg-red-400/20 border-red-400/40";
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
  const s = useAdminStore();

  const managers = useMemo(() => adminSelectors.managers(s) as Manager[], [s]);
  const accounts = useMemo(() => adminSelectors.accounts(s) as Account[], [s]);

  const ownerNameById = useMemo(() => {
    const map = new Map<string, string>();
    map.set(ADMIN_OWNER_ID, "System Administrator");
    for (const m of managers) map.set(m.id, m.name);
    return map;
  }, [managers]);

  const [q, setQ] = useState("");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");

  // ✅ Load last selected account into the filter (if exists)
  useEffect(() => {
    try {
      const last = localStorage.getItem("pro_last_account_id");
      if (!last) return;

      // only set if it exists in current accounts list
      if (accounts.some((a) => String(a.id) === String(last))) {
        setAccountFilter(String(last));
      }
    } catch {
      // ignore
    }
    // only when accounts list is ready
  }, [accounts]);

  // ✅ Persist when user selects a specific account
  useEffect(() => {
    if (accountFilter === "all") return;
    try {
      localStorage.setItem("pro_last_account_id", String(accountFilter));
    } catch {
      // ignore
    }
  }, [accountFilter]);

  const allCampaigns = useMemo(() => adminSelectors.campaigns(s) as any[], [s]);

  const filteredCampaigns = useMemo(() => {
    const query = q.trim().toLowerCase();

    return allCampaigns.filter((c: any) => {
      const matchesQuery =
        !query ||
        String(c.name ?? "").toLowerCase().includes(query) ||
        String(c.id ?? "").toLowerCase().includes(query);

      const matchesOwner = ownerFilter === "all" ? true : c.ownerId === ownerFilter;
      const matchesAccount = accountFilter === "all" ? true : c.accountId === accountFilter;

      return matchesQuery && matchesOwner && matchesAccount;
    });
  }, [allCampaigns, q, ownerFilter, accountFilter]);

  function managerProfileHref(ownerId: string) {
    return `/pro/administrator/manager/${encodeURIComponent(ownerId)}`;
  }

  function budgetCell(c: any) {
    const pct = budgetPct(Number(c.spentToday), Number(c.dailyBudget));
    const pctText = `${pct.toFixed(0)}%`;

    return (
      <div className="flex items-center justify-end gap-2">
        <span
          className={
            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold " +
            pctPillClass(pct)
          }
        >
          {pctText}
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-2xl font-semibold text-white/90">Campaigns</div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="min-w-[260px]">
              <select
                className={select}
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
              >
                <option value="all">All accounts</option>
                {accounts.map((a: Account) => (
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

        <div className="flex flex-wrap items-center gap-2"></div>
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
              Total:{" "}
              <span className="font-semibold text-white/80">
                {filteredCampaigns.length}
              </span>
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
              {filteredCampaigns.map((c: any) => {
                const ownerName = ownerNameById.get(c.ownerId) ?? c.ownerId;

                // kept for future use (e.g., owner column)
                const managerCell = (
                  <Link
                    href={managerProfileHref(c.ownerId)}
                    className="font-semibold text-white/90 underline decoration-white/20 underline-offset-4 hover:decoration-white/50"
                  >
                    {ownerName}
                  </Link>
                );

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
                          statusDotClass(c.health)
                        }
                        title={c.health}
                      />
                    </td>

                    <td className="px-5 py-4 text-right">{budgetCell(c)}</td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          className={btn}
                          href={`/pro/administrator/accounts/${c.accountId}/campaigns/${c.id}`}
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
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-white/60" colSpan={5}>
                    No results found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 text-xs text-white/45"></div>
      </div>
    </div>
  );
}

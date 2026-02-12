"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { useAgencyStore, agencySelectors } from "@/app/(agency)/agency/shared/_data/agencyStore";

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

function healthDotClass(health: "ok" | "warning" | "critical") {
  if (health === "ok") return "bg-emerald-400/20 border-emerald-400/35";
  if (health === "warning") return "bg-yellow-400/20 border-yellow-400/35";
  return "bg-red-400/20 border-red-400/35";
}

export default function CampaignsClient() {
  const s = useAgencyStore();
  const params = useParams<{ accountId: string }>();
  const sp = useSearchParams();

  const accountId = params?.accountId ?? "";
  const managerId = sp.get("managerId") ?? ""; // manager context is carried via query

  const account = useMemo(() => {
    if (!accountId) return null;
    return agencySelectors.accountById(s, accountId);
  }, [s, accountId]);

  const campaigns = useMemo(() => {
    if (!accountId) return [];
    const list = agencySelectors.campaignsByAccountId(s, accountId) ?? [];
    // Manager view: if managerId exists, filter by ownerId
    if (managerId) return list.filter((c: any) => c.ownerId === managerId);
    return list;
  }, [s, accountId, managerId]);

  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return campaigns;
    return campaigns.filter((c: any) => {
      return (
        String(c.name).toLowerCase().includes(query) ||
        String(c.id).toLowerCase().includes(query)
      );
    });
  }, [campaigns, q]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-white/60">Campaigns</div>
          <div className="mt-1 text-4xl font-semibold text-white">Campaigns</div>
          <div className="mt-2 text-white/60">
            Account:{" "}
            <span className="font-semibold text-white/85">
              {account?.name ?? accountId}
            </span>
          </div>
        </div>

        <Link
          className={btn}
          href={
            managerId
              ? `/agency/manager/campaigns?managerId=${encodeURIComponent(managerId)}`
              : "/agency/manager/campaigns"
          }
        >
          Back
        </Link>
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
              Total: <span className="font-semibold text-white/80">{filtered.length}</span>
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
              {filtered.map((c: any) => {
                const pct = budgetPct(Number(c.spentToday), Number(c.dailyBudget));
                const googleAdsHref: string | null = c.googleAdsUrl ?? null;

                const detailsHref =
                  `/agency/manager/accounts/${encodeURIComponent(accountId)}/campaigns/${encodeURIComponent(
                    c.id
                  )}` + (managerId ? `?managerId=${encodeURIComponent(managerId)}` : "");

                return (
                  <tr key={c.id} className="border-b border-white/5 last:border-b-0">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="mt-1 font-mono text-xs text-white/45">{c.id}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          "inline-block h-6 w-6 rounded-full border " + healthDotClass(c.health)
                        }
                        title={c.health}
                        aria-label={c.health}
                      />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span className={pillBase + " " + pctPillClass(pct)}>
                        {pct.toFixed(0)}%
                      </span>
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

              {filtered.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-white/60" colSpan={4}>
                    No campaigns.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

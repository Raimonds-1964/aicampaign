"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  adminActions,
  adminSelectors,
  useAdminStore,
  ADMIN_OWNER_ID,
} from "../../_data/store";
import type { AdminManager } from "../../_data/types";

const card =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm overflow-hidden";

const th = "bg-white/5 text-left text-xs font-semibold text-white/60 px-5 py-3";

const td = "px-5 py-4 text-sm text-white/90";
const tdCenter = "px-5 py-4 text-sm text-white/90 text-center";

const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10";

const select =
  "rounded-xl border border-white/15 bg-black text-white px-3 py-2 text-sm outline-none";

/* ================= HELPERS ================= */

function budgetPercent(spent: number, limit: number) {
  if (!limit) return 0;
  return Math.round((spent / limit) * 100);
}

function budgetColor(p: number) {
  if (p >= 90) return "bg-red-500/20 text-red-300 border-red-400/30";
  if (p >= 70) return "bg-yellow-500/20 text-yellow-300 border-yellow-400/30";
  return "bg-emerald-500/20 text-emerald-300 border-emerald-400/30";
}

function statusColor(health: string) {
  if (health === "critical") return "bg-red-500/60";
  if (health === "warning") return "bg-yellow-400/70";
  return "bg-emerald-500/70";
}

/* =========================================== */

export default function AdminProfileClient() {
  const s = useAdminStore();

  const freeCampaigns = useMemo(() => adminSelectors.freeCampaigns(s) as any[], [s]);

  const managers: AdminManager[] = useMemo(() => adminSelectors.managers(s) as any, [s]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      {/* HEADER */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-white/60">Profile</div>
          <h1 className="text-2xl font-semibold text-white">Administrator</h1>
          <div className="mt-1 text-sm text-white/70">
            Unassigned campaigns:{" "}
            <span className="font-semibold">{freeCampaigns.length}</span>
          </div>
        </div>

        <Link href="/agency/administrator/managers" className={btn}>
          Back
        </Link>
      </div>

      {/* TABLE CARD */}
      <div className={card}>
        <div className="border-b border-white/10 px-5 py-4">
          <div className="text-sm font-semibold text-white/90">
            Unassigned campaigns (not assigned to a manager)
          </div>
          <div className="mt-1 text-xs text-white/50">
            For each campaign, select a manager from the dropdown — assignment happens immediately.
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full">
            <thead>
              <tr>
                <th className={th}>Campaign</th>
                <th className={th + " text-center"}>Status</th>
                <th className={th + " text-center"}>Budget</th>
                <th className={th}>Assign to manager</th>
                <th className={th + " text-right"}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {freeCampaigns.map((c: any) => {
                const percent = budgetPercent(c.spentToday, c.dailyBudget);

                return (
                  <tr key={c.id} className="border-t border-white/10">
                    {/* CAMPAIGN */}
                    <td className={td}>
                      <div className="font-medium text-white">{c.name}</div>
                      <div className="mt-1 font-mono text-xs text-white/45">{c.id}</div>
                    </td>

                    {/* STATUS */}
                    <td className={tdCenter}>
                      <div className={`mx-auto h-4 w-4 rounded-full ${statusColor(c.health)}`} />
                    </td>

                    {/* BUDGET */}
                    <td className={tdCenter}>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${budgetColor(percent)}`}
                      >
                        {percent}%
                      </span>
                    </td>

                    {/* ASSIGN */}
                    <td className={td}>
                      <select
                        className={select}
                        value={c.ownerId}
                        onChange={(e) => adminActions.assignCampaign(c.id, e.target.value)}
                      >
                        <option value={ADMIN_OWNER_ID}>Administrator</option>
                        {managers.map((m: any) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>

                      <div className="mt-2 text-xs text-white/45">Select a manager to assign.</div>
                    </td>

                    {/* ACTIONS */}
                    <td className={td + " text-right"}>
                      <div className="flex justify-end gap-2">
                        <Link
                          className={btn}
                          href={`/agency/administrator/accounts/${c.accountId}/campaigns/${c.id}`}
                        >
                          Details →
                        </Link>

                        <a
                          className={btn + " opacity-60"}
                          href="#"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View in Google Ads ↗
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {freeCampaigns.length === 0 && (
                <tr className="border-t border-white/10">
                  <td className="px-5 py-10 text-sm text-white/60" colSpan={5}>
                    No unassigned campaigns.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-white/10 px-5 py-3 text-xs text-white/50">
          When you assign a campaign to a manager, it disappears from the Admin pool and shows up in
          the manager’s profile.
        </div>
      </div>
    </div>
  );
}

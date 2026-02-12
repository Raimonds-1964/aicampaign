"use client";

import Link from "next/link";
import { useAdminStore, adminSelectors } from "../../../_data/store";

const card =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm overflow-hidden";
const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10";

type Health = "ok" | "warning" | "critical";

function healthLabel(h: Health) {
  if (h === "critical") return "Critical";
  if (h === "warning") return "Needs attention";
  return "OK";
}

function healthClass(h: Health) {
  if (h === "critical") return "border-red-400/30 text-red-200 bg-red-500/10";
  if (h === "warning") return "border-amber-400/30 text-amber-200 bg-amber-500/10";
  return "border-emerald-400/30 text-emerald-200 bg-emerald-500/10";
}

function budgetBarClass(pct: number) {
  // 0–50% green, 50–80% yellow, 80%+ red
  if (pct >= 80) return "bg-red-400/70";
  if (pct >= 50) return "bg-amber-300/80";
  return "bg-emerald-300/80";
}

function campaignGoogleAdsUrl(accountId: string, campaignId: string) {
  // Demo URL. Replace later with the real customerId/campaignId deep link.
  return `https://ads.google.com/aw/campaigns?account=${encodeURIComponent(
    accountId
  )}&campaignId=${encodeURIComponent(campaignId)}`;
}

export default function CampaignsClient({ accountId }: { accountId: string }) {
  const s = useAdminStore();

  const account = adminSelectors.accountById(s, accountId);
  const campaigns = adminSelectors.campaignsByAccountId(s, accountId);

  const title = account?.name ?? accountId;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-white/60">Campaigns</div>
          <div className="mt-2 text-4xl font-semibold text-white">{title}</div>
          <div className="mt-2 text-sm text-white/70">
            Campaign count:{" "}
            <span className="font-semibold text-white/90">{campaigns.length}</span>
          </div>
        </div>

        <Link className={btn} href={`/agency/administrator/accounts`}>
          Back
        </Link>
      </div>

      <div className={card + " mt-6"}>
        <div className="divide-y divide-white/10">
          {campaigns.map((c) => {
            const spend = Number((c as any).spentToday ?? 0);
            const budget = Number((c as any).dailyBudget ?? 0);
            const pct = budget > 0 ? Math.round((spend / budget) * 100) : 0;
            const clamped = Math.max(0, Math.min(100, pct));

            const health = ((c as any).health ?? "warning") as Health;

            return (
              <div key={(c as any).id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-2xl font-semibold text-white">{(c as any).name}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/65">
                      <span>Status: Enabled</span>
                      <span>·</span>
                      <span>ID: {(c as any).id}</span>

                      {/* ✅ Badge — never render a class string as text */}
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${healthClass(
                          health
                        )}`}
                      >
                        {healthLabel(health)}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70">
                    {clamped}%
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-sm text-white/75">
                    Today's budget:{" "}
                    <span className="font-semibold text-white/95">
                      ${spend.toFixed(2)} / ${budget.toFixed(2)}
                    </span>
                  </div>

                  {/* ✅ Budget utilization bar */}
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full ${budgetBarClass(clamped)}`}
                      style={{ width: `${clamped}%` }}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link
                      className={btn}
                      href={`/agency/administrator/accounts/${encodeURIComponent(
                        accountId
                      )}/campaigns/${encodeURIComponent((c as any).id)}`}
                    >
                      Open details →
                    </Link>

                    {/* ✅ Deep link to Google Ads */}
                    <a
                      className={btn}
                      href={campaignGoogleAdsUrl(accountId, (c as any).id)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in Google Ads ↗
                    </a>
                  </div>
                </div>
              </div>
            );
          })}

          {campaigns.length === 0 ? (
            <div className="p-10 text-center text-white/50">
              This account has no campaigns.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

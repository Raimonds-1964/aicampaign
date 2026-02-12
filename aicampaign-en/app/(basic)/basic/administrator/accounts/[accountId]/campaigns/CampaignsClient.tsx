"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAgencyStore } from "@/app/(basic)/basic/shared/_data/agencyStore";

const card =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm overflow-hidden";
const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10";

function formatUsd(n?: number) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return `$${n.toFixed(2)}`;
}

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function healthLabel(h: number) {
  if (h >= 70) return "OK";
  if (h >= 40) return "Warning";
  return "Critical";
}

function healthTone(h: number) {
  if (h >= 70) return "bg-emerald-500/15 text-emerald-200 border-emerald-500/25";
  if (h >= 40) return "bg-amber-500/15 text-amber-200 border-amber-500/25";
  return "bg-rose-500/15 text-rose-200 border-rose-500/25";
}

type AnyCampaign = {
  id: string;
  accountId: string;
  name: string;
  status?: string;
  health?: number;
  dailyBudget?: number;
  spentToday?: number;
  googleAdsUrl?: string;
};

export default function CampaignsClient({ accountId }: { accountId: string }) {
  const router = useRouter();

  const limits = useAgencyStore((s) => s.limits);
  const accounts = useAgencyStore((s) => s.accounts);
  const campaignsRaw = useAgencyStore((s) => s.campaigns) as unknown as AnyCampaign[];

  const account = accounts.find((a) => String(a.id) === String(accountId));

  const campaigns = useMemo(() => {
    const list = campaignsRaw
      .filter((c) => String(c.accountId) === String(accountId))
      .slice()
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    // ✅ Basic plan limit: max campaigns per account
    return list.slice(0, limits.maxCampaignsPerAccount);
  }, [campaignsRaw, accountId, limits.maxCampaignsPerAccount]);

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return campaigns;
    return campaigns.filter(
      (c) => (c.name || "").toLowerCase().includes(q) || String(c.id).toLowerCase().includes(q)
    );
  }, [campaigns, query]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-sm font-semibold text-white/60">Account</div>

          {/* ✅ Account name: slightly smaller and muted */}
          <div className="mt-2 text-2xl font-extrabold tracking-tight text-white/90">
            {account?.name ?? "Account"}
          </div>
          <div className="mt-1 text-xs font-semibold text-white/30">
            ID: <span className="font-mono">{accountId}</span>
          </div>

          <div className="mt-3 text-sm font-semibold text-white/50">
            Basic plan limit: up to {limits.maxCampaignsPerAccount} campaigns
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link className={btn} href="/basic/administrator/accounts">
            Accounts →
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-xl font-extrabold text-white">Campaigns</div>
          <div className="text-sm font-semibold text-white/60">Count: {filtered.length}</div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="h-11 w-full max-w-sm rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white/90 placeholder:text-white/35 outline-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-6">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm font-semibold text-white/60">
            No campaigns found.
          </div>
        ) : (
          filtered.map((c) => {
            const health =
              typeof c.health === "number" && Number.isFinite(c.health) ? c.health : 50;
            const spent =
              typeof c.spentToday === "number" && Number.isFinite(c.spentToday) ? c.spentToday : 0;
            const limit =
              typeof c.dailyBudget === "number" && Number.isFinite(c.dailyBudget)
                ? c.dailyBudget
                : 0;

            const pct = limit > 0 ? clamp01(spent / limit) : clamp01(health / 100);

            return (
              <div key={c.id} className={card}>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-3xl font-extrabold text-white/90">
                        {c.name}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm font-semibold text-white/60">
                        <span>
                          Status:{" "}
                          <span className="text-white/80">{c.status ?? "ACTIVE"}</span>
                        </span>
                        <span>·</span>
                        <span>
                          ID: <span className="font-mono text-white/80">{c.id}</span>
                        </span>

                        <span
                          className={`ml-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold ${healthTone(
                            health
                          )}`}
                        >
                          {healthLabel(health)}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/80">
                      {Math.round(health)}%
                    </div>
                  </div>

                  <div className="mt-5 rounded-3xl border border-white/10 bg-black/30 p-5">
                    <div className="text-sm font-semibold text-white/70">
                      Today&apos;s budget:{" "}
                      <span className="font-extrabold text-white/90">
                        {formatUsd(spent)}
                        {limit > 0 ? ` / ${formatUsd(limit)}` : ""}
                      </span>
                    </div>

                    <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-white/70"
                        style={{ width: `${Math.round(pct * 100)}%` }}
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-extrabold text-white/90 hover:bg-white/10"
                        onClick={() =>
                          router.push(
                            `/basic/administrator/accounts/${encodeURIComponent(
                              accountId
                            )}/campaigns/${encodeURIComponent(String(c.id))}`
                          )
                        }
                      >
                        Open details →
                      </button>

                      <a
                        href={c.googleAdsUrl || account?.googleAdsUrl || "https://ads.google.com/"}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-extrabold text-white/90 hover:bg-white/10"
                        title="Open Google Ads"
                      >
                        Open Google Ads ↗
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

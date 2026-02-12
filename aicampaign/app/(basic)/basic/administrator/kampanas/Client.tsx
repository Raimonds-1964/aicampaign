"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAgencyStore } from "@/app/(basic)/basic/shared/_data/agencyStore";

function euro(n?: number) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return `${n.toFixed(2)}$`;
}

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function badgeTone(health: number) {
  if (health >= 70) return "bg-emerald-500/15 text-emerald-200 border-emerald-500/25";
  if (health >= 40) return "bg-amber-500/15 text-amber-200 border-amber-500/25";
  return "bg-rose-500/15 text-rose-200 border-rose-500/25";
}

function badgeLabel(health: number) {
  if (health >= 70) return "OK";
  if (health >= 40) return "Brīdinājums";
  return "Kritisks";
}

type AnyAccount = { id: string; name: string };
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

export default function Client() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accountIdFilter = (searchParams.get("accountId") ?? "").trim();

  const accounts = useAgencyStore((s) => s.accounts) as unknown as AnyAccount[];
  const campaigns = useAgencyStore((s) => s.campaigns) as unknown as AnyCampaign[];
  const deleteCampaign = useAgencyStore((s) => s.deleteCampaign);

  const [query, setQuery] = useState("");

  const campaignsByAccount = useMemo(() => {
    const map = new Map<string, AnyCampaign[]>();
    for (const c of campaigns) {
      const arr = map.get(c.accountId) ?? [];
      arr.push(c);
      map.set(c.accountId, arr);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      map.set(k, arr);
    }
    return map;
  }, [campaigns]);

  const filteredAccounts = useMemo(() => {
    let list = accounts;

    if (accountIdFilter) list = list.filter((a) => a.id === accountIdFilter);

    const q = query.trim().toLowerCase();
    if (!q) return list;

    return list.filter((a) => {
      if (a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)) return true;
      const cs = campaignsByAccount.get(a.id) ?? [];
      return cs.some((c) => (c.name || "").toLowerCase().includes(q));
    });
  }, [accounts, campaignsByAccount, query, accountIdFilter]);

  function openDetails(accountId: string, campaignId: string) {
    router.push(`/basic/administrator/konti/${encodeURIComponent(accountId)}/kampanas/${encodeURIComponent(campaignId)}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white/90">Kampaņas</h1>
          {accountIdFilter && (
            <div className="mt-2 text-sm font-semibold text-white/60">
              Filtrs: konts <span className="font-mono text-white/80">{accountIdFilter}</span>{" "}
              <Link className="ml-2 underline decoration-white/30 underline-offset-4 hover:decoration-white/60" href="/basic/administrator/kampanas">
                Noņemt filtru
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/basic/administrator/konti" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/90 hover:bg-white/10">
            Konti →
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-x2 font-extrabold text-white/90">Kampaņu pārskats</div>
          <div className="text-sm font-semibold text-white/60">Konti: {filteredAccounts.length}</div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Meklēt kontu vai kampaņu..."
            className="h-11 w-full max-w-sm rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white placeholder:text-white/35 outline-none"
          />
        </div>
      </div>

      <div className="space-y-8">
        {filteredAccounts.map((acc) => {
          const cs = campaignsByAccount.get(acc.id) ?? [];

          return (
            <div key={acc.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white/50">{acc.name}</div>
                <div className="mt-1 text-xs font-semibold text-white/30">
                  ID: <span className="font-mono">{acc.id}</span>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                {cs.length === 0 ? (
                  <div className="text-sm font-semibold text-white/55">Šim kontam nav kampaņu.</div>
                ) : (
                  cs.map((c) => {
                    const status = c.status ?? "ACTIVE";
                    const health = typeof c.health === "number" && Number.isFinite(c.health) ? c.health : 50;

                    const spent =
                      typeof c.spentToday === "number" && Number.isFinite(c.spentToday) ? c.spentToday : 0;

                    const limit =
                      typeof c.dailyBudget === "number" && Number.isFinite(c.dailyBudget) ? c.dailyBudget : 0;

                    const pct = limit > 0 ? clamp01(spent / limit) : clamp01(health / 100);

                    return (
                      <div key={c.id} className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="truncate text-2xl font-extrabold text-white/90">{c.name}</div>

                            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm font-semibold text-white/60">
                              <span>
                                Statuss: <span className="text-white/80">{status}</span>
                              </span>
                              <span>·</span>
                              <span>
                                ID: <span className="font-mono text-white/80">{c.id}</span>
                              </span>

                              <span className={`ml-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold ${badgeTone(health)}`}>
                                {badgeLabel(health)}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/80">
                            {Math.round(health)}%
                          </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                          <div className="text-sm font-semibold text-white/70">
                            Budžets šodien:{" "}
                            <span className="font-extrabold text-white/90">
                              {euro(spent)}
                              {limit > 0 ? ` / ${euro(limit)}` : ""}
                            </span>
                          </div>

                          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/10">
                            <div className="h-full bg-white/70" style={{ width: `${Math.round(pct * 100)}%` }} />
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-extrabold text-white/90 hover:bg-white/10"
                              onClick={() => openDetails(acc.id, c.id)}
                            >
                              Atvērt detaļas →
                            </button>

                            <a
                              href={c.googleAdsUrl || "https://ads.google.com/"}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-extrabold text-white/90 hover:bg-white/10"
                            >
                              Atvērt Google Ads ↗
                            </a>

                            {/* ✅ DZĒST */}
                            <button
                              type="button"
                              className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-5 py-3 text-sm font-extrabold text-rose-200 hover:bg-rose-500/15"
                              onClick={() => {
                                if (confirm("Dzēst šo kampaņu?")) deleteCampaign(String(c.id));
                              }}
                            >
                              Dzēst
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}

        {filteredAccounts.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm font-semibold text-white/60">
            Nav rezultātu.
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminStore, adminSelectors } from "../_data/store";

type AnyAccount = { id: string; name: string };
type AnyCampaign = { id: string; accountId: string; name: string };

export default function Client() {
  const s = useAdminStore();
  const accounts = adminSelectors.accounts(s) as unknown as AnyAccount[];
  const campaigns = adminSelectors.campaigns(s) as unknown as AnyCampaign[];

  const [query, setQuery] = useState("");

  const campaignsCountByAccount = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of campaigns) map.set(c.accountId, (map.get(c.accountId) ?? 0) + 1);
    return map;
  }, [campaigns]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) => a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)
    );
  }, [accounts, query]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white/90">Konti</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* ❌ NOŅEMTS: Kampaņas → (globālā poga) */}

          <button
            type="button"
            className="rounded-2xl border border-white/10 bg-white/90 px-4 py-2 text-sm font-extrabold text-black shadow-sm"
            onClick={() => alert("Demo: Pievienot savu kontu")}
          >
            Pievienot savu kontu
          </button>

          <button
            type="button"
            className="rounded-2xl border border-white/10 bg-white/90 px-4 py-2 text-sm font-extrabold text-black shadow-sm"
            onClick={() => alert("Demo: Pievienot AI kontu")}
          >
            Pievienot AI kontu
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-xl font-extrabold text-white/90">Kontu saraksts</div>
          <div className="text-sm font-semibold text-white/60">Kopā: {filtered.length}</div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Meklēt kontu pēc nosaukuma vai ID..."
            className="h-11 w-full max-w-sm rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white/90 placeholder:text-white/35 outline-none"
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <div className="divide-y divide-white/10">
            {filtered.map((a) => {
              const count = campaignsCountByAccount.get(a.id) ?? 0;

              return (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-4 bg-black/20 p-5"
                >
                  <div className="min-w-0">
                    <div className="truncate text-lg font-extrabold text-white/90">{a.name}</div>
                    <div className="mt-1 text-sm font-semibold text-white/55">
                      <span className="font-mono">{a.id}</span> · Kampaņas:{" "}
                      <span className="text-white/80">{count}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/90 hover:bg-white/10"
                      onClick={() => alert("Demo: Skatīt Google Ads")}
                    >
                      Skatīt Google Ads ↗
                    </button>

                    {/* ❌ NOŅEMTS: Kampaņas → (katram kontam) */}
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="bg-black/20 p-6 text-sm font-semibold text-white/60">
                Nav rezultātu.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

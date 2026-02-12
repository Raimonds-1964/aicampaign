"use client";

import { useMemo, useState } from "react";
import { useAdminStore, adminSelectors } from "../_data/store";

type AnyAccount = { id: string; name: string };
type AnyCampaign = { id: string; accountId: string; name: string };

export default function Client() {
  const s = useAdminStore();
  const accounts = adminSelectors.accounts(s) as unknown as AnyAccount[];
  const campaigns = adminSelectors.campaigns(s) as unknown as AnyCampaign[];

  // 🔒 Demo / pricing mode: show only ONE account
  const visibleAccounts = accounts[0] ? [accounts[0]] : [];

  // After 1 account is added, keep buttons visible but disabled until upgrade
  const hasAccount = accounts.length > 0;
  const canAddAccount = !hasAccount; // billing unlock later

  const [query, setQuery] = useState("");

  const campaignsCountByAccount = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of campaigns) {
      map.set(c.accountId, (map.get(c.accountId) ?? 0) + 1);
    }
    return map;
  }, [campaigns]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visibleAccounts;
    return visibleAccounts.filter(
      (a) => a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)
    );
  }, [visibleAccounts, query]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white/90">
            Accounts
          </h1>

          {/* ✅ EN/US pricing note */}
          <div className="mt-3 max-w-xl text-sm font-semibold text-white/60">
            Your plan includes <b className="text-white/80">1 Google Ads account</b>. Additional accounts can be added for{" "}
            <b className="text-white/80">$99/month per account</b>.
          </div>
        </div>

        {/* RIGHT: action buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/90 shadow-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canAddAccount}
            onClick={() => alert("Demo: Add your account")}
            title={canAddAccount ? "Add your account" : "Upgrade required to add another account"}
          >
            Add your account
          </button>

          <button
            type="button"
            className="rounded-2xl border border-white/10 bg-white/90 px-4 py-2 text-sm font-extrabold text-black shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!canAddAccount}
            onClick={() => alert("Demo: Add an AI account")}
            title={canAddAccount ? "Add an AI account" : "Upgrade required to add another account"}
          >
            Add an AI account
          </button>

          <button
            type="button"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/90 shadow-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canAddAccount}
            onClick={() => alert("Demo: Buy account")}
            title={canAddAccount ? "Buy account" : "Upgrade required to buy an additional account"}
          >
            Buy account
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-xl font-extrabold text-white/90">
            Account list
          </div>
          <div className="text-sm font-semibold text-white/60">
            Total: {filtered.length}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search accounts by name or ID…"
            className="h-11 w-full max-w-sm rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white/90 placeholder:text-white/35 outline-none"
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <div className="divide-y divide-white/10">
            {filtered.map((a) => {
              const count = campaignsCountByAccount.get(a.id) ?? 0;

              // ✅ Remove "(Demo)" from the displayed account name
              const cleanName = String(a.name ?? "")
                .replace(/\(demo\)/gi, "")
                .replace(/\bdemo\b/gi, "")
                .replace(/\s{2,}/g, " ")
                .trim();

              return (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-4 bg-black/20 p-5"
                >
                  <div className="min-w-0">
                    <div className="truncate text-lg font-extrabold text-white/90">
                      {cleanName || "Acme Home Services"}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white/55">
                      <span className="font-mono">{a.id}</span> · Campaigns:{" "}
                      <span className="text-white/80">{count}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/90 hover:bg-white/10"
                      onClick={() => alert("Demo: View in Google Ads")}
                    >
                      View in Google Ads ↗
                    </button>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="bg-black/20 p-6 text-sm font-semibold text-white/60">
                No results found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

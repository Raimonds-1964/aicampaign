"use client";

import { useMemo, useState } from "react";
import {
  useAdminStore,
  adminSelectors,
  adminActions,
} from "@/app/(agency)/agency/administrator/_data/store";

const card =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm overflow-hidden";

const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed";

const btnPrimary =
  "rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition disabled:opacity-60 disabled:cursor-not-allowed";

const btnSecondary =
  "rounded-xl border border-white/25 bg-transparent px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/5 transition disabled:opacity-50 disabled:cursor-not-allowed";

const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35";

export default function Client() {
  const s = useAdminStore();
  const accounts = useMemo(() => adminSelectors.accounts(s), [s]);

  // 🔒 Demo / pricing mode: show only ONE account
  const visibleAccounts = accounts[0] ? [accounts[0]] : [];

  const hasAccount = accounts.length > 0;
  const canAddAccount = !hasAccount; // billing unlock later

  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return visibleAccounts;

    return visibleAccounts.filter((a: any) => {
      const name = String(a?.name ?? "").toLowerCase();
      const id = String(a?.id ?? "").toLowerCase();
      return name.includes(query) || id.includes(query);
    });
  }, [visibleAccounts, q]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* LEFT */}
        <div>
          <div className="text-2xl font-semibold text-white/90">Accounts</div>
          <div className="mt-2 text-white/60">
            Admin view: account management
          </div>

          <div className="mt-3 max-w-xl text-sm text-white/50">
            Your plan includes <b>1 Google Ads account</b>. Additional accounts
            can be added for <b>$99/month per account</b>.
          </div>
        </div>

        {/* RIGHT – ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            className={btn}
            type="button"
            disabled={!canAddAccount}
            onClick={() => adminActions.addOwnAccount()}
          >
            Add your account
          </button>

          <button
            className={btnPrimary}
            type="button"
            disabled={!canAddAccount}
            onClick={() => adminActions.addAiAccount()}
          >
            Add an AI account
          </button>

          <button
            className={btnSecondary}
            type="button"
            disabled={!canAddAccount}
            onClick={() => {
              // later → Stripe / upgrade flow
              alert("Upgrade required to buy an additional account.");
            }}
          >
            Buy account
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className={card}>
        <div className="border-b border-white/10 p-5">
          <div className="text-base font-semibold text-white/90">
            Account list
          </div>

          <div className="mt-3">
            <input
              className={input}
              placeholder="Search accounts by name or ID..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="text-white/60">
              <tr className="border-b border-white/10">
                <th className="px-5 py-3">Account</th>
                <th className="px-5 py-3">Campaigns</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="text-white/85">
              {filtered.map((a: any) => {
                const campaignCount = Array.isArray(a?.campaigns)
                  ? a.campaigns.length
                  : 0;

                return (
                  <tr
                    key={a.id}
                    className="border-b border-white/5 last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white/90">
                        {a?.name || "Acme Home Services"}
                      </div>
                      <div className="mt-1 font-mono text-xs text-white/45">
                        {a.id}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-white/85">
                        {campaignCount}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <a
                          className={btn}
                          href="https://ads.google.com/"
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

              {filtered.length === 0 && (
                <tr>
                  <td className="px-5 py-10 text-white/60" colSpan={3}>
                    No accounts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 text-xs text-white/45">
          Tip: you can search by account name or ID.
        </div>
      </div>
    </div>
  );
}

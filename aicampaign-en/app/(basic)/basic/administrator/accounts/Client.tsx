"use client";

import Link from "next/link";
import { useAgencyStore } from "@/app/(basic)/basic/shared/_data/agencyStore";

const btn =
  "rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/90 hover:bg-white/10";

export default function Client() {
  const accounts = useAgencyStore((s) => s.accounts);
  const addAiAccount = useAgencyStore((s) => s.addAiAccount);

  // Basic: always limited to 1 account
  const account = accounts[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white/90">
            Accounts
          </h1>
          <div className="mt-2 text-sm font-semibold text-white/60">
            The Basic plan supports only one connected account.
          </div>
        </div>

        {/* ✅ Single action: Add AI account */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={btn}
            onClick={() => addAiAccount()}
            title="Create an AI demo account"
          >
            Add AI Account
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
        <div className="grid grid-cols-12 gap-2 border-b border-white/10 px-5 py-3 text-xs font-semibold text-white/50">
          <div className="col-span-9">Account</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        {!account ? (
          <div className="px-5 py-10">
            <div className="text-lg font-extrabold text-white/90">
              No account connected
            </div>
            <div className="mt-2 text-sm font-semibold text-white/60">
              Click “Add AI Account” to create a demo account.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-2 px-5 py-5">
            <div className="col-span-9 min-w-0">
              <div className="truncate text-base font-extrabold text-white/90">
                {account.name}
              </div>
              <div className="mt-1 text-xs font-semibold text-white/40">
                ID: <span className="font-mono">{account.id}</span>
              </div>
            </div>

            {/* ✅ Two actions: Open Google Ads / Campaigns */}
            <div className="col-span-3 flex flex-wrap justify-end gap-2">
              <a
                href={account.googleAdsUrl || "https://ads.google.com/"}
                target="_blank"
                rel="noreferrer"
                className={btn}
                title="Open Google Ads"
              >
                Open Google Ads ↗
              </a>

              {/* ✅ FIX: Basic campaigns page is /basic/administrator/campaigns */}
              <Link
                href={`/basic/administrator/campaigns?accountId=${encodeURIComponent(
                  account.id
                )}`}
                className={btn}
              >
                Campaigns →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm font-semibold text-white/60">
        Basic plan limits: up to <b className="text-white/80">1 account</b> and{" "}
        <b className="text-white/80">5 campaigns</b>. Reports aren’t available.
      </div>
    </div>
  );
}

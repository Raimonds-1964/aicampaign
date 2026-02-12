"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ✅ Relative imports (no dependency on alias under /features)
import CampaignWizard from "../../../../features/ai-campaign-builder/ui/CampaignWizard";
import CampaignResults from "../../../../features/ai-campaign-builder/ui/CampaignResults";
import type { CampaignDraft } from "../../../../features/ai-campaign-builder/state/types";

// ✅ Agency store (NOT Pro)
import {
  useAgencyStore,
  getAgencyStore,
  agencySelectors,
  type Account,
} from "@/app/(agency)/agency/shared/_data/agencyStore";

const card =
  "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur";

const input =
  // Select on a white background with black text (as requested)
  "h-11 w-full rounded-2xl border border-black/20 bg-white px-4 text-sm font-semibold text-black outline-none focus:ring-2 focus:ring-black/20";

const btn =
  "rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white hover:bg-white/10";

export default function Client() {
  // Initialize demo store
  useAgencyStore();

  const router = useRouter();
  const sp = useSearchParams();

  // ✅ HYDRATION FIX: wait until the component is mounted
  // so the option list never differs between server and client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const selectedAccountId = (sp.get("accountId") ?? "").trim();

  const store = mounted ? getAgencyStore() : null;
  const accounts: Account[] = useMemo(() => {
    if (!mounted || !store) return [];
    return agencySelectors.accounts(store);
  }, [mounted, store]);

  const selectedAccount: Account | null = useMemo(() => {
    if (!mounted) return null;
    if (!selectedAccountId) return null;
    return accounts.find((a) => String(a.id) === String(selectedAccountId)) ?? null;
  }, [mounted, accounts, selectedAccountId]);

  const [draft, setDraft] = useState<CampaignDraft | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  function setAccount(id: string) {
    if (!id) {
      router.push("/agency/administrator/ai-campaign");
      return;
    }
    router.push(
      `/agency/administrator/ai-campaign?accountId=${encodeURIComponent(id)}`
    );
  }

  function handleComplete(d: CampaignDraft) {
    setDraft(d);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function handleResetAll() {
    setDraft(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-white/60">Agency / Create AI Campaign</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
          Create AI Campaign
        </h1>
        <div className="mt-2 text-sm font-semibold text-white/60">
          Select an account and generate a Search campaign with AI. (Agency: no
          limits)
        </div>
      </div>

      {/* 1) Account selection */}
      <div className={card}>
        <div className="text-sm font-extrabold text-white">Account</div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <select
            className={input}
            value={mounted ? selectedAccountId : ""}
            onChange={(e) => setAccount(e.target.value)}
            disabled={!mounted}
          >
            {/* ✅ Always identical server/client: only this option during SSR */}
            <option value="" className="bg-white text-black">
              — Select an account —
            </option>

            {/* ✅ Render the option list only after mount */}
            {mounted
              ? accounts.map((a) => (
                  <option key={a.id} value={a.id} className="bg-white text-black">
                    {a.name} ({a.id})
                  </option>
                ))
              : null}
          </select>

          <button
            type="button"
            className={btn}
            onClick={() => setAccount("")}
            disabled={!mounted}
            title={!mounted ? "Loading..." : "Clear selection"}
          >
            Clear selection
          </button>
        </div>
      </div>

      {/* 2) Builder */}
      {mounted && selectedAccount ? (
        <div className={card}>
          <div className="mb-4 text-sm font-semibold text-white/60">
            Selected account:{" "}
            <span className="font-extrabold text-white/85">{selectedAccount.name}</span>{" "}
            <span className="text-white/35">·</span>{" "}
            <span className="font-mono text-white/70">{selectedAccount.id}</span>
          </div>

          {/* ✅ Agency = no limits */}
          <CampaignWizard
            plan="pro"
            onComplete={handleComplete}
            onResetAll={handleResetAll}
          />

          <div ref={resultsRef} className="mt-8">
            {draft ? <CampaignResults draft={draft} /> : null}
          </div>
        </div>
      ) : (
        <div className="text-sm font-semibold text-white/50">
          {mounted ? "Select an account to open the campaign builder." : "Loading..."}
        </div>
      )}
    </div>
  );
}

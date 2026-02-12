"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ✅ Relatīvie importi (lai nav atkarības no tsconfig alias uz /features)
import CampaignWizard from "../../../../features/ai-campaign-builder/ui/CampaignWizard";
import CampaignResults from "../../../../features/ai-campaign-builder/ui/CampaignResults";
import type { CampaignDraft } from "../../../../features/ai-campaign-builder/state/types";

import {
  useAgencyStore,
  getAgencyStore,
  agencySelectors,
  type Account,
} from "@/app/(pro)/pro/shared/_data/agencyStore";

const card =
  "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur";
const input =
  "h-11 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white/90 outline-none";
const btn =
  "rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/90 hover:bg-white/10";

export default function Client() {
  // init demo store
  useAgencyStore();

  const router = useRouter();
  const sp = useSearchParams();
  const selectedAccountId = (sp.get("accountId") ?? "").trim();

  const store = getAgencyStore();
  const accounts = agencySelectors.accounts(store);

  const selectedAccount: Account | null = useMemo(() => {
    if (!selectedAccountId) return null;
    return accounts.find((a) => String(a.id) === String(selectedAccountId)) ?? null;
  }, [accounts, selectedAccountId]);

  const [draft, setDraft] = useState<CampaignDraft | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  function setAccount(id: string) {
    if (!id) {
      router.push("/pro/administrator/ai-kampana");
      return;
    }
    router.push(`/pro/administrator/ai-kampana?accountId=${encodeURIComponent(id)}`);
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
        <div className="text-sm text-white/60">Pro / Izveidot AI kampaņu</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white/90">
          Izveidot AI kampaņu
        </h1>
        <div className="mt-2 text-sm font-semibold text-white/60">
          Izvēlies kontu un ģenerē Search kampaņu ar AI. (Pro: bez ierobežojumiem)
        </div>
      </div>

      {/* 1) Konta izvēle */}
      <div className={card}>
        <div className="text-sm font-extrabold text-white/90">Konts</div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <select
            className={input}
            value={selectedAccountId}
            onChange={(e) => setAccount(e.target.value)}
          >
            <option value="" className="bg-white/90 text-black">
              — Izvēlies kontu —
            </option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id} className="bg-white/90 text-black">
                {a.name} ({a.id})
              </option>
            ))}
          </select>

          <button type="button" className={btn} onClick={() => setAccount("")}>
            Notīrīt izvēli
          </button>
        </div>
      </div>

      {/* 2) Builder */}
      {selectedAccount ? (
        <div className={card}>
          <div className="mb-4 text-sm font-semibold text-white/60">
            Izvēlētais konts:{" "}
            <span className="font-extrabold text-white/85">{selectedAccount.name}</span>{" "}
            <span className="text-white/35">·</span>{" "}
            <span className="font-mono text-white/70">{selectedAccount.id}</span>
          </div>

          {/* ✅ Pro = bez ierobežojumiem */}
          <CampaignWizard plan="pro" onComplete={handleComplete} onResetAll={handleResetAll} />

          <div ref={resultsRef} className="mt-8">
            {draft ? <CampaignResults draft={draft} /> : null}
          </div>
        </div>
      ) : (
        <div className="text-sm font-semibold text-white/50">
          Izvēlies kontu, lai atvērtu kampaņu veidotāju.
        </div>
      )}
    </div>
  );
}

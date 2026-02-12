"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ✅ Relatīvie importi (lai nav atkarības no alias uz /features)
import CampaignWizard from "../../../../features/ai-campaign-builder/ui/CampaignWizard";
import CampaignResults from "../../../../features/ai-campaign-builder/ui/CampaignResults";
import type { CampaignDraft } from "../../../../features/ai-campaign-builder/state/types";

// ✅ Agency store (NEVIS pro)
import {
  useAgencyStore,
  getAgencyStore,
  agencySelectors,
  type Account,
} from "@/app/(agency)/agency/shared/_data/agencyStore";

const card =
  "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur";

const input =
  // select uz balta fona ar melniem tekstiem (kā prasīji)
  "h-11 w-full rounded-2xl border border-black/20 bg-white px-4 text-sm font-semibold text-black outline-none focus:ring-2 focus:ring-black/20";

const btn =
  "rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white hover:bg-white/10";

export default function Client() {
  // init demo store
  useAgencyStore();

  const router = useRouter();
  const sp = useSearchParams();

  // ✅ HYDRATION FIX: gaidām līdz komponents ir mount-ots,
  // lai option saraksts serverī un klientā nekad neatšķirtos.
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
    return (
      accounts.find((a) => String(a.id) === String(selectedAccountId)) ?? null
    );
  }, [mounted, accounts, selectedAccountId]);

  const [draft, setDraft] = useState<CampaignDraft | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  function setAccount(id: string) {
    if (!id) {
      router.push("/agency/administrator/ai-kampana");
      return;
    }
    router.push(
      `/agency/administrator/ai-kampana?accountId=${encodeURIComponent(id)}`
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
        <div className="text-sm text-white/60">Agency / Izveidot AI kampaņu</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
          Izveidot AI kampaņu
        </h1>
        <div className="mt-2 text-sm font-semibold text-white/60">
          Izvēlies kontu un ģenerē Search kampaņu ar AI. (Agency: bez
          ierobežojumiem)
        </div>
      </div>

      {/* 1) Konta izvēle */}
      <div className={card}>
        <div className="text-sm font-extrabold text-white">Konts</div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <select
            className={input}
            value={mounted ? selectedAccountId : ""}
            onChange={(e) => setAccount(e.target.value)}
            disabled={!mounted}
          >
            {/* ✅ vienmēr identisks server/client: tikai šis option SSR laikā */}
            <option value="" className="bg-white text-black">
              — Izvēlies kontu —
            </option>

            {/* ✅ option sarakstu renderējam tikai pēc mount */}
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
            title={!mounted ? "Ielādējas..." : "Notīrīt izvēli"}
          >
            Notīrīt izvēli
          </button>
        </div>
      </div>

      {/* 2) Builder */}
      {mounted && selectedAccount ? (
        <div className={card}>
          <div className="mb-4 text-sm font-semibold text-white/60">
            Izvēlētais konts:{" "}
            <span className="font-extrabold text-white/85">
              {selectedAccount.name}
            </span>{" "}
            <span className="text-white/35">·</span>{" "}
            <span className="font-mono text-white/70">{selectedAccount.id}</span>
          </div>

          {/* ✅ Agency = bez ierobežojumiem */}
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
          {mounted
            ? "Izvēlies kontu, lai atvērtu kampaņu veidotāju."
            : "Ielādējas..."}
        </div>
      )}
    </div>
  );
}

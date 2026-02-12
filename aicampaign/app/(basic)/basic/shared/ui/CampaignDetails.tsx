"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import SectionHeader from "@/app/(basic)/basic/administrator/_ui/SectionHeader";
import KeywordsTable from "@/app/(basic)/basic/administrator/_ui/KeywordsTable";

import CampaignParamCard, {
  type Status as ParamStatus,
} from "@/app/(basic)/basic/shared/ui/CampaignParamCard";

import {
  useAgencyStore,
  getAgencyStore,
  agencySelectors,
  type KeywordRow,
} from "@/app/(basic)/basic/shared/_data/agencyStore";

type Health = "ok" | "warning" | "critical";
type Mode = "admin" | "manager";

type Props = {
  mode: Mode;
  accountId: string;
  campaignId: string;
};

type AiItem = { id: string; text: string };

type ParamCard = {
  key: string;
  title: string;
  status: ParamStatus;
  summary: string;
  aiItems: AiItem[];
};

const card =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm overflow-hidden";
const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10";

function HealthBadge({ h }: { h: Health }) {
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold";
  if (h === "ok")
    return (
      <span
        className={
          base +
          " border-emerald-400/30 text-emerald-200 bg-emerald-500/10"
        }
      >
        OK
      </span>
    );
  if (h === "warning")
    return (
      <span
        className={
          base + " border-amber-400/30 text-amber-200 bg-amber-500/10"
        }
      >
        Jāuzlabo
      </span>
    );
  return (
    <span className={base + " border-red-400/30 text-red-200 bg-red-500/10"}>
      Kritisks
    </span>
  );
}

function budgetBarClass(pct: number) {
  if (pct >= 80) return "bg-red-400/70";
  if (pct >= 50) return "bg-amber-300/80";
  return "bg-emerald-300/80";
}

function healthFromScore(score?: number): Health {
  const v = Number(score ?? 0);
  if (v >= 75) return "ok";
  if (v >= 45) return "warning";
  return "critical";
}

export default function CampaignDetails(props: Props) {
  useAgencyStore();

  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [keywordsOpen, setKeywordsOpen] = useState(true);

  // ✅ BASIC: tikai 4 svarīgākie parametri (budžets/veiktspēja)
  const paramCards: ParamCard[] = useMemo(
    () => [
      {
        key: "budget_pacing",
        title: "Budžeta dinamika",
        status: "warning",
        summary: "Budžets tiek iztērēts pārāk ātri dienas pirmajā pusē.",
        aiItems: [
          {
            id: "bp1",
            text: "Iestatīt grafiku (ad schedule), lai samazinātu pīķa stundas.",
          },
          {
            id: "bp2",
            text: "Pārdalīt budžetu uz segmentiem ar augstāku konversiju īpatsvaru.",
          },
          {
            id: "bp3",
            text: "Ja pieprasījums stabils, palielināt dienas budžetu kontrolēti (+10–20%).",
          },
        ],
      },
      {
        key: "bidding_strategy",
        title: "Likmju stratēģija",
        status: "warning",
        summary: "Likmju stratēģija var neatbilst konversiju mērķim (demo).",
        aiItems: [
          {
            id: "bs1",
            text: "Pāriet uz Maximize Conversions (ja pietiek konversiju signālu).",
          },
          {
            id: "bs2",
            text: "Uzstādīt Target CPA ar konservatīvu vērtību un testēt 7 dienas.",
          },
          {
            id: "bs3",
            text: "Pārskatīt Primary konversijas, kurām kampaņa optimizējas.",
          },
        ],
      },
      {
        key: "search_terms",
        title: "Meklēšanas vaicājumi",
        status: "critical",
        summary: "Augsts neatbilstošu vaicājumu īpatsvars (demo).",
        aiItems: [
          {
            id: "st1",
            text: "Pievienot negatīvos atslēgvārdus (top 10 waste vaicājumi).",
          },
          {
            id: "st2",
            text: "Samazināt broad match tur, kur CPA ir virs mērķa.",
          },
          {
            id: "st3",
            text: "Izveidot atsevišķas ad grupas top konvertējošiem vaicājumiem (Phrase/Exact).",
          },
        ],
      },
      {
        key: "budget_distribution",
        title: "Budžeta sadalījums",
        status: "warning",
        summary: "Budžets var aiziet uz zemas veiktspējas segmentiem (demo).",
        aiItems: [
          {
            id: "bd1",
            text: "Samazināt budžetu ad grupām/vaicājumiem ar zemu konversiju īpatsvaru.",
          },
          {
            id: "bd2",
            text: "Palielināt budžetu top segmentiem (labākais CPA/ROAS).",
          },
          {
            id: "bd3",
            text: "Izslēgt/ierobežot segmentus, kas dedzina budžetu bez rezultāta.",
          },
        ],
      },
    ],
    []
  );

  const store = getAgencyStore();
  const account = agencySelectors.accountById(store, props.accountId);
  const campaigns = agencySelectors.campaignsByAccountId(store, props.accountId);
  const campaign = campaigns.find(
    (c) => String(c.id) === String(props.campaignId)
  );

  const campaignTitle = mounted ? campaign?.name ?? "Kampaņa" : "Kampaņa";
  const accountTitle = mounted ? account?.name ?? props.accountId : props.accountId;

  // atbalstām gan dailyBudget/spentToday, gan vecos laukus (ja kaut kur vēl ir)
  const spend = Number((campaign as any)?.spentToday ?? (campaign as any)?.budgetSpentToday ?? 0);
  const budget = Number((campaign as any)?.dailyBudget ?? (campaign as any)?.budgetToday ?? 0);

  const spentPct = useMemo(() => {
    if (!budget) return 0;
    return Math.min(100, Math.round((spend / budget) * 100));
  }, [spend, budget]);

  const health = healthFromScore((campaign as any)?.health);

  const keywordRows: KeywordRow[] = useMemo(
    () => [
      { keyword: "google reklāma", matchType: "PHRASE" },
      { keyword: "ppc pārvaldība", matchType: "EXACT" },
      { keyword: "bezmaksas audits", matchType: "BROAD" },
      { keyword: "aģentūra reklāma", matchType: "BROAD", isNegative: true },
    ],
    []
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-white/60">Kampaņas detaļas</div>
          <div className="mt-2 text-2xl font-semibold text-white/90">
            {campaignTitle}
          </div>
          <div className="mt-2 text-sm text-white/70">
            Konts:{" "}
            <span className="font-semibold text-white/90">{accountTitle}</span>{" "}
            · ID: <span className="font-mono">{props.campaignId}</span>
          </div>
        </div>

        <button
          className={btn}
          onClick={() => {
            try {
              const ref = document.referrer;
              const path = ref ? new URL(ref).pathname : "";
              if (path.startsWith("/basic/")) {
                router.back();
                return;
              }
            } catch {}
            router.push(`/basic/administrator/konti/${props.accountId}/kampanas`);
          }}
        >
          Atpakaļ
        </button>
      </div>

      {/* TOP CARD (bez pārskatu pogas) */}
      <div className={card + " mt-6"}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                Statuss: <b>{(campaign as any)?.status ?? "ACTIVE"}</b>
              </div>
              <HealthBadge h={health} />
            </div>
            <div className="text-right">
              <div className="text-sm text-white/60">Budžets šodien</div>
              <div className="text-xl font-semibold">
                {spend.toFixed(2)}$ / {budget.toFixed(2)}$
              </div>
            </div>
          </div>

          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div
              className={`h-full ${budgetBarClass(spentPct)}`}
              style={{ width: `${spentPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* PARAMETRI */}
      <div className="mt-10">
        <SectionHeader title="Pārbaudes" />
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {paramCards.map((p) => {
            const persistKey = `acc:${props.accountId}:cmp:${props.campaignId}:${p.key}`;

            const allIds = p.aiItems.map((x) => x.id);
            const aiChanges = p.aiItems.map((x) => ({ id: x.id, title: x.text }));
            const aiSuggestion =
              p.aiItems[0]?.text ?? "Atver AI piedāvājumu un apstiprini izmaiņas.";

            return (
              <CampaignParamCard
                key={persistKey}
                persistKey={persistKey}
                title={p.title}
                status={p.status}
                summary={p.summary}
                aiSuggestion={aiSuggestion}
                aiChanges={aiChanges}
                googleAdsDisabled
                onApproveAi={(selectedChangeIds: string[]) => {
                  const approved = selectedChangeIds;
                  const rejected = allIds.filter((id) => !selectedChangeIds.includes(id));

                  console.log("AI APPLY (BASIC)", {
                    persistKey,
                    approved,
                    rejected,
                  });
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ATSLĒGVĀRDI */}
      <div className="mt-10">
        <div className="flex justify-between">
          <SectionHeader title="Atslēgvārdi" />
          <button className={btn} onClick={() => setKeywordsOpen((v) => !v)}>
            {keywordsOpen ? "Sakļaut" : "Izvērst"}
          </button>
        </div>

        {keywordsOpen && (
          <div className="mt-4">
            <KeywordsTable rows={keywordRows as any} />
          </div>
        )}
      </div>
    </div>
  );
}

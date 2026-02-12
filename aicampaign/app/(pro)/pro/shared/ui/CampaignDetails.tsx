"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import SectionHeader from "@/app/(pro)/pro/administrator/_ui/SectionHeader";
import KeywordsTable from "@/app/(pro)/pro/administrator/_ui/KeywordsTable";
import ReportModal from "@/app/(pro)/pro/administrator/_ui/ReportModal";

import CampaignParamCard from "@/app/(pro)/pro/shared/ui/CampaignParamCard";

import {
  useAgencyStore,
  getAgencyStore,
  agencySelectors,
  type KeywordRow,
} from "@/app/(pro)/pro/shared/_data/agencyStore";

type Health = "ok" | "warning" | "critical";
type Mode = "admin" | "manager";

type Props = {
  mode: Mode;
  accountId: string;
  campaignId: string;
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

  const [reportOpen, setReportOpen] = useState(false);
  const [keywordsOpen, setKeywordsOpen] = useState(true);

  const paramCards = useMemo(
    () => [
      {
        key: "budget_pacing",
        title: "Budžeta dinamika",
        status: "warning" as const,
        summary: "Budžets tiek iztērēts pārāk ātri dienas pirmajā pusē.",
        aiItems: [
          {
            id: "bp1",
            text: "Iestatīt grafiku (ad schedule), lai samazinātu pīķa stundas.",
          },
          {
            id: "bp2",
            text: "Samazināt bid korekcijas rīta stundās (ja izmantots manuāls CPC).",
          },
          {
            id: "bp3",
            text: "Pārdalīt budžetu uz kampaņām/ad grupām ar augstāku konversiju īpatsvaru.",
          },
          {
            id: "bp4",
            text: "Ja ir pieprasījums, palielināt dienas budžetu (kontrolēti +10–20%).",
          },
        ],
      },
      {
        key: "bidding_strategy",
        title: "Likmju stratēģija",
        status: "warning" as const,
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
            text: "Pārliecināties, ka Primary konversijas ir pareizi izvēlētas optimizācijai.",
          },
        ],
      },
      {
        key: "search_terms",
        title: "Meklēšanas vaicājumi",
        status: "critical" as const,
        summary: "Augsts neatbilstošu vaicājumu īpatsvars (demo).",
        aiItems: [
          {
            id: "st1",
            text: "Pievienot negatīvos atslēgvārdus (top 10 waste vaicājumi).",
          },
          {
            id: "st2",
            text: "Pārskatīt broad match izmantošanu problemātiskajās ad grupās.",
          },
          {
            id: "st3",
            text: "Izveidot atsevišķas ad grupas top konvertējošiem vaicājumiem ar Phrase/Exact.",
          },
        ],
      },
      {
        key: "match_types",
        title: "Atslēgvārdu atbilstība",
        status: "warning" as const,
        summary: "Dominē Broad match bez pietiekamas kontroles (demo).",
        aiItems: [
          {
            id: "mt1",
            text: "Pārvietot top vaicājumus uz Phrase/Exact atslēgvārdiem.",
          },
          {
            id: "mt2",
            text: "Samazināt broad match klātbūtni tur, kur CPA ir virs mērķa.",
          },
          {
            id: "mt3",
            text: "Papildināt negatīvos atslēgvārdus pēc search terms datiem.",
          },
        ],
      },
      {
        key: "ads_quality",
        title: "Reklāmu kvalitāte (RSA)",
        status: "warning" as const,
        summary: "Nepietiek virsrakstu/aprakstu variāciju (demo).",
        aiItems: [
          {
            id: "aq1",
            text: "Pievienot 6–8 jaunus virsrakstus ar galvenajiem USP un atslēgvārdiem.",
          },
          { id: "aq2", text: "Pievienot 2–3 jaunus aprakstus ar skaidru CTA." },
          {
            id: "aq3",
            text: "Samazināt “pinned” elementus, ja tie ierobežo kombinācijas.",
          },
        ],
      },
      {
        key: "landing_page",
        title: "Landing page atbilstība",
        status: "warning" as const,
        summary: "Konversiju rādītājs var būt zem nozares vidējā (demo).",
        aiItems: [
          {
            id: "lp1",
            text: "Uzlabot CTA (viena galvenā darbība, skaidrs virsraksts virs fold).",
          },
          {
            id: "lp2",
            text: "Samazināt ielādes laiku (attēli, skripti, lazy-load, kešatmiņa).",
          },
          {
            id: "lp3",
            text: "Saskaņot landing tekstu ar reklāmas ziņojumu (message match).",
          },
        ],
      },
      {
        key: "conversion_tracking",
        title: "Konversiju uzskaite",
        status: "critical" as const,
        summary: "Konversiju iestatījumi/atribūcija var būt nekorekta (demo).",
        aiItems: [
          {
            id: "ct1",
            text: "Atzīmēt pareizās konversijas kā Primary un izslēgt sekundārās optimizācijai.",
          },
          {
            id: "ct2",
            text: "Novērst dublikātus (GTM + gtag dubultā uzskaite).",
          },
          {
            id: "ct3",
            text: "Pārbaudīt atribūcijas modeli un conversion window atbilstību biznesam.",
          },
        ],
      },
      {
        key: "budget_distribution",
        title: "Budžeta sadalījums",
        status: "warning" as const,
        summary: "Budžets var aiziet uz zemas veiktspējas segmentiem (demo).",
        aiItems: [
          {
            id: "bd1",
            text: "Samazināt budžetu ad grupām/vaicājumiem ar zemu konversiju īpatsvaru.",
          },
          { id: "bd2", text: "Palielināt budžetu top segmentiem (labākais CPA/ROAS)." },
          {
            id: "bd3",
            text: "Izslēgt/ierobežot placementus/auditorijas, kas dedzina budžetu bez rezultāta.",
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

  const spend = Number(campaign?.budgetSpentToday ?? 0);
  const budget = Number(campaign?.budgetToday ?? 0);

  const spentPct = useMemo(() => {
    if (!budget) return 0;
    return Math.min(100, Math.round((spend / budget) * 100));
  }, [spend, budget]);

  const health = healthFromScore(campaign?.health);

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
          <div className="mt-2 text-2xl font-semibold text-white/90">{campaignTitle}</div>
          <div className="mt-2 text-sm text-white/70">
            Konts:{" "}
            <span className="font-semibold text-white/90">{accountTitle}</span> · ID:{" "}
            <span className="font-mono">{props.campaignId}</span>
          </div>
        </div>

        <button
          className={btn}
          onClick={() => {
            try {
              const ref = document.referrer;
              const path = ref ? new URL(ref).pathname : "";
              if (path.startsWith("/pro/")) {
                router.back();
                return;
              }
            } catch {
              // ignore
            }
            router.push(`/pro/administrator/konti/${props.accountId}/kampanas`);
          }}
        >
          Atpakaļ
        </button>
      </div>

      {/* TOP CARD */}
      <div className={card + " mt-6"}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                Statuss: <b>{campaign?.status ?? "ACTIVE"}</b>
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

          <div className="mt-4">
            <button
              className="rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-black"
              onClick={() => setReportOpen(true)}
            >
              Izveidot pārskatu
            </button>
          </div>
        </div>
      </div>

      {/* PARAMETRI */}
      <div className="mt-10">
        <SectionHeader title="Pārbaudes" />
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {paramCards.map((p) => {
            const persistKey = `acc:${props.accountId}:cmp:${props.campaignId}:${p.key}`;

            return (
           <CampaignParamCard
      key={persistKey}
      persistKey={persistKey}
      title={p.title}
      status={p.status}
      summary={p.summary}
      aiSuggestion={(p.aiItems?.[0]?.text ?? p.summary) + " (demo)"}   // ✅ PIELIKT ŠO
      googleAdsDisabled
      aiChanges={(p.aiItems ?? []).map((x: any) => ({
        id: String(x.id),
        title: String(x.text),
        details: "",
        risk:
          p.status === "critical" ? "high" : p.status === "warning" ? "medium" : "low",
      }))}
      onApproveAi={(changeIds: string[]) => {
        console.log("AI APPROVE", { persistKey, changeIds });
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

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        campaignName={campaignTitle}
      />
    </div>
  );
}

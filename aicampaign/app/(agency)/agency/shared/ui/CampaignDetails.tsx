"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import SectionHeader from "@/app/(agency)/agency/administrator/_ui/SectionHeader";
import KeywordsTable from "@/app/(agency)/agency/administrator/_ui/KeywordsTable";
import ReportModal from "@/app/(agency)/agency/administrator/_ui/ReportModal";

// ✅ SVARĪGI: lai persistKey props eksistē
import CampaignParamCard from "@/app/(agency)/agency/shared/ui/CampaignParamCard";

import {
  useAgencyStore,
  getAgencyStore,
  agencySelectors,
} from "@/app/(agency)/agency/shared/_data/agencyStore";

type Health = "ok" | "warning" | "critical";
type Mode = "admin" | "manager";

/**
 * ✅ FIX: paplašināts Props, lai der:
 * - vecajam režīmam (mode/accountId/campaignId)
 * - jaunajam režīmam (titlePrefix/campaign/accountName/googleAdsHref/topRightLabel)
 * + ✅ NEW: onBack (lai var izmantot router.back())
 *
 * Nekas no tavām funkcijām nepazūd.
 */
type Props = {
  // ===== legacy (tavs) =====
  mode?: Mode;
  accountId?: string;
  campaignId?: string;
  backHref?: string;
  managerId?: string;

  // ===== new callers (Client.tsx) =====
  titlePrefix?: string;
  campaign?: any;
  accountName?: string;
  googleAdsHref?: string | null;
  topRightLabel?: ReactNode;

  // ✅ NEW: “pārlūkprogrammas princips”
  onBack?: () => void;
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
    <span className={base + " border-rose-400/30 text-rose-200 bg-rose-500/10"}>
      Kritisks
    </span>
  );
}

function budgetBarClass(pct: number) {
  if (pct >= 80) return "bg-red-400/70";
  if (pct >= 50) return "bg-amber-300/80";
  return "bg-emerald-300/80";
}

export default function CampaignDetails(props: Props) {
  // 1) ✅ Hooki VIENMĒR tiek izsaukti tādā pašā secībā
  useAgencyStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [reportOpen, setReportOpen] = useState(false);
  const [keywordsOpen, setKeywordsOpen] = useState(true);
  const [approved, setApproved] = useState<Record<string, boolean>>({});

  // ✅ ja caller padod campaign/accountName – izmantojam to (prioritāte),
  // citādi krītam atpakaļ uz store lookup pēc accountId/campaignId.
  const campaignId =
    (props.campaignId ?? props.campaign?.id ?? "").toString();
  const accountId =
    (props.accountId ?? props.campaign?.accountId ?? "").toString();

  // 2) ✅ paramCards ir stabils (neatkarīgs no store)
  const paramCards = useMemo(() => {
    return [
      {
        key: "budget_pacing",
        title: "Budžeta dinamika (pacing)",
        status: "warning" as const,
        summary: "Notiek budžeta monitorings (demo).",
        aiSuggestion:
          "Pārbaudi dienas laika grafiku un ierobežo dārgākās stundas.",
      },
      {
        key: "search_terms",
        title: "Search Terms (nevēlamie vaicājumi)",
        status: "warning" as const,
        summary: "Ir signāli par neatbilstošiem meklēšanas vaicājumiem (demo).",
        aiSuggestion:
          "Pievieno 5–10 negatīvos atslēgvārdus un sašaurini atbilstības tipus.",
      },
      {
        key: "ads_strength",
        title: "Reklāmu kvalitāte (RSA assets)",
        status: "warning" as const,
        summary:
          "Trūkst pietiekami daudz variāciju virsrakstos un aprakstos (demo).",
        aiSuggestion:
          "Pievieno 3 jaunus virsrakstus ar USP + 2 aprakstus ar skaidru CTA.",
      },
      {
        key: "bids_cpc",
        title: "CPC / Bid korekcijas",
        status: "ok" as const,
        summary: "Vidējais CPC stabils (demo).",
        aiSuggestion:
          "Atstāj kā ir, bet pārbaudi TOP % kritumus un konkurentu spiedienu.",
      },
      {
        key: "landing_page",
        title: "Landing page atbilstība",
        status: "warning" as const,
        summary: "Pastāv risks, ka lapa neatbilst meklējuma nodomam (demo).",
        aiSuggestion:
          "Pārbaudi H1/virsrakstus, ielādes ātrumu un saskaņo tekstu ar reklāmas solījumu.",
      },
      {
        key: "audiences",
        title: "Auditorijas signāli / remarketing",
        status: "ok" as const,
        summary: "Auditoriju signāli ieslēgti (demo).",
        aiSuggestion:
          "Paplašini ar 1–2 jauniem segmentiem (piem., pircēju nodoms / līdzīgas auditorijas).",
      },
      {
        key: "geo",
        title: "Ģeogrāfija (kur tērējas budžets)",
        status: "warning" as const,
        summary: "Daļa budžeta aiziet zemākas kvalitātes reģionos (demo).",
        aiSuggestion:
          "Izslēdz 1–2 reģionus vai ieliec -20% bid adjustment vietām ar sliktu ROI.",
      },
      {
        key: "conversion_tracking",
        title: "Konversiju izsekošana",
        status: "critical" as const,
        summary: "Konversiju dati var būt nepilnīgi (demo).",
        aiSuggestion:
          "Pārbaudi galveno konversiju importu, tagu statusu un atribūciju modeli.",
      },
    ];
  }, []);

  // 3) ✅ Store datus “nolasām” vienmēr, bet UI izvēlamies pēc mounted
  const store = getAgencyStore();

  const account =
    !props.accountName && accountId
      ? agencySelectors.accountById(store, accountId)
      : null;

  const campaigns =
    accountId ? agencySelectors.campaignsByAccountId(store, accountId) ?? [] : [];

  const campaignFromStore = campaigns.find(
    (c) => String(c?.id) === String(campaignId)
  );

  const campaign = (props.campaign ?? campaignFromStore) as any;

  const campaignTitleReal = campaign?.name ?? "Kampaņa";
  const accountTitleReal =
    props.accountName ?? account?.name ?? (accountId ? accountId : "—");

  const healthReal: Health = (campaign?.health as Health) ?? "warning";
  const spendReal = Number(campaign?.spentToday ?? 0);
  const budgetReal = Number(campaign?.dailyBudget ?? 0);

  const spentPctReal = useMemo(() => {
    if (!budgetReal) return 0;
    const p = (spendReal / budgetReal) * 100;
    return Math.max(0, Math.min(100, Math.round(p)));
  }, [spendReal, budgetReal]);

  const paramCardsWithBudget = useMemo(() => {
    const pct = spentPctReal;
    return paramCards.map((p) => {
      if (p.key !== "budget_pacing") return p;
      return {
        ...p,
        status: (pct >= 80 ? "critical" : pct >= 50 ? "warning" : "ok") as
          | "ok"
          | "warning"
          | "critical",
        summary: `Iztērēts ${pct}% no dienas budžeta.`,
        aiSuggestion:
          pct >= 80
            ? "Samazini bidus vai pārdali budžetu uz rīt/vēlākām stundām, lai neizsmeltu budžetu pārāk ātri."
            : pct >= 50
              ? "Pārbaudi dienas laika grafiku un ierobežo dārgākās stundas."
              : "Viss izskatās stabili. Turpini monitorēt.",
      };
    });
  }, [paramCards, spentPctReal]);

  // 4) ✅ UI vērtības: pirms mounted rādam stabilu placeholder, pēc mounted rādam īsto
  const campaignTitle = mounted ? campaignTitleReal : "Kampaņa";
  const accountTitle = mounted ? accountTitleReal : (accountId || "—");
  const health = mounted ? healthReal : ("warning" as Health);
  const spend = mounted ? spendReal : 0;
  const budget = mounted ? budgetReal : 0;
  const spentPct = mounted ? spentPctReal : 0;

  const backHref = props.backHref;

  const headerPrefix =
    props.titlePrefix ??
    (props.mode === "admin"
      ? "Admin / Kampaņas detaļas"
      : "Manager / Kampaņas detaļas");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-white/60">{headerPrefix}</div>
          <div className="mt-2 text-2xl font-semibold text-white/90">
            {campaignTitle}
          </div>
          <div className="mt-2 text-sm text-white/70">
            Konts:{" "}
            <span className="font-semibold text-white/90">{accountTitle}</span>{" "}
            · ID: <span className="font-mono text-white/80">{campaignId}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {props.topRightLabel ? (
            <div className="hidden sm:block">{props.topRightLabel}</div>
          ) : null}

          {/* ✅ FIX: onBack ir prioritāte */}
          {props.onBack ? (
            <button className={btn} type="button" onClick={props.onBack}>
              Atpakaļ
            </button>
          ) : backHref ? (
            <Link className={btn} href={backHref}>
              Atpakaļ
            </Link>
          ) : (
            <button className={btn} type="button" onClick={() => history.back()}>
              Atpakaļ
            </button>
          )}
        </div>
      </div>

      {/* ======= TOP CARD ======= */}
      <div className={card + " mt-6"}>
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-white/70">
                Statuss:{" "}
                <span className="font-semibold text-white/90">Aktīva</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                Veselība: <HealthBadge h={health} />
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-white/60">Budžets šodien</div>
              <div className="text-xl font-semibold text-white/90">
                {spend.toFixed(2)}$ / {budget.toFixed(2)}$
              </div>
            </div>
          </div>

          <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full ${budgetBarClass(spentPct)}`}
              style={{ width: `${spentPct}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-white/50">Iztērēts: {spentPct}%</div>

          <div className="mt-5 flex items-center gap-3">
            <button
              className="rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
              onClick={() => setReportOpen(true)}
            >
              Izveidot pārskatu
            </button>

            {props.googleAdsHref ? (
              <a
                className={btn}
                href={props.googleAdsHref}
                target="_blank"
                rel="noreferrer noopener"
              >
                Atvērt Google Ads ↗
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* ======= PĀRBAUDES / PARAMETRI ======= */}
      <div className="mt-10">
        <SectionHeader title="Pārbaudes" />
        <div className="mt-2 text-sm text-white/60">
          8 ikdienas pārbaudes parametri. AI var sagatavot un izpildīt
          ieteikumus pēc apstiprināšanas.
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {(mounted ? paramCardsWithBudget : paramCards).map((p) => {
            const persistKey = `acc:${accountId}:cmp:${campaignId}:param:${p.key}`;
            return (
              <CampaignParamCard
                key={persistKey}
                persistKey={persistKey}
                title={p.title}
                status={p.status}
                summary={p.summary}
                aiSuggestion={p.aiSuggestion}
                approved={!!approved[p.key]}
                onApproveAi={() => setApproved((s) => ({ ...s, [p.key]: true }))}
                googleAdsDisabled={true}
                googleAdsUrl={undefined}
              />
            );
          })}
        </div>
      </div>

      {/* ======= ATSLĒGVĀRDI ======= */}
      <div className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <SectionHeader title="Atslēgvārdi" />
          <button
            type="button"
            className={btn}
            onClick={() => setKeywordsOpen((v) => !v)}
          >
            {keywordsOpen ? "Sakļaut" : "Izvērst"}
          </button>
        </div>

        {keywordsOpen ? (
          <div className="mt-4">
            <KeywordsTable rows={(campaign?.keywords ?? []) as any} />
          </div>
        ) : (
          <div className="mt-3 text-sm text-white/50">
            Atslēgvārdu saraksts ir sakļauts.
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

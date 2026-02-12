"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import CampaignWizard from "../../../features/ai-campaign-builder/ui/CampaignWizard";
import CampaignResults from "../../../features/ai-campaign-builder/ui/CampaignResults";
import type { CampaignDraft } from "../../../features/ai-campaign-builder/state/types";
import { useAgencyStore } from "../shared/_data/agencyStore";

const shell = "sticky top-3 z-40 mx-auto w-full max-w-6xl px-4";
const bar =
  "rounded-3xl border border-white/10 bg-white/5 backdrop-blur px-4 py-3 shadow-sm";

const btn =
  "rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/80 hover:bg-white/10";
const btnPrimary =
  "rounded-2xl bg-white/80 px-4 py-2 text-sm font-extrabold text-black hover:opacity-90";
const btnDisabled =
  "rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/35 cursor-not-allowed";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Client() {
  const pathname = usePathname() || "";

  // lai store initējas
  const accounts = useAgencyStore((s) => s.accounts);
  const campaigns = useAgencyStore((s) => s.campaigns);
  const limits = useAgencyStore((s) => s.limits);

  const accountId = accounts[0]?.id;

  const campaignCount = useMemo(() => {
    if (!accountId) return 0;
    return campaigns.filter((c) => String(c.accountId) === String(accountId)).length;
  }, [campaigns, accountId]);

  const canCreate = campaignCount < limits.maxCampaignsPerAccount;

  const [draft, setDraft] = useState<CampaignDraft | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  function handleComplete(d: CampaignDraft) {
    setDraft(d);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function handleResetAll() {
    setDraft(null);
  }

  const kontiHref = "/basic/administrator/konti";
  const kampanasHref = "/basic/administrator/kampanas";
  const aiAsistentsHref = "/basic/administrator/ai-asistents";
  const aiKampanaHref = "/basic/ai-kampana";

  return (
    <div className="min-h-screen w-full bg-black text-white/90">
      {/* ✅ TOPBAR */}
      <div className={shell}>
        <div className={bar}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-xl font-bold text-white/80">BASIC</div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link href={kontiHref} className={isActive(pathname, kontiHref) ? btnPrimary : btn}>
                Konti
              </Link>

              <Link
                href={kampanasHref}
                className={isActive(pathname, kampanasHref) ? btnPrimary : btn}
              >
                Kampaņas
              </Link>

              <Link
                href={aiAsistentsHref}
                className={isActive(pathname, aiAsistentsHref) ? btnPrimary : btn}
              >
                AI asistents
              </Link>

              {canCreate ? (
                <Link
                  href={aiKampanaHref}
                  className={isActive(pathname, aiKampanaHref) ? btnPrimary : btn}
                >
                  Izveidot AI kampaņu
                </Link>
              ) : (
                <button
                  type="button"
                  className={btnDisabled}
                  title="Basic limits: max 5 kampaņas"
                >
                  Izveidot AI kampaņu
                </button>
              )}
            </div>
          </div>

          <div className="mt-2 text-xs font-semibold text-white/45">
            Kampaņas: <span className="text-white/70">{campaignCount}</span> /{" "}
            <span className="text-white/70">{limits.maxCampaignsPerAccount}</span>
          </div>
        </div>
      </div>

      {/* ✅ SATURS (builder paliek un vienmēr renderējas) */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6">
        <div className="mb-6">
          <div className="text-xl text-white/60">Basic — AI Campaign Builder</div>
          <h1 className="mt-2 text-2xl font-semibold">Izveidot AI kampaņu</h1>
          <p className="mt-2 text-white/60">
            Basic: max {limits.maxCampaignsPerAccount} kampaņas. Domēns viens (vari mainīt URL
            lapu/path).
          </p>

          {!canCreate ? (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Sasniegts limits: {campaignCount}/{limits.maxCampaignsPerAccount}. Lai veidotu jaunu
              kampaņu, noņem kādu esošo.
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <CampaignWizard plan="basic" onComplete={handleComplete} onResetAll={handleResetAll} />
        </div>

        <div ref={resultsRef}>{draft ? <CampaignResults draft={draft} /> : null}</div>
      </div>
    </div>
  );
}

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

  // Initialize store
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

  const accountsHref = "/basic/administrator/accounts";
  const campaignsHref = "/basic/administrator/campaigns";
  const aiAssistantHref = "/basic/administrator/ai-assistant";
  const aiCampaignHref = "/basic/ai-campaign";

  return (
    <div className="min-h-screen w-full bg-black text-white/90">
      {/* ✅ TOP BAR */}
      <div className={shell}>
        <div className={bar}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-xl font-bold text-white/80">BASIC</div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={accountsHref}
                className={isActive(pathname, accountsHref) ? btnPrimary : btn}
              >
                Accounts
              </Link>

              <Link
                href={campaignsHref}
                className={isActive(pathname, campaignsHref) ? btnPrimary : btn}
              >
                Campaigns
              </Link>

              <Link
                href={aiAssistantHref}
                className={isActive(pathname, aiAssistantHref) ? btnPrimary : btn}
              >
                AI Assistant
              </Link>

              {canCreate ? (
                <Link
                  href={aiCampaignHref}
                  className={isActive(pathname, aiCampaignHref) ? btnPrimary : btn}
                >
                  Create AI Campaign
                </Link>
              ) : (
                <button
                  type="button"
                  className={btnDisabled}
                  title="Basic plan limit: max campaigns reached"
                >
                  Create AI Campaign
                </button>
              )}
            </div>
          </div>

          <div className="mt-2 text-xs font-semibold text-white/45">
            Campaigns: <span className="text-white/70">{campaignCount}</span> /{" "}
            <span className="text-white/70">{limits.maxCampaignsPerAccount}</span>
          </div>
        </div>
      </div>

      {/* ✅ CONTENT (builder always renders) */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6">
        <div className="mb-6">
          <div className="text-xl text-white/60">Basic — AI Campaign Builder</div>
          <h1 className="mt-2 text-2xl font-semibold">Create AI Campaign</h1>
          <p className="mt-2 text-white/60">
            Basic plan: up to {limits.maxCampaignsPerAccount} campaigns. One domain only
            (you can change URL page/path).
          </p>

          {!canCreate ? (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Limit reached: {campaignCount}/{limits.maxCampaignsPerAccount}. Remove an existing
              campaign to create a new one.
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

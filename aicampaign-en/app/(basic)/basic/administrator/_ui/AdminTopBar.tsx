"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAgencyStore } from "@/app/(basic)/basic/shared/_data/agencyStore";

const shell = "sticky top-3 z-40 mx-auto w-full max-w-6xl px-4";
const bar =
  "rounded-3xl border border-white/10 bg-white/5 backdrop-blur px-4 py-3 shadow-sm";

const btn =
  "rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/80 hover:bg-white/10";
const btnPrimary =
  "rounded-2xl bg-white/80 px-4 py-2 text-sm font-extrabold text-black hover:opacity-90";
const btnDisabled =
  "rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/35 cursor-not-allowed";

// ✅ Matches paths like: /basic/administrator/accounts/<accountId>/campaigns...
function isAccountCampaignPath(pathname: string) {
  return /^\/basic\/administrator\/accounts\/[^/]+\/campaigns(\/|$)/.test(pathname);
}

function isActive(pathname: string, href: string) {
  if (href === "/basic/administrator/accounts") {
    // ✅ Accounts should NOT be active when viewing campaigns under a specific account
    if (isAccountCampaignPath(pathname)) return false;

    return (
      pathname === "/basic/administrator" ||
      pathname === href ||
      pathname.startsWith("/basic/administrator/accounts/")
    );
  }

  if (href === "/basic/administrator/campaigns") {
    return (
      pathname === href ||
      pathname.startsWith("/basic/administrator/campaigns") ||
      // ✅ Campaign details under an account also count as “Campaigns”
      isAccountCampaignPath(pathname) ||
      pathname.includes("/campaigns/")
    );
  }

  if (href === "/basic/ai-campaign") {
    return pathname === href || pathname.startsWith("/basic/ai-campaign");
  }

  if (href === "/basic/administrator/ai-assistant") {
    return (
      pathname === href ||
      pathname.startsWith("/basic/administrator/ai-assistant")
    );
  }

  return pathname === href;
}

export default function AdminTopBar() {
  const pathname = usePathname() || "";

  const accounts = useAgencyStore((s) => s.accounts);
  const campaigns = useAgencyStore((s) => s.campaigns);
  const limits = useAgencyStore((s) => s.limits);

  const accountId = accounts[0]?.id;

  const campaignCount = useMemo(() => {
    if (!accountId) return 0;
    return campaigns.filter((c) => String(c.accountId) === String(accountId))
      .length;
  }, [campaigns, accountId]);

  const canCreate = campaignCount < limits.maxCampaignsPerAccount;

  // NOTE: Routes still use LV segments for now (accounts/campaigns/etc.)
  // You can rename folders later without changing any of the UI copy below.
  const accountsHref = "/basic/administrator/accounts";
  const campaignsHref = "/basic/administrator/campaigns";
  const aiCampaignHref = "/basic/ai-campaign";
  const aiAssistantHref = "/basic/administrator/ai-assistant";

  return (
    <div className={shell}>
      <div className={bar}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold text-white/80">
              Basic · Administrator
            </div>
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
                title="Basic plan limit: max 5 campaigns"
              >
                Create AI Campaign
              </button>
            )}
          </div>
        </div>

        <div className="mt-2 text-xs font-semibold text-white/45">
          Campaigns:{" "}
          <span className="text-white/70">{campaignCount}</span> /{" "}
          <span className="text-white/70">{limits.maxCampaignsPerAccount}</span>
        </div>
      </div>
    </div>
  );
}

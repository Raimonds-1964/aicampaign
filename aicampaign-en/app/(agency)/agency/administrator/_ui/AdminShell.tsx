"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function pill(active: boolean) {
  return (
    "rounded-full px-4 py-2 text-sm font-semibold transition " +
    (active
      ? "bg-white/90 text-black"
      : "border border-white/15 bg-white/5 text-white/85 hover:bg-white/10")
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";

  const is = (p: string) => pathname === p || pathname.startsWith(p + "/");

  /**
   * Campaigns section should be active even when inside
   * account-level campaign routes:
   * /agency/administrator/accounts/[accountId]/campaigns/...
   */
  const isCampaignPath =
    is("/agency/administrator/campaigns") ||
    pathname.includes("/campaigns/");

  const accountsActive =
    is("/agency/administrator/accounts") && !isCampaignPath;

  const campaignsActive = isCampaignPath;

  const managersActive = is("/agency/administrator/managers");
  const aiAssistantsActive = is("/agency/administrator/ai-assistants");
  const aiCampaignActive = is("/agency/administrator/ai-campaign");

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-white/90 sm:text-xl">
              Agency · Administrator
            </div>
            <div className="mt-1 text-sm text-white/60"></div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              className={pill(aiAssistantsActive)}
              href="/agency/administrator/ai-assistants"
            >
              AI Assistant
            </Link>

            <Link
              className={pill(accountsActive)}
              href="/agency/administrator/accounts"
            >
              Accounts
            </Link>

            <Link
              className={pill(campaignsActive)}
              href="/agency/administrator/campaigns"
            >
              Campaigns
            </Link>

            <Link
              className={pill(managersActive)}
              href="/agency/administrator/managers"
            >
              Managers
            </Link>

            <Link
              className={pill(aiCampaignActive)}
              href="/agency/administrator/ai-campaign"
            >
              Create AI Campaign
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-6">{children}</div>
      </div>
    </div>
  );
}

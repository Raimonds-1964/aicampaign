// app/(pro)/pro/administrator/_ui/AdminTopBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

// Matches: /pro/administrator/accounts/<accountId>/campaigns[/...]
function isAccountCampaignPath(p: string) {
  return /^\/pro\/administrator\/accounts\/[^/]+\/campaigns(\/|$)/.test(p);
}

export function AdminTopBar() {
  const pathname = usePathname() ?? "";

  const accountsActive =
    pathname === "/pro/administrator" ||
    pathname === "/pro/administrator/accounts" ||
    (pathname.startsWith("/pro/administrator/accounts/") && !isAccountCampaignPath(pathname));

  const campaignsActive =
    pathname === "/pro/administrator/campaigns" ||
    pathname.startsWith("/pro/administrator/campaigns/") ||
    // campaign details under accounts still counts as "Campaigns" (active state only)
    isAccountCampaignPath(pathname);

  const aiCampaignActive =
    pathname === "/pro/administrator/ai-campaign" ||
    pathname.startsWith("/pro/administrator/ai-campaign/");

  const assistantActive =
    pathname === "/pro/administrator/ai-assistant" ||
    pathname.startsWith("/pro/administrator/ai-assistant/");

  return (
    <header className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold text-white/80">Pro · Administrator</div>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          <Link
            href="/pro/administrator/accounts"
            aria-current={accountsActive ? "page" : undefined}
            className={cx(
              "rounded-xl border px-4 py-2 text-sm font-semibold transition",
              accountsActive
                ? "border-white/20 bg-white/90 text-black"
                : "border-white/15 bg-white/5 text-white/90 hover:bg-white/10"
            )}
          >
            Accounts
          </Link>

          {/* ✅ IMPORTANT: always go to the global campaigns list */}
          <Link
            href="/pro/administrator/campaigns"
            aria-current={campaignsActive ? "page" : undefined}
            className={cx(
              "rounded-xl border px-4 py-2 text-sm font-semibold transition",
              campaignsActive
                ? "border-white/20 bg-white/90 text-black"
                : "border-white/15 bg-white/5 text-white/90 hover:bg-white/10"
            )}
          >
            Campaigns
          </Link>

          <Link
            href="/pro/administrator/ai-campaign"
            aria-current={aiCampaignActive ? "page" : undefined}
            className={cx(
              "rounded-xl border px-4 py-2 text-sm font-semibold transition",
              aiCampaignActive
                ? "border-white/20 bg-white/90 text-black"
                : "border-white/15 bg-white/5 text-white/90 hover:bg-white/10"
            )}
          >
            Create AI Campaign
          </Link>

          <Link
            href="/pro/administrator/ai-assistant"
            aria-current={assistantActive ? "page" : undefined}
            className={cx(
              "rounded-xl border px-4 py-2 text-sm font-semibold transition",
              assistantActive
                ? "border-white/20 bg-white/90 text-black"
                : "border-white/15 bg-white/5 text-white/90 hover:bg-white/10"
            )}
          >
            AI Assistant
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default AdminTopBar;

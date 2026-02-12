"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
};

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

// Matches: /pro/administrator/accounts/<accountId>/campaigns[/...]
function isAccountCampaignPath(p: string) {
  return /^\/pro\/administrator\/accounts\/[^/]+\/campaigns(\/|$)/.test(p);
}

export function AdminTopBar() {
  const pathname = usePathname() ?? "";

  const nav: NavItem[] = [
    {
      label: "Accounts",
      href: "/pro/administrator/accounts",
      isActive: (p) => {
        // Accounts is active in the accounts section, but NOT on campaign routes under an account
        if (isAccountCampaignPath(p)) return false;

        return (
          p === "/pro/administrator" ||
          p === "/pro/administrator/accounts" ||
          p.startsWith("/pro/administrator/accounts/")
        );
      },
    },
    {
      label: "Campaigns",
      href: "/pro/administrator/campaigns",
      isActive: (p) =>
        p === "/pro/administrator/campaigns" ||
        p.startsWith("/pro/administrator/campaigns/") ||
        // Campaign details living under the account route still count as "Campaigns"
        isAccountCampaignPath(p),
    },
    {
      label: "Create AI Campaign",
      href: "/pro/administrator/ai-campaign",
      isActive: (p) =>
        p === "/pro/administrator/ai-campaign" ||
        p.startsWith("/pro/administrator/ai-campaign/"),
    },
    {
      label: "AI Assistant",
      href: "/pro/administrator/ai-assistant",
      isActive: (p) =>
        p === "/pro/administrator/ai-assistant" ||
        p.startsWith("/pro/administrator/ai-assistant/"),
    },
  ];

  return (
    <header className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/50">
          </div>
          <div className="text-xl font-bold text-white/80">
            Pro · Administrator
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {nav.map((item) => {
            const active = item.isActive(pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "rounded-xl border px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "border-white/20 bg-white/90 text-black"
                    : "border-white/15 bg-white/5 text-white/90 hover:bg-white/10"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default AdminTopBar;

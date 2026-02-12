"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

const pillInactive =
  "rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 transition";

const pillActive =
  "rounded-full border border-white/20 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition";

// ✅ Detects campaign details under /accounts/.../campaigns/...
function isAccountCampaignPath(pathname: string) {
  return /^\/agency\/manager\/accounts\/[^/]+\/campaigns(\/|$)/.test(pathname);
}

export default function ManagerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();

  const managerId = searchParams?.get("managerId") ?? "";

  const tab = useMemo<"campaigns" | "ai-assistant" | "other">(() => {
    // ✅ Campaigns: list + details
    if (
      pathname === "/agency/manager" ||
      pathname === "/agency/manager/" ||
      pathname.startsWith("/agency/manager/campaigns") ||
      isAccountCampaignPath(pathname)
    ) {
      return "campaigns";
    }

    if (pathname.startsWith("/agency/manager/ai-assistant")) {
      return "ai-assistant";
    }

    return "other";
  }, [pathname]);

  const withManagerId = (href: string) => {
    if (!managerId) return href;
    const join = href.includes("?") ? "&" : "?";
    return `${href}${join}managerId=${encodeURIComponent(managerId)}`;
  };

  return (
    <>
      <div className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="min-w-0">
            <div className="text-xl font-semibold text-white/90">
              Agency · Manager
            </div>
            <div className="mt-2 text-sm text-white/55">
              Campaign performance and AI recommendations
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={withManagerId("/agency/manager/campaigns")}
              className={tab === "campaigns" ? pillActive : pillInactive}
            >
              Campaigns
            </Link>

            <Link
              href={withManagerId("/agency/manager/ai-assistant")}
              className={tab === "ai-assistant" ? pillActive : pillInactive}
            >
              AI Assistant
            </Link>
          </div>
        </div>
      </div>

      {children}
    </>
  );
}

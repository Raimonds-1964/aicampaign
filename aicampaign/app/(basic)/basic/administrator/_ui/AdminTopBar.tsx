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

// ✅ atpazīst ceļus: /basic/administrator/konti/<accountId>/kampanas...
function isAccountCampaignPath(pathname: string) {
  return /^\/basic\/administrator\/konti\/[^/]+\/kampanas(\/|$)/.test(pathname);
}

function isActive(pathname: string, href: string) {
  if (href === "/basic/administrator/konti") {
    // ✅ Konti nav aktīvs, ja esam kampaņu sadaļā zem konta
    if (isAccountCampaignPath(pathname)) return false;

    return (
      pathname === "/basic/administrator" ||
      pathname === href ||
      pathname.startsWith("/basic/administrator/konti/")
    );
  }

  if (href === "/basic/administrator/kampanas") {
    return (
      pathname === href ||
      pathname.startsWith("/basic/administrator/kampanas") ||
      // ✅ arī kampaņu detaļas zem konta skaitās “Kampaņas”
      isAccountCampaignPath(pathname) ||
      pathname.includes("/kampanas/")
    );
  }

  if (href === "/basic/ai-kampana") {
    return pathname === href || pathname.startsWith("/basic/ai-kampana");
  }

  if (href === "/basic/administrator/ai-asistents") {
    return (
      pathname === href ||
      pathname.startsWith("/basic/administrator/ai-asistents")
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
    return campaigns.filter((c) => String(c.accountId) === String(accountId)).length;
  }, [campaigns, accountId]);

  const canCreate = campaignCount < limits.maxCampaignsPerAccount;

  const kontiHref = "/basic/administrator/konti";
  const kampanasHref = "/basic/administrator/kampanas";
  const aiKampanaHref = "/basic/ai-kampana";
  const aiAsistentsHref = "/basic/administrator/ai-asistents";

  return (
    <div className={shell}>
      <div className={bar}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold text-white/80">Basic · Administrator</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={kontiHref}
              className={isActive(pathname, kontiHref) ? btnPrimary : btn}
            >
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
  );
}

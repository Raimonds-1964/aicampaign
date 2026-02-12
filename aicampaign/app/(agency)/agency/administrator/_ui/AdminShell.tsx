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

  // ✅ Kampaņu sadaļa jābūt aktīva arī tad, ja esi konta iekšienē kampaņu ceļā:
  // /agency/administrator/konti/[accountId]/kampanas/...
  const isCampaignPath =
    is("/agency/administrator/kampanas") || pathname.includes("/kampanas/");

  const kontiActive = is("/agency/administrator/konti") && !isCampaignPath;
  const kampanasActive = isCampaignPath;

  const managerActive = is("/agency/administrator/manager");
  const aiAssistantsActive = is("/agency/administrator/ai-assistents");
  const aiCampaignActive = is("/agency/administrator/ai-kampana");

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-white/90 sm:text-xl">
              Agency · Administrator
            </div>
            <div className="mt-1 text-sm text-white/60">
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              className={pill(aiAssistantsActive)}
              href="/agency/administrator/ai-assistents"
            >
              AI asistents
            </Link>

            <Link
              className={pill(kontiActive)}
              href="/agency/administrator/konti"
            >
              Konti
            </Link>

            <Link
              className={pill(kampanasActive)}
              href="/agency/administrator/kampanas"
            >
              Kampaņas
            </Link>

            <Link
              className={pill(managerActive)}
              href="/agency/administrator/manager"
            >
              Manager
            </Link>

            <Link
              className={pill(aiCampaignActive)}
              href="/agency/administrator/ai-kampana"
            >
              Izveidot AI kampaņu
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-6">{children}</div>
      </div>
    </div>
  );
}

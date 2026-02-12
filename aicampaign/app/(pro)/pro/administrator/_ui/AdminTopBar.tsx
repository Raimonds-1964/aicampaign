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

// ✅ /pro/administrator/konti/<accountId>/kampanas[/...]
function isAccountCampaignPath(p: string) {
  return /^\/pro\/administrator\/konti\/[^/]+\/kampanas(\/|$)/.test(p);
}

export function AdminTopBar() {
  const pathname = usePathname() || "";

  const nav: NavItem[] = [
    {
      label: "Konti",
      href: "/pro/administrator/konti",
      isActive: (p) => {
        // ✅ Konti ir aktīvs kontu sadaļā, bet NE kampaņu ceļos zem konta
        if (isAccountCampaignPath(p)) return false;

        return (
          p === "/pro/administrator" ||
          p === "/pro/administrator/konti" ||
          p.startsWith("/pro/administrator/konti/")
        );
      },
    },
    {
      label: "Kampaņas",
      href: "/pro/administrator/kampanas",
      isActive: (p) =>
        p === "/pro/administrator/kampanas" ||
        p.startsWith("/pro/administrator/kampanas/") ||
        // ✅ Kampaņu detaļas, kas atrodas zem konta ceļa, skaitās “Kampaņas”
        isAccountCampaignPath(p),
    },
    {
      label: "Izveidot AI kampaņu",
      href: "/pro/administrator/ai-kampana",
      isActive: (p) =>
        p === "/pro/administrator/ai-kampana" ||
        p.startsWith("/pro/administrator/ai-kampana/"),
    },
    {
      label: "AI asistents",
      href: "/pro/administrator/ai-asistents",
      isActive: (p) =>
        p === "/pro/administrator/ai-asistents" ||
        p.startsWith("/pro/administrator/ai-asistents/"),
    },
  ];

  return (
    <header className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/50"></div>
            <div className="text-xl font-bold text-white/80">Pro · Administrator</div>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {nav.map((item) => {
            const active = item.isActive(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
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

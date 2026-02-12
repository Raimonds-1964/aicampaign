"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import AdminTopBarShell from "./AdminTopBarShell";

const baseButton =
  "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10";

const activeButton = "bg-white text-black hover:bg-white";

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const activeSection = pathname?.includes("/basic/administrator/managers")
    ? "managers"
    : "accounts";

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <AdminTopBarShell />

      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Link
            href="/basic/administrator/accounts"
            className={`${baseButton} ${
              activeSection === "accounts" ? activeButton : ""
            }`}
            aria-current={activeSection === "accounts" ? "page" : undefined}
          >
            Accounts
          </Link>

          <Link
            href="/basic/administrator/managers"
            className={`${baseButton} ${
              activeSection === "managers" ? activeButton : ""
            }`}
            aria-current={activeSection === "managers" ? "page" : undefined}
          >
            Managers
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import AdminTopBarShell from "./AdminTopBarShell";

const btn =
  "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 transition";

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";

  const isManagers = pathname.startsWith("/pro/administrator/managers");
  const isAccounts =
    pathname.startsWith("/pro/administrator/accounts") || !isManagers;

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <AdminTopBarShell />

      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Link
            href="/pro/administrator/accounts"
            className={btn}
            aria-current={isAccounts ? "page" : undefined}
          >
            Accounts
          </Link>

          <Link
            href="/pro/administrator/managers"
            className={btn}
            aria-current={isManagers ? "page" : undefined}
          >
            Managers
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}

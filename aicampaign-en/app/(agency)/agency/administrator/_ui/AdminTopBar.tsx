"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type ActiveKey =
  | "accounts"
  | "managers"
  | "ai-campaign"
  | "ai-assistant"
  | "other";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

const pillBase =
  "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition";
const pillOn = "border-white bg-white text-black";
const pillOff =
  "border-white/15 bg-white/5 text-white hover:bg-white/10";

export default function AdminTopBar({ active }: { active?: ActiveKey }) {
  const pathname = usePathname() || "";

  const tab: ActiveKey =
    active ??
    (pathname.startsWith("/agency/administrator/accounts")
      ? "accounts"
      : pathname.startsWith("/agency/administrator/managers")
      ? "managers"
      : pathname.startsWith("/agency/administrator/ai-campaign")
      ? "ai-campaign"
      : pathname.startsWith("/agency/administrator/ai-assistant")
      ? "ai-assistant"
      : "other");

  return (
    <header className="w-full">
      <div className="rounded-2xl border border-white/10 bg-black/70 px-4 py-3 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-lg font-semibold text-white/90 sm:text-xl">
              Agency · Administrator
            </div>
            <div className="mt-1 text-xs text-white/60 sm:text-sm">
              Admin access: account assignment and manager administration
            </div>
          </div>

          <nav className="flex items-center gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] sm:overflow-visible sm:pb-0">
            <Link
              href="/agency/administrator/accounts"
              className={cx(pillBase, tab === "accounts" ? pillOn : pillOff)}
            >
              Accounts
            </Link>

            <Link
              href="/agency/administrator/managers"
              className={cx(pillBase, tab === "managers" ? pillOn : pillOff)}
            >
              Managers
            </Link>

            <Link
              href="/agency/administrator/ai-campaign"
              className={cx(pillBase, tab === "ai-campaign" ? pillOn : pillOff)}
            >
              Create AI Campaign
            </Link>

            <Link
              href="/agency/administrator/ai-assistant"
              className={cx(pillBase, tab === "ai-assistant" ? pillOn : pillOff)}
            >
              AI Assistant
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

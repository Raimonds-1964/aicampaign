"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type ActiveKey = "konti" | "manager" | "ai-kampana" | "ai-assistents" | "other";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

const pillBase = "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition";
const pillOn = "border-white bg-white text-black";
const pillOff = "border-white/15 bg-white/5 text-white hover:bg-white/10";

export default function AdminTopBar({ active }: { active?: ActiveKey }) {
  const pathname = usePathname() || "";

  const tab: ActiveKey =
    active ??
    (pathname.startsWith("/agency/administrator/konti")
      ? "konti"
      : pathname.startsWith("/agency/administrator/manager")
      ? "manager"
      : pathname.startsWith("/agency/administrator/ai-kampana")
      ? "ai-kampana"
      : pathname.startsWith("/agency/administrator/ai-assistents")
      ? "ai-assistents"
      : "other");

  return (
    <header className="w-full">
      <div className="rounded-2xl border border-white/10 bg-black/70 px-4 py-3 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-lg font-semibold text-white/90 sm:text-xl">Agency · Administrator</div>
            <div className="mt-1 text-xs text-white/60 sm:text-sm">
              Super menedžeris: kontu piešķiršana un menedžeru pārvaldība
            </div>
          </div>

          <nav className="flex items-center gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] sm:overflow-visible sm:pb-0">
            <Link
              href="/agency/administrator/konti"
              className={cx(pillBase, tab === "konti" ? pillOn : pillOff)}
            >
              Konti
            </Link>

            <Link
              href="/agency/administrator/manager"
              className={cx(pillBase, tab === "manager" ? pillOn : pillOff)}
            >
              Manager
            </Link>

            <Link
              href="/agency/administrator/ai-kampana"
              className={cx(pillBase, tab === "ai-kampana" ? pillOn : pillOff)}
            >
              Izveidot AI kampaņu
            </Link>

            {/* ✅ ŠEIT bija 404 — tagad ceļš sakrīt ar mapes nosaukumu `ai-assistents` */}
            <Link
              href="/agency/administrator/ai-assistents"
              className={cx(pillBase, tab === "ai-assistents" ? pillOn : pillOff)}
            >
              AI asistents
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

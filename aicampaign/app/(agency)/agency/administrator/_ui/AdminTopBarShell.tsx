"use client";

import { usePathname } from "next/navigation";
import AdminTopBar, { type ActiveKey } from "./AdminTopBar";

export default function AdminTopBarShell() {
  const p = usePathname() || "";

  const active: ActiveKey =
    p.startsWith("/agency/administrator/konti")
      ? "konti"
      : p.startsWith("/agency/administrator/manager")
      ? "manager"
      : p.startsWith("/agency/administrator/ai-kampana")
      ? "ai-kampana"
      : p.startsWith("/agency/administrator/ai-assistents")
      ? "ai-assistents"
      : "other";

  return (
    <div className="sticky top-3 z-40 mx-auto w-full max-w-6xl px-4">
      <AdminTopBar active={active} />
    </div>
  );
}

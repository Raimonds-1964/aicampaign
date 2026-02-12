"use client";

import { usePathname } from "next/navigation";
import AdminTopBar, { type ActiveKey } from "./AdminTopBar";

export default function AdminTopBarShell() {
  const p = usePathname() || "";

  const active: ActiveKey =
    p.startsWith("/agency/administrator/accounts")
      ? "accounts"
      : p.startsWith("/agency/administrator/managers")
      ? "managers"
      : p.startsWith("/agency/administrator/ai-campaign")
      ? "ai-campaign"
      : p.startsWith("/agency/administrator/ai-assistant")
      ? "ai-assistant"
      : "other";

  return (
    <div className="sticky top-3 z-40 mx-auto w-full max-w-6xl px-4">
      <AdminTopBar active={active} />
    </div>
  );
}

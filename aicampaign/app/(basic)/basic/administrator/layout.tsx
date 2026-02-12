import type { ReactNode } from "react";
import AdminTopBarShell from "./_ui/AdminTopBarShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-black text-white">
      {/* ✅ Sticky TopBar vienmēr redzams */}
      <div className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur">
        <AdminTopBarShell />
      </div>

      {/* Content (tas pats max-w kā TopBar) */}
      <main className="mx-auto w-full max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
}

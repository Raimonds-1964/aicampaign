import type { ReactNode } from "react";
import { TopBar } from "@/app/components/TopBar";
import { Footer } from "@/app/components/Footer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-white text-slate-900">
      {/* Fixed TopBar: always visible */}
      <div className="fixed left-0 top-0 z-50 w-full bg-white/80 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-4">
          <TopBar />
        </div>
      </div>

      {/* Spacer to prevent content from sliding under the TopBar
          (adjusted to pt-6 + pb-4 above) */}
      <div className="h-[124px]" />

      {/* Content */}
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        {children}
      </main>

      {/* Footer */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-10">
        <Footer />
      </div>
    </div>
  );
}

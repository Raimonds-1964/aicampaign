"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { TopBar } from "@/app/components/TopBar";
import { Footer } from "@/app/components/Footer";

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch for TopBar (client-only behavior)
  useEffect(() => setMounted(true), []);

  // Routes that should NOT show the public chrome (TopBar / Footer)
  const disableChrome = useMemo(
    () =>
      pathname.startsWith("/agency") ||
      pathname.startsWith("/pro") ||
      pathname.startsWith("/basic") ||
      pathname.startsWith("/easy") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/ai-campaign"),
    [pathname]
  );

  // Background strategy:
  // - Public site → white background
  // - App / plans / dashboards → dark background
  //   (prevents white flash during transitions)
  if (disableChrome) {
    return (
      <div className="min-h-screen w-full bg-black text-white">
        {children}
      </div>
    );
  }

  // Height reserved for the fixed TopBar.
  // If TopBar height changes, adjust this value.
  const spacerHeight = 86;

  return (
    <div className="min-h-screen w-full bg-white text-slate-900">
      {/* Fixed TopBar */}
      <div className="fixed left-0 top-0 z-50 w-full bg-white/80 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4 pt-4 pb-3">
          {mounted ? (
            <TopBar />
          ) : (
            // Skeleton placeholder to avoid layout shift on first paint
            <div
              aria-hidden="true"
              style={{
                height: 62,
                borderRadius: 22,
                background: "#f8fafc",
                border: "1px solid #eef2f7",
              }}
            />
          )}
        </div>
      </div>

      {/* Spacer below the fixed TopBar */}
      <div style={{ height: spacerHeight }} />

      {/* Main content */}
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-6">
        <Footer />
      </div>
    </div>
  );
}

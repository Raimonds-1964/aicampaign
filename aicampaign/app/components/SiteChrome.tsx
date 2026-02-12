"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { TopBar } from "@/app/components/TopBar";
import { Footer } from "@/app/components/Footer";

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // maršruti, kuriem nav publiskais "chrome" (TopBar/Footer)
  const disableChrome = useMemo(
    () =>
      pathname.startsWith("/agency") ||
      pathname.startsWith("/pro") ||
      pathname.startsWith("/basic") ||
      pathname.startsWith("/easy") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/ai-kampana"),
    [pathname]
  );

  // ✅ Šeit definējam "plānu" fonu:
  // Publiska daļa = balta.
  // Agency/Pro/Dashboard u.c. = tumša (lai nav baltais flash).
  if (disableChrome) {
    return (
      <div className="min-h-screen w-full bg-black text-white">
        {children}
      </div>
    );
  }

  // ✅ topbar outer wrapper ~ (pt-4 pb-3) + topbar box itself
  // Ja maini TopBar augstumu, te var pielāgot.
  const spacerHeight = 86;

  return (
    <div className="min-h-screen w-full bg-white text-slate-900">
      <div className="fixed left-0 top-0 z-50 w-full bg-white/80 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4 pt-4 pb-3">
          {mounted ? (
            <TopBar />
          ) : (
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

      {/* Spacer zem TopBar */}
      <div style={{ height: spacerHeight }} />

      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>

      <div className="mx-auto w-full max-w-6xl px-4 pb-6">
        <Footer />
      </div>
    </div>
  );
}

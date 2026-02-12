"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { TopBar } from "@/app/components/TopBar";
import { Footer } from "@/app/components/Footer";

export default function ChromeClient({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // If you adjust TopBar height, update this spacer.
  const spacerHeight = 86;

  return (
    <div className="min-h-screen w-full bg-white text-slate-900">
      {/* Fixed TopBar */}
      <div className="fixed left-0 top-0 z-50 w-full bg-white/80 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-3">
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

      {/* Spacer under fixed TopBar */}
      <div style={{ height: spacerHeight }} />

      <main className="mx-auto w-full max-w-6xl px-4 py-10">{children}</main>

      <div className="mx-auto w-full max-w-6xl px-4 pb-10">
        <Footer />
      </div>
    </div>
  );
}

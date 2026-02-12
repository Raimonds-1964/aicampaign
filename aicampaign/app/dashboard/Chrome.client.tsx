"use client";

import type { ReactNode } from "react";
import { TopBar } from "@/app/components/TopBar";
import { Footer } from "@/app/components/Footer";

export default function ChromeClient({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-white text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6">
        <TopBar />
      </div>

      <main className="mx-auto w-full max-w-6xl px-4 py-10">{children}</main>

      <div className="mx-auto w-full max-w-6xl px-4 pb-10">
        <Footer />
      </div>
    </div>
  );
}

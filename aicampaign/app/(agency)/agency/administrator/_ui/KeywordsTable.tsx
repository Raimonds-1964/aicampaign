"use client";

import { useEffect, useMemo, useState } from "react";
import type { KeywordRow } from "../_data/store";

function pct(v: number) {
  // drošībai pret NaN
  const n = Number(v);
  if (!Number.isFinite(n)) return "0%";
  return `${Math.round(n * 100)}%`;
}

export default function KeywordsTable({ rows }: { rows: KeywordRow[] }) {
  /**
   * FIX: Hydration mismatch
   * Serveris var uzrenderēt vienu rows stāvokli, bet pārlūks pēc store-hydrate/redraw uzreiz citu.
   * Tāpēc tabulu zīmējam tikai pēc mount (klientā).
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const safeRows = useMemo(() => rows ?? [], [rows]);

  if (!mounted) {
    // Lai saglabātos layout (un nerautos UI), ieliekam vieglu skeleton blokā
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5">
        <div className="p-4 text-sm text-white/50">Ielādē atslēgvārdus…</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5">
      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="text-white/60">
            <tr className="border-b border-white/10">
              <th className="px-4 py-3">Atslēgvārds</th>
              <th className="px-4 py-3">1. lapa</th>
              <th className="px-4 py-3">TOP</th>
              <th className="px-4 py-3">Clicks</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">Piezīme</th>
            </tr>
          </thead>

          <tbody className="text-white/80">
            {safeRows.map((r, i) => (
              <tr
                // Labāk par key={i}: stabils key samazina “nepareizu diff”
                key={(r as any)?.id ?? r.keyword ?? i}
                className="border-b border-white/5 last:border-b-0"
              >
                <td className="px-4 py-3">{r.keyword}</td>
                <td className="px-4 py-3">{pct((r as any).page1 ?? (r as any).page ?? 0)}</td>
                <td className="px-4 py-3">{pct((r as any).top ?? 0)}</td>
                <td className="px-4 py-3">{(r as any).clicks ?? 0}</td>
                <td className="px-4 py-3">
                  {Number((r as any).cost ?? 0).toFixed(2)} $
                </td>
                <td className="px-4 py-3 text-white/60">{(r as any).note ?? "-"}</td>
              </tr>
            ))}

            {safeRows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-white/50" colSpan={6}>
                  Nav datu.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

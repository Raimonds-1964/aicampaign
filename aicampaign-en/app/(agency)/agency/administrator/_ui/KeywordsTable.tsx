"use client";

import { useEffect, useMemo, useState } from "react";
import type { KeywordRow } from "../_data/store";

function pct(v: number) {
  // Guard against NaN
  const n = Number(v);
  if (!Number.isFinite(n)) return "0%";
  return `${Math.round(n * 100)}%`;
}

export default function KeywordsTable({ rows }: { rows: KeywordRow[] }) {
  /**
   * FIX: hydration mismatch
   * The server can render one rows state, but the browser may immediately re-render
   * after store hydration. So we render the table only after mount (client-side).
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const safeRows = useMemo(() => rows ?? [], [rows]);

  if (!mounted) {
    // Keep layout stable (avoid UI jump) with a lightweight skeleton block
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5">
        <div className="p-4 text-sm text-white/50">Loading keywords…</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5">
      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="text-white/60">
            <tr className="border-b border-white/10">
              <th className="px-4 py-3">Keyword</th>
              <th className="px-4 py-3">Top of page rate</th>
              <th className="px-4 py-3">Abs. top of page rate</th>
              <th className="px-4 py-3">Clicks</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>

          <tbody className="text-white/80">
            {safeRows.map((r, i) => (
              <tr
                // Prefer stable keys over key={i} to reduce incorrect diffs
                key={(r as any)?.id ?? r.keyword ?? i}
                className="border-b border-white/5 last:border-b-0"
              >
                <td className="px-4 py-3">{r.keyword}</td>
                <td className="px-4 py-3">{pct((r as any).page1 ?? (r as any).page ?? 0)}</td>
                <td className="px-4 py-3">{pct((r as any).top ?? 0)}</td>
                <td className="px-4 py-3">{(r as any).clicks ?? 0}</td>
                <td className="px-4 py-3">
                  ${Number((r as any).cost ?? 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-white/60">{(r as any).note ?? "-"}</td>
              </tr>
            ))}

            {safeRows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-white/50" colSpan={6}>
                  No data available.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

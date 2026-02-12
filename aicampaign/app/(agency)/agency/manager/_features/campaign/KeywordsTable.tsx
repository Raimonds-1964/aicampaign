"use client";

import React from "react";
import type { KeywordRow } from "../../_data/accounts";

function pct(n: number) {
  const v = Math.max(0, Math.min(100, n));
  return `${Math.round(v)}%`;
}

// Paraugam: parādām keyword formātu atkarībā no rindas indeksa
function formatKeyword(k: string, i: number) {
  if (i % 3 === 0) return `[${k}]`;
  if (i % 3 === 1) return `"${k}"`;
  return k;
}

export default function KeywordsTable({ rows }: { rows: KeywordRow[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full border-separate border-spacing-0">
          <thead className="sticky top-0">
            <tr className="bg-black/40">
              <th className="sticky top-0 px-3 py-2 text-left text-xs font-semibold text-white/70 border-b border-white/10">
                Atslēgvārds
              </th>
              <th className="sticky top-0 px-3 py-2 text-left text-xs font-semibold text-white/70 border-b border-white/10">
                1. lapa
              </th>
              <th className="sticky top-0 px-3 py-2 text-left text-xs font-semibold text-white/70 border-b border-white/10">
                TOP
              </th>
              <th className="sticky top-0 px-3 py-2 text-left text-xs font-semibold text-white/70 border-b border-white/10">
                Clicks
              </th>
              <th className="sticky top-0 px-3 py-2 text-left text-xs font-semibold text-white/70 border-b border-white/10">
                Cost
              </th>
              <th className="sticky top-0 px-3 py-2 text-left text-xs font-semibold text-white/70 border-b border-white/10">
                Piezīme
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-white/10">
                <td className="px-3 py-2 text-sm text-white/85 whitespace-nowrap">
                  {formatKeyword(r.keyword, i)}
                </td>
                <td className="px-3 py-2 text-sm text-white/85">{pct(r.page1)}</td>
                <td className="px-3 py-2 text-sm text-white/85">{pct(r.top)}</td>
                <td className="px-3 py-2 text-sm text-white/85">{r.clicks}</td>
                <td className="px-3 py-2 text-sm text-white/85">{r.cost.toFixed(2)} $</td>
                <td className="px-3 py-2 text-sm text-white/70">{r.note ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 text-xs text-white/50">Mobilajā: velc tabulu pa labi/kreisi.</div>
    </div>
  );
}

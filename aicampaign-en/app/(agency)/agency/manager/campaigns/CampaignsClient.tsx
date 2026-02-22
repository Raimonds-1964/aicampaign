"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  useManagerStore,
  managerSelectors,
} from "@/app/(agency)/agency/manager/_data/store";
import type { Campaign } from "@/app/(agency)/agency/shared/_data/agencyStore";

const card =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm overflow-hidden";
const input =
  "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20";
const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function budgetPct(spent: number, budget: number) {
  if (!budget || budget <= 0) return 0;
  return clamp((spent / budget) * 100, 0, 999);
}
function pctPillClass(pct: number) {
  if (pct < 50) return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  if (pct < 80) return "border-yellow-400/30 bg-yellow-400/10 text-yellow-200";
  return "border-red-400/30 bg-red-400/10 text-red-200";
}
function healthDotClass(health: Campaign["health"]) {
  if (health === "ok") return "bg-emerald-400/80";
  if (health === "warning") return "bg-yellow-400/80";
  return "bg-red-400/80";
}

type MeOk = {
  ok: true;
  user: { id: string; email: string };
  member: {
    id: string;
    role: "ADMIN" | "MANAGER";
    displayName: string | null;
    workspaceId: string;
    workspaceName: string | null;
  };
};

type MeErr = { ok?: false; error: string; details?: unknown };
type MeResp = MeOk | MeErr;

function isOk(x: MeResp | null): x is MeOk {
  return !!x && (x as any).ok === true;
}

export default function Client() {
  const s = useManagerStore();
  const [me, setMe] = useState<MeResp | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/agency/me", { cache: "no-store" });
        const data = (await r.json()) as MeResp;
        if (!alive) return;
        setMe(data);
      } catch (e) {
        if (!alive) return;
        setMe({ error: "ME_FETCH_FAILED", details: String(e) });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ja nav member -> nav piekļuves
  if (me && !isOk(me)) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
          <div className="text-xl font-semibold">Nav piekļuves manager panelim</div>
          <div className="mt-2 text-white/60">
            Kļūda: <span className="font-mono">{me.error}</span>
          </div>
        </div>
      </div>
    );
  }

  const memberId = isOk(me) ? me.member.id : "";
  const headerName = isOk(me) ? me.member.displayName || me.user.email : "";

  const all = useMemo(() => managerSelectors.campaigns(s) as any[], [s]);

  const mine = useMemo(() => {
    if (!memberId) return [];
    const query = q.trim().toLowerCase();
    return all
      .filter((c) => String(c.ownerId) === String(memberId))
      .filter((c) => {
        if (!query) return true;
        return (
          String(c.name ?? "").toLowerCase().includes(query) ||
          String(c.id ?? "").toLowerCase().includes(query)
        );
      });
  }, [all, memberId, q]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-6">
        <div className="text-3xl font-semibold text-white">Campaigns</div>
        <div className="mt-1 text-sm text-white/60">Tu redzi tikai savas kampaņas.</div>
        <div className="mt-2 text-sm text-white/45">
          Active: <span className="text-white/70">{headerName}</span>
        </div>
      </div>

      <div className={card}>
        <div className="border-b border-white/10 p-4">
          <div className="text-sm font-semibold text-white/90">Campaign list</div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="w-full max-w-md">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search campaigns by name or ID…"
                className={input}
              />
            </div>
            <div className="text-sm text-white/50">
              Total: <span className="font-semibold text-white/80">{mine.length}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full text-left text-sm">
            <thead className="text-white/60">
              <tr className="border-b border-white/10">
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Budget</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="text-white/85">
              {mine.map((c: any) => {
                const pct = budgetPct(Number(c.spentToday), Number(c.dailyBudget));
                const accountId = String(c.accountId ?? "");
                const detailsHref = `/agency/manager/accounts/${encodeURIComponent(
                  accountId
                )}/campaigns/${encodeURIComponent(c.id)}`;

                return (
                  <tr key={c.id} className="border-b border-white/5 last:border-b-0">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-white/95">{c.name}</div>
                      <div className="mt-1 font-mono text-xs text-white/45">{c.id}</div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={
                          "inline-flex h-3 w-3 rounded-full shadow-sm ring-1 ring-white/10 " +
                          healthDotClass(c.health)
                        }
                      />
                    </td>

                    <td className="px-4 py-4 text-right">
                      <span
                        className={
                          "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold " +
                          pctPillClass(pct)
                        }
                      >
                        {pct.toFixed(0)}%
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Link className={btn} href={detailsHref}>
                          Open details →
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {mine.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-white/50" colSpan={4}>
                    Nav piešķirtu kampaņu.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
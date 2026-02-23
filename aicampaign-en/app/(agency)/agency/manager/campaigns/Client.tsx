"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  useManagerStore,
  managerSelectors,
  type Campaign,
} from "@/app/(agency)/agency/manager/_data/store";

const card =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm overflow-hidden";
const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35";
const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition";
const btnDisabled =
  "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/35 cursor-not-allowed opacity-70 opacity-70";
const pillBase =
  "inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold";

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
  return "border-red-400/30 bg-red-400/10 text-red-400/10 text-red-200";
}

function healthDotClass(health: Campaign["health"]) {
  if (health === "ok") return "bg-emerald-400/20 border-emerald-400/35";
  if (health === "warning") return "bg-yellow-400/20 border-yellow-400/35";
  return "bg-red-400/20 border-red-400/35";
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
type MeResponse = MeOk | MeErr;

function isOkMe(x: MeResponse | null): x is MeOk {
  return !!x && (x as any).ok === true;
}

export default function Client() {
  const s = useManagerStore();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/agency/me", { cache: "no-store" });
        const data = (await r.json()) as MeResponse;
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

  if (me && !isOkMe(me)) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
          <div className="text-xl font-semibold">Nav piekļuves manager panelim</div>
          <div className="mt-2 text-white/60">
            Kļūda: <span className="font-mono">{me.error}</span>
          </div>
          <div className="mt-4 text-white/60">
            Ja tev jābūt managerim, atver invite linku un pieņem to ar pareizo Google kontu.
          </div>
        </div>
      </div>
    );
  }

  const memberId = isOkMe(me) ? me.member.id : null;
  const headerName = isOkMe(me) ? me.member.displayName || me.user.email : "Manager";

  const all = useMemo(() => managerSelectors.campaigns(s) as any[], [s]);

  const mine = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!memberId) return [];
    return all
      .filter((c) => String(c.ownerId) === String(memberId))
      .filter((c) => {
        if (!query) return true;
        return (
          String(c.name).toLowerCase().includes(query) ||
          String(c.id).toLowerCase().includes(query)
        );
      });
  }, [all, memberId, q]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-2">
        <div className="text-sm text-white/60">Campaigns</div>
        <div className="mt-1 text-2xl font-semibold text-white">Campaigns</div>
        <div className="mt-1 text-white/60">Tu redzi tikai savas kampaņas.</div>
        <div className="mt-2 text-sm text-white/45">
          Active: <span className="text-white/80">{headerName}</span>
        </div>
      </div>

      <div className={card}>
        <div className="border-b border-white/10 p-5">
          <div className="text-base font-semibold text-white">Campaign list</div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              className={input}
              placeholder="Search campaigns by name or ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <div className="md:col-span-2 text-sm text-white/50 md:justify-self-end md:self-center">
              Total: <span className="font-semibold text-white/80">{mine.length}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="text-white/60">
              <tr className="border-b border-white/10">
                <th className="px-5 py-3">Campaign</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Budget</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="text-white/85">
              {mine.map((c: any) => {
                const pct = budgetPct(Number(c.spentToday), Number(c.dailyBudget));
                const pctText = `${pct.toFixed(0)}%`;

                const accountId: string = c.accountId;
                const detailsHref = `/agency/manager/accounts/${encodeURIComponent(
                  accountId
                )}/campaigns/${encodeURIComponent(c.id)}`;

                const googleAdsHref: string | null =
                  (c.googleAdsUrl as string | undefined) ?? null;

                return (
                  <tr key={c.id} className="border-b border-white/5 last:border-b-0">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="mt-1 font-mono text-xs text-white/45">{c.id}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={"inline-block h-6 w-6 rounded-full border " + healthDotClass(c.health)}
                        title={c.health}
                        aria-label={c.health}
                      />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span className={pillBase + " " + pctPillClass(pct)}>{pctText}</span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link className={btn} href={detailsHref}>
                          Open details →
                        </Link>

                        {googleAdsHref ? (
                          <a
                            className={btn}
                            href={googleAdsHref}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View in Google Ads ↗
                          </a>
                        ) : (
                          <button
                            type="button"
                            className={btnDisabled}
                            disabled
                            title="A Google Ads deep link will be available once the API is connected."
                          >
                            View in Google Ads ↗
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {mine.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-white/60" colSpan={4}>
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
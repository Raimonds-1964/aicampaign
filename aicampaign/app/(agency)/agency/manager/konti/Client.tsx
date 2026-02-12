"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useManagerStore, managerSelectors } from "../_data/store";
import type { Campaign } from "@/app/(agency)/agency/shared/_data/agencyStore";

const card =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm overflow-hidden";
const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10";
const input =
  "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20";

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

function googleAdsCampaignUrl(campaignId: string) {
  // Demo – vēlāk aizstāsi ar īsto URL/ deep linku
  return `https://ads.google.com/aw/overview?campaign=${encodeURIComponent(campaignId)}`;
}

export default function Client() {
  const s = useManagerStore();
  const router = useRouter();
  const sp = useSearchParams();

  const managers = useMemo(() => managerSelectors.managers(s), [s]);

  const managerIdFromUrl = sp.get("managerId") ?? "";

  const candidates = useMemo(() => {
    return new Set<string>(managers.map((m) => m.id));
  }, [managers]);

  // izvēlamies sākotnējo managerId: URL -> localStorage -> pirmais
  const [activeManagerId, setActiveManagerId] = useState<string>(() => {
    if (managerIdFromUrl && candidates.has(managerIdFromUrl)) return managerIdFromUrl;

    if (typeof window !== "undefined") {
      const fromLs = window.localStorage.getItem("managerId") ?? "";
      if (fromLs && candidates.has(fromLs)) return fromLs;
    }

    return managers[0]?.id ?? "";
  });

  // ja mainās managers vai URL, sinhronizējam
  useEffect(() => {
    if (!managers.length) return;

    // ja URL dod derīgu managerId, tam ir prioritāte
    if (managerIdFromUrl && candidates.has(managerIdFromUrl)) {
      if (activeManagerId !== managerIdFromUrl) setActiveManagerId(managerIdFromUrl);
      return;
    }

    // ja pašreizējais vairs neeksistē, pārslēdzam uz pirmo
    if (activeManagerId && candidates.has(activeManagerId)) return;

    setActiveManagerId(managers[0]?.id ?? "");
  }, [managers, managerIdFromUrl, candidates, activeManagerId]);

  // saglabājam izvēli
  useEffect(() => {
    if (!activeManagerId) return;
    try {
      window.localStorage.setItem("managerId", activeManagerId);
    } catch {}
  }, [activeManagerId]);

  // UI
  const [q, setQ] = useState("");

  const allCampaigns = useMemo(() => managerSelectors.campaigns(s) as Array<any>, [s]);

  const myCampaigns = useMemo(() => {
    if (!activeManagerId) return [];
    return allCampaigns.filter((c) => c.ownerId === activeManagerId);
  }, [allCampaigns, activeManagerId]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return myCampaigns;
    return myCampaigns.filter((c) => {
      const name = String(c.name ?? "").toLowerCase();
      const id = String(c.id ?? "").toLowerCase();
      return name.includes(query) || id.includes(query);
    });
  }, [myCampaigns, q]);

  function onChangeManager(nextId: string) {
    setActiveManagerId(nextId);
    router.replace(`/agency/manager/konti?managerId=${encodeURIComponent(nextId)}`);
  }

  const activeManagerName = useMemo(() => {
    return managers.find((m) => m.id === activeManagerId)?.name ?? "";
  }, [managers, activeManagerId]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-3xl font-semibold text-white">Kampaņas</div>
          <div className="mt-1 text-sm text-white/60">
            Manager skats (demo): redzi tikai sev piešķirtās kampaņas.
          </div>
        </div>

        {/* demo “Skaties kā manager” */}
        <div className="flex flex-col items-end gap-2">
          <div className="text-xs text-white/45">Skaties kā manager</div>

          <select
            value={activeManagerId}
            onChange={(e) => onChangeManager(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
          >
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.id})
              </option>
            ))}
          </select>

          {activeManagerId ? (
            <div className="text-xs text-white/45">
              Aktīvais: <span className="text-white/70">{activeManagerName}</span>
            </div>
          ) : (
            <div className="text-xs text-white/45">Nav manager (demo dati nav ielādēti)</div>
          )}
        </div>
      </div>

      <div className={card + " mt-6"}>
        <div className="border-b border-white/10 p-4">
          <div className="text-sm font-semibold text-white/90">Kampaņu saraksts</div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="w-full max-w-md">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Meklēt kampaņu pēc nosaukuma vai ID…"
                className={input}
              />
            </div>

            <div className="text-sm text-white/50">
              Kopā: <span className="font-semibold text-white/80">{filtered.length}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full text-left text-sm">
            <thead className="text-white/60">
              <tr className="border-b border-white/10">
                <th className="px-4 py-3">Kampaņa</th>
                <th className="px-4 py-3">Statuss</th>
                <th className="px-4 py-3 text-right">Budžets</th>
                <th className="px-4 py-3 text-right">Darbības</th>
              </tr>
            </thead>

            <tbody className="text-white/85">
              {filtered.map((c: any) => {
                const pct = budgetPct(Number(c.spentToday), Number(c.dailyBudget));
                const pctText = `${pct.toFixed(0)}%`;
                const accountId = String(c.accountId ?? "");
                const detailsHref = `/agency/manager/konti/${encodeURIComponent(
                  accountId
                )}/kampanas/${encodeURIComponent(c.id)}?managerId=${encodeURIComponent(activeManagerId)}`;

                return (
                  <tr key={c.id} className="border-b border-white/5 last:border-b-0">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-white/95">{c.name}</div>
                      <div className="mt-1 font-mono text-xs text-white/45">{c.id}</div>
                    </td>

                    {/* ✅ tikai krāsains simbols */}
                    <td className="px-4 py-4">
                      <span
                        className={
                          "inline-flex h-3 w-3 rounded-full shadow-sm ring-1 ring-white/10 " +
                          healthDotClass(c.health)
                        }
                        title={c.health}
                        aria-label={c.health}
                      />
                    </td>

                    {/* ✅ tikai % */}
                    <td className="px-4 py-4 text-right">
                      <span
                        className={
                          "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold " +
                          pctPillClass(pct)
                        }
                        title={`${Number(c.spentToday).toFixed(2)} / ${Number(c.dailyBudget).toFixed(2)} $`}
                      >
                        {pctText}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Link className={btn} href={detailsHref}>
                          Atvērt detaļas →
                        </Link>

                        <a
                          className={btn}
                          href={googleAdsCampaignUrl(String(c.id))}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Atvērt Google Ads ↗
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-white/50" colSpan={4}>
                    Nav piešķirtu kampaņu šim manager. Piešķir Admin panelī.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="border-t border-white/10 px-4 py-3 text-xs text-white/40">
          Padoms: vari meklēt pēc nosaukuma vai ID.
        </div>
      </div>
    </div>
  );
}

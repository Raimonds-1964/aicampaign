"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  useAdminStore,
  adminSelectors,
  adminActions,
  ADMIN_OWNER_ID,
  type Manager,
} from "@/app/(agency)/agency/administrator/_data/store";

const card =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm overflow-hidden";
const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition";
const btnDisabled =
  "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/35 cursor-not-allowed opacity-70";
const select =
  "w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none";

const pillBase =
  "inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function budgetPct(spent: number, budget: number) {
  const b = Number(budget || 0);
  const s = Number(spent || 0);
  if (!b || b <= 0) return 0;
  return clamp((s / b) * 100, 0, 999);
}

function pctPillClass(pct: number) {
  if (pct < 50) return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  if (pct < 80) return "border-yellow-400/30 bg-yellow-400/10 text-yellow-200";
  return "border-red-400/30 bg-red-400/10 text-red-200";
}

function statusDotClass(health: "ok" | "warning" | "critical") {
  if (health === "ok") return "bg-emerald-400/20 border-emerald-400/40";
  if (health === "warning") return "bg-yellow-400/20 border-yellow-400/40";
  return "bg-red-400/20 border-red-400/40";
}

function StatusDot({ health }: { health: "ok" | "warning" | "critical" }) {
  return (
    <span
      className={
        "inline-flex h-7 w-7 items-center justify-center rounded-full border " +
        statusDotClass(health)
      }
      title={health}
      aria-label={health}
    />
  );
}

function BudgetPill({ spentToday, dailyBudget }: { spentToday: number; dailyBudget: number }) {
  const pct = budgetPct(spentToday, dailyBudget);
  return <span className={pillBase + " " + pctPillClass(pct)}>{pct.toFixed(0)}%</span>;
}

export default function Client() {
  const params = useParams<{ managerId: string }>();
  const managerId = params?.managerId || "";

  const s = useAdminStore();

  // ✅ FIX: managers ir tipēts, lai map() param nav any
  const managers = useMemo(() => adminSelectors.managers(s) as Manager[], [s]);

  const isAdminProfile = managerId === ADMIN_OWNER_ID;

  const manager = useMemo(
    () => adminSelectors.managerById(s, managerId),
    [s, managerId]
  );

  const title = isAdminProfile ? "Administrator" : manager?.name ?? "Nezināms manager";

  const assignedCampaigns = useMemo(() => {
    if (!managerId) return [];
    return adminSelectors.campaignsByManager(s, managerId);
  }, [s, managerId]);

  const freeCampaigns = useMemo(() => adminSelectors.freeCampaigns(s), [s]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-white/60">Profils</div>
          <div className="mt-1 text-5xl font-semibold text-white">{title}</div>

          <div className="mt-2 text-white/70">
            {isAdminProfile ? (
              <>
                Brīvās kampaņas:{" "}
                <span className="font-semibold text-white">{freeCampaigns.length}</span>
              </>
            ) : (
              <>
                Piešķirtās kampaņas:{" "}
                <span className="font-semibold text-white">{assignedCampaigns.length}</span>
              </>
            )}
          </div>
        </div>

        <Link className={btn} href="/agency/administrator/manager">
          Atpakaļ
        </Link>
      </div>

      {/* ==================== Assigned campaigns ==================== */}
      <div className={card}>
        <div className="border-b border-white/10 p-5">
          <div className="text-base font-semibold text-white">
            {isAdminProfile ? "Administrator kampaņas" : "Piešķirtās kampaņas"}
          </div>
          <div className="mt-1 text-sm text-white/55">
            {isAdminProfile
              ? "Šeit ir kampaņas, kas paliek pie Administrator (nav piešķirtas manageriem)."
              : "Spied “Noņemt”, lai kampaņa pārietu uz Admin brīvajām kampaņām."}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="text-white/60">
              <tr className="border-b border-white/10">
                <th className="px-5 py-3">Kampaņa</th>
                <th className="px-5 py-3">Statuss</th>
                <th className="px-5 py-3 text-right">Budžets</th>
                <th className="px-5 py-3 text-right">Darbības</th>
              </tr>
            </thead>

            <tbody className="text-white/85">
              {assignedCampaigns.map((c: any) => {
                const googleAdsHref: string | null = c.googleAdsUrl ?? null;

                return (
                  <tr key={c.id} className="border-b border-white/5 last:border-b-0">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="mt-1 font-mono text-xs text-white/45">{c.id}</div>
                    </td>

                    {/* ✅ tikai ikona */}
                    <td className="px-5 py-4">
                      <StatusDot health={c.health} />
                    </td>

                    {/* ✅ tikai % */}
                    <td className="px-5 py-4 text-right">
                      <BudgetPill spentToday={c.spentToday} dailyBudget={c.dailyBudget} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          className={btn}
                          href={`/agency/administrator/konti/${c.accountId}/kampanas/${c.id}`}
                        >
                          Detaļas →
                        </Link>

                        {googleAdsHref ? (
                          <a
                            className={btn}
                            href={googleAdsHref}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Skatīt Google Ads ↗
                          </a>
                        ) : (
                          <button
                            className={btnDisabled}
                            type="button"
                            disabled
                            title="Google Ads links būs pieejams, kad pieslēgsim API"
                          >
                            Skatīt Google Ads ↗
                          </button>
                        )}

                        {!isAdminProfile ? (
                          <button
                            className={btn}
                            type="button"
                            onClick={() => adminActions.removeCampaignFromManager(c.id)}
                          >
                            Noņemt
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {assignedCampaigns.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-white/60" colSpan={4}>
                    Nav kampaņu šajā profilā.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== Free campaigns (ONLY on Administrator profile) ==================== */}
      {isAdminProfile ? (
        <>
          <div className="h-6" />

          <div className={card}>
            <div className="border-b border-white/10 p-5">
              <div className="text-base font-semibold text-white">
                Brīvās kampaņas (Admin pool)
              </div>
              <div className="mt-1 text-sm text-white/55">
                Piešķir kampaņu managerim ar dropdown.
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-left text-sm">
                <thead className="text-white/60">
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3">Kampaņa</th>
                    <th className="px-5 py-3">Piešķirt manager</th>
                    <th className="px-5 py-3 text-right">Budžets</th>
                    <th className="px-5 py-3 text-right">Darbības</th>
                  </tr>
                </thead>

                <tbody className="text-white/85">
                  {freeCampaigns.map((c: any) => {
                    const googleAdsHref: string | null = c.googleAdsUrl ?? null;

                    return (
                      <tr key={c.id} className="border-b border-white/5 last:border-b-0">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-white">{c.name}</div>
                          <div className="mt-1 font-mono text-xs text-white/45">{c.id}</div>
                        </td>

                        <td className="px-5 py-4">
                          <select
                            className={select}
                            value={c.ownerId}
                            onChange={(e) => adminActions.assignCampaign(c.id, e.target.value)}
                          >
                            <option value={ADMIN_OWNER_ID}>Administrator</option>
                            {managers.map((m: Manager) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>

                          <div className="mt-2 text-xs text-white/45">
                            Izvēlies manager, lai piešķirtu.
                          </div>
                        </td>

                        {/* ✅ tikai % */}
                        <td className="px-5 py-4 text-right">
                          <BudgetPill spentToday={c.spentToday} dailyBudget={c.dailyBudget} />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              className={btn}
                              href={`/agency/administrator/konti/${c.accountId}/kampanas/${c.id}`}
                            >
                              Detaļas →
                            </Link>

                            {googleAdsHref ? (
                              <a
                                className={btn}
                                href={googleAdsHref}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Skatīt Google Ads ↗
                              </a>
                            ) : (
                              <button
                                className={btnDisabled}
                                type="button"
                                disabled
                                title="Google Ads links būs pieejams, kad pieslēgsim API"
                              >
                                Skatīt Google Ads ↗
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {freeCampaigns.length === 0 ? (
                    <tr>
                      <td className="px-5 py-10 text-white/60" colSpan={4}>
                        Nav brīvu kampaņu.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 text-xs text-white/45">
              Šis ir Admin pool — kampaņas, kas nav piešķirtas nevienam manager.
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

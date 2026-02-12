"use client";

import { useMemo, useState } from "react";
import {
  useAdminStore,
  adminSelectors,
  adminActions,
} from "@/app/(agency)/agency/administrator/_data/store";

const card =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm overflow-hidden";

const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition";

const btnPrimary =
  "rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition";

const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35";

export default function Client() {
  const s = useAdminStore();

  const accounts = useMemo(() => adminSelectors.accounts(s), [s]);

  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return accounts;

    return accounts.filter((a: any) => {
      const name = String(a?.name ?? "").toLowerCase();
      const id = String(a?.id ?? "").toLowerCase();
      return name.includes(query) || id.includes(query);
    });
  }, [accounts, q]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-2xl font-semibold text-white/90">Konti</div>
          <div className="mt-2 text-white/60">
            Admin skats: kontu pārvaldība
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className={btn}
            type="button"
            onClick={() => adminActions.addOwnAccount()}
          >
            Pievienot savu kontu
          </button>

          <button
            className={btnPrimary}
            type="button"
            onClick={() => adminActions.addAiAccount()}
          >
            Pievienot AI kontu
          </button>
        </div>
      </div>

      <div className={card}>
        <div className="border-b border-white/10 p-5">
          <div className="text-base font-semibold text-white/90">Kontu saraksts</div>

          <div className="mt-3">
            <input
              className={input}
              placeholder="Meklēt kontu pēc nosaukuma vai ID numura..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="text-white/60">
              <tr className="border-b border-white/10">
                <th className="px-5 py-3">Konts</th>
                <th className="px-5 py-3">Kampaņas</th>
                <th className="px-5 py-3 text-right">Darbības</th>
              </tr>
            </thead>

            <tbody className="text-white/85">
              {filtered.map((a: any) => {
                const campaignCount = Array.isArray(a?.campaigns)
                  ? a.campaigns.length
                  : 0;

                return (
                  <tr
                    key={a.id}
                    className="border-b border-white/5 last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white/90">{a.name}</div>
                      <div className="mt-1 font-mono text-xs text-white/45">
                        {a.id}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-white/85">
                        {campaignCount}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {/* Demo: vēlāk ieliksi īsto konta URL no API */}
                        <a
                          className={btn}
                          href="https://ads.google.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Skatīt Google Ads ↗
                        </a>

                        {/* ✅ Noņemta poga "Kampaņas →" */}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-white/60" colSpan={3}>
                    Nekas netika atrasts.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 text-xs text-white/45">
          Padoms: vari meklēt pēc nosaukuma vai ID.
        </div>
      </div>
    </div>
  );
}

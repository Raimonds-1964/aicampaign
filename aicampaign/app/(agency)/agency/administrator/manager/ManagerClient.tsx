"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
const btnDanger =
  "rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-400/15 transition";
const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35";

function openManagerView(managerId: string) {
  const target = `/agency/manager/kampanas?managerId=${encodeURIComponent(managerId)}`;
  // ✅ Atver reālu lapu (nevis about:blank), kas uzreiz pāradresē uz target
  const jump = `/agency/manager/open?to=${encodeURIComponent(target)}`;
  window.open(jump, "_blank", "noopener,noreferrer");
}

export default function ManagerClient() {
  const s = useAdminStore();

  const managers = useMemo(() => adminSelectors.managers(s), [s]);

  const freeCampaignsCount = useMemo(
    () => adminSelectors.freeCampaigns(s).length,
    [s]
  );

  const campaignCountByManager = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of managers) {
      map.set(m.id, adminSelectors.accountCountByManager(s, m.id));
    }
    return map;
  }, [s, managers]);

  const [newManagerName, setNewManagerName] = useState("");
  const [impersonateOpen, setImpersonateOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-2xl font-semibold text-white">Manager</div>
          <div className="mt-2 text-white/60">
            Administrator profils + visu manager saraksts.
          </div>
        </div>

        <button
          className={btn}
          type="button"
          onClick={() => setImpersonateOpen(true)}
        >
          Skatīt kā
        </button>
      </div>

      {/* ===================== Administrator card ===================== */}
      <div className={card}>
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-white/55">Administrator</div>
            <div className="mt-1 text-2xl font-semibold text-white">
              Administrator
            </div>
            <div className="mt-2 text-white/70">
              Brīvās kampaņas:{" "}
              <span className="font-semibold text-white">
                {freeCampaignsCount}
              </span>
            </div>
          </div>

          <Link className={btn} href="/agency/administrator/manager/admin">
            Atvērt
          </Link>
        </div>
      </div>

      <div className="h-6" />

      {/* ===================== Add manager ===================== */}
      <div className={card}>
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-semibold text-white">
              Pievienot jaunu manager
            </div>
            <div className="mt-1 text-white/55">
              Ievadi vārdu un spied “Pievienot”.
            </div>
          </div>

          <div className="flex w-full max-w-xl items-center gap-3">
            <input
              className={input}
              placeholder="Manager vārds"
              value={newManagerName}
              onChange={(e) => setNewManagerName(e.target.value)}
            />
            <button
              className={btn}
              type="button"
              onClick={() => {
                const created = adminActions.addManager(newManagerName);
                if (created) setNewManagerName("");
              }}
            >
              Pievienot
            </button>
          </div>
        </div>
      </div>

      <div className="h-6" />

      {/* ===================== Managers table ===================== */}
      <div className={card}>
        <div className="border-b border-white/10 p-6">
          <div className="text-lg font-semibold text-white">Visi manager</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="text-white/60">
              <tr className="border-b border-white/10">
                <th className="px-6 py-4">Vārds</th>
                <th className="px-6 py-4">Kampaņu skaits</th>
                <th className="px-6 py-4 text-right">Darbības</th>
              </tr>
            </thead>

            <tbody className="text-white/85">
              {managers.map((m: Manager) => (
                <tr
                  key={m.id}
                  className="border-b border-white/5 last:border-b-0"
                >
                  <td className="px-6 py-5">
                    <div className="font-semibold text-white">{m.name}</div>
                    <div className="mt-1 font-mono text-xs text-white/45">
                      {m.id}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className="font-semibold text-white">
                      {campaignCountByManager.get(m.id) ?? 0}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <Link
                        className={btn}
                        href={`/agency/administrator/manager/${m.id}`}
                      >
                        Atvērt
                      </Link>

                      <button
                        className={btn}
                        type="button"
                        onClick={() => openManagerView(m.id)}
                      >
                        Skatīt kā ↗
                      </button>

                      <button
                        className={btnDanger}
                        type="button"
                        onClick={() => adminActions.deleteManager(m.id)}
                      >
                        Dzēst
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {managers.length === 0 ? (
                <tr>
                  <td className="px-6 py-10 text-white/60" colSpan={3}>
                    Nav manager.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 text-xs text-white/45">
          “Dzēst” pārvieto visas manager kampaņas pie Administrator (Admin pool).
        </div>
      </div>

      {/* ===================== Skatīt kā (modal) ===================== */}
      {impersonateOpen ? (
        <div className="fixed inset-0 z-[80]">
          <button
            className="absolute inset-0 bg-black/70"
            aria-label="Aizvērt"
            onClick={() => setImpersonateOpen(false)}
          />

          <div
            className="absolute left-1/2 top-1/2 w-[min(720px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f16] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <div className="text-base font-semibold text-white">Skatīt kā</div>
                <div className="text-sm text-white/60">
                  Atvērs manager kampaņu skatu jaunā logā.
                </div>
              </div>

              <button
                className={btn}
                type="button"
                onClick={() => setImpersonateOpen(false)}
              >
                Aizvērt
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto p-4">
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-white/10 bg-white/5 p-3 text-left text-white/90 hover:bg-white/10"
                  onClick={() => {
                    openManagerView(ADMIN_OWNER_ID);
                    setImpersonateOpen(false);
                  }}
                >
                  <div className="font-semibold">Administrator</div>
                  <div className="text-xs text-white/50">
                    Atvērs manager paneli ar admin skatījumu
                  </div>
                </button>

                {managers.map((m: Manager) => (
                  <button
                    key={m.id}
                    type="button"
                    className="rounded-xl border border-white/10 bg-white/5 p-3 text-left text-white/90 hover:bg-white/10"
                    onClick={() => {
                      openManagerView(m.id);
                      setImpersonateOpen(false);
                    }}
                  >
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-xs text-white/50">Manager ID: {m.id}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

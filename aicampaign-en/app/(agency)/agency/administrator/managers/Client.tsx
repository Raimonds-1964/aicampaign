"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  useAdminStore,
  adminSelectors,
  ADMIN_OWNER_ID,
  type Manager,
} from "@/app/(agency)/agency/administrator/_data/store";

const card =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm overflow-hidden";
const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition";
const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35";

function openManagerView(managerId: string) {
  const url = `/agency/manager/accounts?managerId=${encodeURIComponent(managerId)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function Client() {
  const s = useAdminStore();
  const managers = useMemo(() => adminSelectors.managers(s), [s]);

  const [q, setQ] = useState("");
  const [impersonateOpen, setImpersonateOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return managers;
    return managers.filter(
      (m: Manager) =>
        m.name.toLowerCase().includes(query) || m.id.toLowerCase().includes(query)
    );
  }, [managers, q]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-4xl font-semibold text-white">Managers</div>
          <div className="mt-2 text-white/60">
            Admin view: manage managers and open their view (“View as”).
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className={btn} type="button" onClick={() => setImpersonateOpen(true)}>
            View as
          </button>

          <Link className={btn} href="/agency/administrator/accounts">
            Accounts →
          </Link>

          <Link className={btn} href="/agency/administrator/campaigns">
            Campaigns →
          </Link>
        </div>
      </div>

      <div className={card}>
        <div className="border-b border-white/10 p-5">
          <div className="text-base font-semibold text-white">Manager list</div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              className={input}
              placeholder="Search by name or ID..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <div className="text-sm text-white/50 md:justify-self-end md:self-center">
              Total: <span className="font-semibold text-white/80">{filtered.length}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="text-white/60">
              <tr className="border-b border-white/10">
                <th className="px-5 py-3">Manager</th>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="text-white/85">
              {filtered.map((m: Manager) => (
                <tr key={m.id} className="border-b border-white/5 last:border-b-0">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white">{m.name}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-white/65">{m.id}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button className={btn} type="button" onClick={() => openManagerView(m.id)}>
                        View as →
                      </button>

                      <Link className={btn} href={`/agency/administrator/managers/${encodeURIComponent(m.id)}`}>
                        Profile →
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-white/60" colSpan={3}>
                    No results found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 text-xs text-white/45">
          “View as” opens the manager dashboard in a new window with <code>?managerId=...</code>.
        </div>
      </div>

      {/* ===================== View as (modal) ===================== */}
      {impersonateOpen ? (
        <div className="fixed inset-0 z-[80]">
          <button
            className="absolute inset-0 bg-black/70"
            aria-label="Close"
            onClick={() => setImpersonateOpen(false)}
          />

          <div
            className="absolute left-1/2 top-1/2 w-[min(720px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f16] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <div className="text-base font-semibold text-white">View as</div>
                <div className="text-sm text-white/60">
                  This will open the manager dashboard in a new window.
                </div>
              </div>

              <button className={btn} type="button" onClick={() => setImpersonateOpen(false)}>
                Close
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
                  <div className="text-xs text-white/50">Admin view inside the manager dashboard</div>
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

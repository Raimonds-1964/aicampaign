"use client";

import { useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";

import {
  useAgencyStore,
  agencySelectors,
  type Manager,
} from "@/app/(agency)/agency/shared/_data/agencyStore";

export default function Client() {
  const s = useAgencyStore();
  const params = useParams<{ managerId: string }>();
  const sp = useSearchParams();

  // managerId: vispirms URL segment, ja nav tad query, ja nav tad tukšs
  const managerId =
    params?.managerId ?? sp?.get("managerId") ?? "";

  // ✅ FIX: agencySelectors nav managerById, tāpēc ņemam no managers()
  const managerName = useMemo(() => {
    const managers = agencySelectors.managers(s) as Manager[];
    return managers.find((m) => m.id === managerId)?.name ?? "Manager";
  }, [s, managerId]);

  // Atstāju minimāli: kontu saraksts ir no store
  const accounts = useMemo(() => {
    return agencySelectors.accounts(s);
  }, [s]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="text-sm text-white/60">Agency · Manager</div>
      <div className="mt-2 text-4xl font-semibold text-white">
        Konti
      </div>
      <div className="mt-2 text-white/60">
        Skats: <span className="text-white/85 font-semibold">{managerName}</span>{" "}
        <span className="text-white/40">({managerId || "—"})</span>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-white/80">
        <div className="text-white/60 text-sm">
          Šis ir demo “konti” ekrāns. Kontu saraksts:
        </div>

        <div className="mt-4 space-y-2">
          {accounts.map((a: any) => (
            <div
              key={a.id}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
            >
              <div className="font-semibold text-white">{a.name}</div>
              <div className="mt-1 font-mono text-xs text-white/45">{a.id}</div>
            </div>
          ))}

          {accounts.length === 0 ? (
            <div className="text-white/55">Nav kontu.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

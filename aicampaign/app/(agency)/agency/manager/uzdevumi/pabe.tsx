"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SectionHeader from "../_ui/SectionHeader";
import { deleteTask, getTasks, setTaskDone, type Task } from "../_data/tasks";

function sevChip(sev?: string) {
  if (sev === "critical") return "bg-red-500/15 text-red-300 border-red-500/30";
  if (sev === "warning") return "bg-yellow-500/15 text-yellow-300 border-yellow-500/30";
  return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
}

export default function Page() {
  const [items, setItems] = useState<Task[]>([]);

  useEffect(() => {
    setItems(getTasks());
  }, []);

  const open = useMemo(() => items.filter((t) => (t as any).status !== "done"), [items]);
  const done = useMemo(() => items.filter((t) => (t as any).status === "done"), [items]);

  const refresh = () => setItems(getTasks());

  return (
    <div>
      <SectionHeader title="Uzdevumi" backHref="/agency/manager" />

      <div className="space-y-6">
        <div>
          <div className="mb-2 text-sm font-semibold text-white/85">Atvērti</div>
          {open.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Nav atvērtu uzdevumu.
            </div>
          ) : (
            <div className="space-y-3">
              {open.map((t: any) => (
                <div key={t.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white/90">{t.title}</div>
                      {t.description ? (
                        <div className="mt-1 text-sm text-white/75">{t.description}</div>
                      ) : null}

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/60">
                        {t.meta?.accountId ? <span>Konts: {t.meta.accountId}</span> : null}
                        {t.meta?.campaignId ? <span>· Kampaņa: {t.meta.campaignId}</span> : null}
                        {t.meta?.checkKey ? <span>· Parametrs: {t.meta.checkKey}</span> : null}
                        {(t as any).severity ? (
                          <span className={`ml-2 inline-flex rounded-full border px-2 py-0.5 ${sevChip((t as any).severity)}`}>
                            {(t as any).severity}
                          </span>
                        ) : null}
                      </div>

                      {t.meta?.accountId && t.meta?.campaignId ? (
                        <div className="mt-2">
                          <Link
                            className="text-sm text-white/85 underline hover:text-white"
                            href={`/agency/manager/konti/${t.meta.accountId}/kampanas/${t.meta.campaignId}`}
                          >
                            Atvērt kampaņas detaļas →
                          </Link>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setTaskDone(t.id);
                          refresh();
                        }}
                        className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15"
                      >
                        Atzīmēt kā izdarītu
                      </button>
                      <button
                        onClick={() => {
                          deleteTask(t.id);
                          refresh();
                        }}
                        className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/85 hover:bg-white/10"
                      >
                        Dzēst
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 text-sm font-semibold text-white/85">Izpildīti</div>
          {done.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Nav izpildītu uzdevumu.
            </div>
          ) : (
            <div className="space-y-3">
              {done.map((t: any) => (
                <div key={t.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 opacity-75">
                  <div className="text-sm font-semibold text-white/90">{t.title}</div>
                  {t.description ? <div className="mt-1 text-sm text-white/75">{t.description}</div> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

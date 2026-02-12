"use client";

import React, { useMemo, useState } from "react";

type Preset = "yesterday" | "last7" | "last30" | "custom";
type Format = "pdf" | "csv" | "xlsx";

function iso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export default function ReportModal({
  open,
  onClose,
  campaignName,
}: {
  open: boolean;
  onClose: () => void;
  campaignName: string;
}) {
  const today = useMemo(() => new Date(), []);
  const [preset, setPreset] = useState<Preset>("last7");

  const [from, setFrom] = useState<string>(iso(addDays(today, -7)));
  const [to, setTo] = useState<string>(iso(today));

  const [format, setFormat] = useState<Format>("pdf");

  // grupas + apakšparametri (mock)
  const groups = useMemo(
    () => [
      {
        title: "Kampaņas",
        items: ["Budžets", "Statuss", "Redzamība", "Izdevumi", "Klikšķi"],
      },
      {
        title: "Atslēgvārdi",
        items: ["TOP %", "1. lapa %", "CTR", "CPC", "Search terms"],
      },
      {
        title: "Reklāmas",
        items: ["RSA kvalitāte", "Assets", "CTR", "Konversijas"],
      },
    ],
    []
  );

  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const g of groups) for (const it of g.items) init[`${g.title}:${it}`] = true;
    return init;
  });

  function applyPreset(p: Preset) {
    setPreset(p);
    const t = new Date();
    if (p === "yesterday") {
      const y = addDays(t, -1);
      setFrom(iso(y));
      setTo(iso(y));
      return;
    }
    if (p === "last7") {
      setFrom(iso(addDays(t, -7)));
      setTo(iso(t));
      return;
    }
    if (p === "last30") {
      setFrom(iso(addDays(t, -30)));
      setTo(iso(t));
      return;
    }
    // custom: atstāj esošos datumus
  }

  function onFromChange(v: string) {
    // ja from > to, pabīdam to līdzi
    setFrom(v);
    if (v && to && v > to) setTo(v);
  }

  function onToChange(v: string) {
    setTo(v);
    if (from && v && v < from) setFrom(v);
  }

  function generate() {
    const keys = Object.keys(selected).filter((k) => selected[k]);
    // mock darbība prezentācijai:
    alert(
      `Pārskats izveidots (mock)\n\nKampaņa: ${campaignName}\nPeriods: ${from} → ${to}\nFormāts: ${format}\nParametri: ${keys.length}`
    );
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        aria-label="Aizvērt"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div
        className="absolute left-1/2 top-1/2 w-[min(920px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f16] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="text-base font-semibold text-white/90">
            Izveidot pārskatu: {campaignName}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
          >
            Aizvērt
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto p-4">
          {/* Periods */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white/90">Periods</div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => applyPreset("yesterday")}
                className={`rounded-lg px-3 py-2 text-sm ${
                  preset === "yesterday"
                    ? "bg-white/90 text-black"
                    : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                Vakar
              </button>
              <button
                onClick={() => applyPreset("last7")}
                className={`rounded-lg px-3 py-2 text-sm ${
                  preset === "last7"
                    ? "bg-white/90 text-black"
                    : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                Pēdējās 7 dienas
              </button>
              <button
                onClick={() => applyPreset("last30")}
                className={`rounded-lg px-3 py-2 text-sm ${
                  preset === "last30"
                    ? "bg-white/90 text-black"
                    : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                Pēdējās 30 dienas
              </button>
              <button
                onClick={() => setPreset("custom")}
                className={`rounded-lg px-3 py-2 text-sm ${
                  preset === "custom"
                    ? "bg-white/90 text-black"
                    : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                Savs periods
              </button>
            </div>

            {/* Savs periods: vienkāršs kalendārs ar 2 date inputiem */}
            {preset === "custom" && (
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="text-sm text-white/80">
                  No:
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => onFromChange(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white/90"
                  />
                </label>
                <label className="text-sm text-white/80">
                  Līdz:
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => onToChange(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white/90"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Parametri */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white/90">
              Parametri (atzīmē vajadzīgos)
            </div>

            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
              {groups.map((g) => (
                <div key={g.title} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-sm font-semibold text-white/90">{g.title}</div>
                  <div className="mt-2 space-y-2">
                    {g.items.map((it) => {
                      const k = `${g.title}:${it}`;
                      return (
                        <label key={k} className="flex items-center gap-2 text-sm text-white/80">
                          <input
                            type="checkbox"
                            checked={!!selected[k]}
                            onChange={(e) =>
                              setSelected((s) => ({ ...s, [k]: e.target.checked }))
                            }
                            className="h-4 w-4"
                          />
                          {it}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formāts */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white/90">Formāts</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["pdf", "csv", "xlsx"] as Format[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`rounded-lg px-3 py-2 text-sm uppercase ${
                    format === f
                      ? "bg-white/90 text-black"
                      : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/10 px-4 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Atcelt
          </button>
          <button
            onClick={generate}
            className="rounded-lg bg-white/90 px-3 py-2 text-sm text-black hover:opacity-90"
          >
            Gatavs
          </button>
        </div>
      </div>
    </div>
  );
}

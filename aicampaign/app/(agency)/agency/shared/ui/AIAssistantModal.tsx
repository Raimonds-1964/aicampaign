"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Msg = { role: "user" | "assistant"; text: string };

const overlay = "fixed inset-0 z-[80]";
const card =
  "mx-auto w-full max-w-6xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_0_0_1px_rgba(255,255,255,0.04)]";
const chip =
  "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10";
const inputWrap =
  "flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-5 py-3";
const input =
  "h-10 w-full bg-transparent text-sm font-semibold text-white placeholder:text-white/35 outline-none";
const sendBtn =
  "shrink-0 rounded-full bg-white px-7 py-3 text-sm font-extrabold text-black hover:opacity-90";
const closeBtn =
  "rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white hover:bg-white/10";

function demoAnswer(q: string) {
  const t = q.toLowerCase();

  if (t.includes("cpa")) {
    return [
      "Lai samazinātu CPA:",
      "• Pārbaudi Search Terms un pievieno negatīvos vaicājumus (waste).",
      "• Sašaurini atbilstības tipus (no Broad uz Phrase/Exact) top ad grupām.",
      "• Pārskati konversiju uzskaiti (Primary/Secondary) un atribūciju logus.",
      "• Testē Target CPA ar konservatīvu vērtību 7 dienas (ja pietiek signālu).",
    ].join("\n");
  }

  if (t.includes("ctr")) {
    return [
      "Ja krīt CTR:",
      "• Pārbaudi, vai reklāmas teksts atbilst atslēgvārdiem (message match).",
      "• Uzlabo RSA: vairāk virsrakstu/USP/CTA, mazāk “pinned”.",
      "• Pārskati auditorijas/atslēgvārdus — iespējams par plašu trafiks.",
      "• Testē jaunas reklāmas variācijas (2–3 RSA) 7–14 dienas.",
    ].join("\n");
  }

  if (t.includes("budž") || t.includes("budget") || t.includes("iztērējas")) {
    return [
      "Ja budžets iztērējas pārāk ātri:",
      "• Ierobežo pīķa stundas ar ad schedule.",
      "• Pārbaudi Lost IS (budget) un konkurences CPC pieaugumu.",
      "• Samazini bid korekcijas problemātiskajos laikos/ierīcēs/geo.",
      "• Pārdali budžetu uz segmentiem ar labāku CPA/ROAS.",
    ].join("\n");
  }

  if (t.includes("match") || t.includes("atbilst")) {
    return [
      "Match tipi (īsumā):",
      "• Broad — vairāk apjoma, mazāk kontroles (vajag negatīvos + search terms disciplīnu).",
      "• Phrase — balanss starp apjomu un precizitāti.",
      "• Exact — maksimāla kontrole, mazāks apjoms.",
      "Praktiski: top vaicājumus pārcel uz Phrase/Exact un atstāj Broad tikai testam.",
    ].join("\n");
  }

  return [
    "Uzdod nedaudz precīzāk (piem.: “kampaņā X krīt CTR mobilajā” vai “CPA aug tieši pēc 18:00”).",
    "Ātrie soļi:",
    "• Search Terms + negatīvie",
    "• Match tipu sakārtošana",
    "• Budžeta pārdale pēc CPA/ROAS",
    "• RSA variācijas + landing page match",
  ].join("\n");
}

export default function AIAssistantModal({ open, onClose }: Props) {
  const [q, setQ] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const quick = useMemo(
    () => [
      "Kā samazināt CPA?",
      "Kāpēc krīt CTR?",
      "Ko darīt, ja budžets iztērējas pārāk ātri?",
      "Kā pareizi izvēlēties match tipus?",
    ],
    []
  );

  const canSend = q.trim().length > 0;

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function ask(text: string) {
    const qq = text.trim();
    if (!qq) return;

    const a = demoAnswer(qq);

    setMsgs((prev) => [
      { role: "user", text: qq },
      { role: "assistant", text: a },
      ...prev,
    ]);
    setQ("");
  }

  if (!open) return null;

  return (
    <div className={overlay}>
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Aizvērt"
        onClick={onClose}
      />

      <div className="absolute left-1/2 top-10 w-[min(1200px,calc(100vw-24px))] -translate-x-1/2">
        <div className="mb-4 flex items-center justify-between">
          <div />
          <button type="button" className={closeBtn} onClick={onClose}>
            Aizvērt
          </button>
        </div>

        <div className="mb-6">
          <div className="text-sm text-white/60">Pro / AI asistents</div>
          <h1 className="mt-2 text-5xl font-extrabold tracking-tight text-white">
            AI asistents
          </h1>
          <p className="mt-3 text-lg font-semibold text-white/70">
            Atbild uz jautājumiem par Google Ads (demo). Vēlāk pieslēgsim īsto AI.
          </p>
        </div>

        <div className={card}>
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-3">
              {quick.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={chip}
                  onClick={() => ask(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-6">
              <div className="text-lg font-extrabold text-white/90">
                Uzdod jautājumu par Google Ads.
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className={inputWrap + " w-full"}>
                  <input
                    ref={inputRef}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Uzraksti jautājumu..."
                    className={input}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") ask(q);
                    }}
                  />
                </div>

                <button
                  type="button"
                  className={sendBtn}
                  disabled={!canSend}
                  onClick={() => ask(q)}
                  title={!canSend ? "Ievadi jautājumu" : "Sūtīt"}
                >
                  Sūtīt
                </button>
              </div>

              {msgs.length > 0 ? (
                <div className="mt-8 space-y-4">
                  {msgs.slice(0, 6).map((m, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="text-xs font-semibold text-white/50">
                        {m.role === "user" ? "Jautājums" : "Atbilde"}
                      </div>
                      <div className="mt-2 whitespace-pre-wrap text-sm font-semibold text-white/80">
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs font-semibold text-white/35">
          Demo: atbildes ir sagatavotas. Vēlāk te pieslēgsim reālu AI + konta datus.
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";

type Msg = { id: string; role: "user" | "assistant"; text: string };

const card =
  "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur";
const input =
  "h-11 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white/90 outline-none";
const btn =
  "rounded-2xl bg-white/90 px-4 py-2 text-sm font-extrabold text-black hover:opacity-90";
const chip =
  "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70 hover:bg-white/10";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function demoAnswer(q: string) {
  const s = q.toLowerCase();

  if (s.includes("cpa")) {
    return `Ja CPA ir par augstu: 1) search terms + negatīvie atslēgvārdi, 2) pārliec top vaicājumus uz Phrase/Exact, 3) pārbaudi Primary konversijas un atribūciju, 4) uzlabo landing (message match + ātrums), 5) bidding testē vismaz 7 dienas. (Demo)`;
  }

  if (s.includes("ctr")) {
    return `CTR krīt parasti dēļ neatbilstošiem vaicājumiem vai vājiem RSA: 1) search terms tīrīšana, 2) konkrētāki virsraksti ar USP + atslēgvārdu, 3) saskaņo reklāmu ar landing, 4) sadali ad grupas šaurāk. (Demo)`;
  }

  if (s.includes("budget") || s.includes("budž")) {
    return `Budžets iztērējas pārāk ātri: 1) ad schedule (ierobežo pīķus), 2) samazini bid korekcijas pīķa stundās, 3) pārdali budžetu uz segmentiem ar labāku CPA/ROAS, 4) palielini budžetu pakāpeniski (+10–20%), ja pieprasījums ir stabils. (Demo)`;
  }

  if (s.includes("match")) {
    return `Match tipi: Broad = plaši (vairāk apjoma, vairāk waste), Phrase/Exact = kontrole. Praktiski: Broad tikai ar stingriem negatīvajiem un regulāru search terms uzkopšanu; top vaicājumus pārliec uz Phrase/Exact. (Demo)`;
  }

  return `Uzraksti kampaņas tipu, mērķi (leadi/pirkumi), budžetu, valodu un galveno KPI — iedošu konkrētu rīcības plānu. (Demo)`;
}

export default function Client() {
  const [q, setQ] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: uid(), role: "assistant", text: "Uzdod jautājumu par Google Ads. (Basic AI asistents)" },
  ]);

  const suggestions = useMemo(
    () => ["Kā samazināt CPA?", "Kāpēc krīt CTR?", "Ko darīt ar budžeta pīķiem?", "Kā izvēlēties match tipus?"],
    []
  );

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMsgs((m) => [
      ...m,
      { id: uid(), role: "user", text: trimmed },
      { id: uid(), role: "assistant", text: demoAnswer(trimmed) },
    ]);
    setQ("");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 text-white/90">
      <div className="mb-6">
        <div className="text-sm text-white/60">Basic / AI asistents</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white/90">AI asistents</h1>
        <p className="mt-2 text-sm font-semibold text-white/60">Atbild uz jautājumiem par Google Ads</p>
      </div>

      <div className={card}>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button key={s} type="button" className={chip} onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {msgs.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl border border-white/10 bg-white/10 p-3 text-sm font-semibold text-white/90"
                  : "mr-auto max-w-[85%] rounded-2xl border border-white/10 bg-black/30 p-3 text-sm font-semibold text-white/85"
              }
            >
              {m.text}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Uzraksti jautājumu…"
            className={input}
            onKeyDown={(e) => {
              if (e.key === "Enter") send(q);
            }}
          />
          <button type="button" className={btn} onClick={() => send(q)}>
            Sūtīt
          </button>
        </div>
      </div>
    </div>
  );
}

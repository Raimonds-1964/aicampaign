"use client";

import { useMemo, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const card =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm overflow-hidden";
const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10";
const btnWhite =
  "rounded-xl border border-white bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90";

function answerFor(q: string) {
  const t = q.toLowerCase();

  if (t.includes("budž") || t.includes("budget")) {
    return `Budžeta ieteikumi:
- Pārbaudi, vai dienas limits nav par zemu (lost IS (budget)).
- Ja CPC ir augsts — sašaurini atslēgvārdus, pievieno negatīvos vaicājumus.
- Pārskati grafiku (ad schedule) un ierīces.`;
  }

  if (t.includes("atslēgv") || t.includes("keyword") || t.includes("search term")) {
    return `Atslēgvārdi / Search Terms:
- Pievieno negatīvos vaicājumus, kas atkārtojas un nedod konversijas.
- Sadali broad / phrase / exact, lai kontrolētu trafiku.
- Fokusējies uz 5–20 "core" atslēgvārdiem katrā ad group.`;
  }

  if (t.includes("quality") || t.includes("kvalit")) {
    return `Reklāmu kvalitāte:
- Pielāgo ad copy atslēgvārdiem (relevance).
- Pievieno vairāk sitelinks/callouts/snippets.
- Landing page ātrums + atbilstība (message match).`;
  }

  if (t.includes("landing") || t.includes("lp") || t.includes("lapa")) {
    return `Landing page:
- Saliec virsrakstu tā, lai tas atkārto reklāmas solījumu.
- CTA virs "fold".
- Pārbaudi mobilajā: ātrums un forma.`;
  }

  return `Ātrais ieteikums:
- Sāc ar konta struktūru (kampaņas → ad groups → keywords).
- Pārbaudi Search Terms un pievieno negatīvos.
- Pārskati budžetus un KPI (CPA/ROAS).
Uzdod konkrētāk: “Ko uzlabot kampaņā X?” vai “Kāpēc CPC augsts?”.`;
}

export default function AIAssistantModal({ open, onClose }: Props) {
  const [q, setQ] = useState("");
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);

  const canSend = useMemo(() => q.trim().length > 0, [q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="absolute left-1/2 top-12 w-[min(900px,calc(100vw-24px))] -translate-x-1/2">
        <div className={card}>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-white/90">AI asistents</div>
              <div className="text-xs text-white/50">
                Demo režīms — atbildes ir sagatavotas, bez reāla API.
              </div>
            </div>

            <button className={btn} onClick={onClose} type="button">
              Aizvērt
            </button>
          </div>

          <div className="px-5 py-4">
            <div className="grid gap-3">
              <textarea
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Uzdod jautājumu par Google Ads (piem. “Kā samazināt CPC?”)"
                className="min-h-[90px] w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
              />

              <div className="flex items-center gap-2">
                <button
                  className={btnWhite}
                  type="button"
                  disabled={!canSend}
                  onClick={() => {
                    const qq = q.trim();
                    if (!qq) return;
                    const a = answerFor(qq);
                    setHistory((h) => [{ q: qq, a }, ...h]);
                    setQ("");
                  }}
                >
                  Pajautāt
                </button>

                <button
                  className={btn}
                  type="button"
                  onClick={() => {
                    setHistory([]);
                    setQ("");
                  }}
                >
                  Notīrīt
                </button>
              </div>

              <div className="mt-2 grid gap-3">
                {history.length === 0 && (
                  <div className="text-sm text-white/60">
                    Piemēri: “Ko uzlabot Quality Score?”, “Kā izvēlēties negatīvos
                    atslēgvārdus?”, “Kāpēc budžets iztērējas pārāk ātri?”.
                  </div>
                )}

                {history.map((h, idx) => (
                  <div key={idx} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs text-white/50">Jautājums</div>
                    <div className="text-sm font-medium text-white/90">{h.q}</div>

                    <div className="mt-3 text-xs text-white/50">Atbilde</div>
                    <div className="whitespace-pre-wrap text-sm text-white/80">
                      {h.a}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 px-5 py-3 text-xs text-white/40">
            Tip: vēlāk šeit var pieslēgt īstu LLM + konta datus.
          </div>
        </div>
      </div>
    </div>
  );
}

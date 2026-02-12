"use client";

import { useMemo, useRef, useState } from "react";

const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10";
const chip =
  "rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10 active:scale-[0.99]";

type Msg = { role: "user" | "assistant"; text: string };

function cannedAnswer(q: string): string {
  const t = q.toLowerCase();

  if (t.includes("quality score") || t.includes("kvalit")) {
    return "Quality Score ietekmē CTR, relevanci un landing page pieredzi. Sāc ar atslēgvārdu–reklāmas–LP atbilstību un izslēdz nerelevantus search terms.";
  }
  if (t.includes("search terms") || t.includes("vaic") || t.includes("negat")) {
    return "Skaties Search Terms un pievieno negatīvos atslēgvārdus: zema relevanse, bez pirkšanas intent, konkurentu zīmoli (ja nevajag), 'free', 'jobs' u.c.";
  }
  if (t.includes("budž") || t.includes("budget")) {
    return "Budžetu optimizē pēc konversijām/CPA/ROAS. Ja kampaņa limitēta (Search IS lost by budget), palielini budžetu vai sašaurini mērķēšanu/atslēgvārdus.";
  }
  if (t.includes("pmax") || t.includes("performance max")) {
    return "PMax: sakārto asset group signālus, izmanto audience signals, pievieno brand exclusions (ja vajag), pārbaudi search term insights un konversiju kvalitāti.";
  }
  if (t.includes("ctr")) {
    return "CTR uzlabo ar ciešāku atslēgvārdu grupēšanu, spēcīgākiem RSA virsrakstiem, pielikumiem (assets) un pareizām match type/negatīvajiem.";
  }

  return "Demo AI asistents: uzraksti jautājumu par Google Ads (budžets, search terms, QS, PMax, struktūra, RSA), un es iedošu ieteikumus.";
}

export default function AIAssistantDrawer() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Sveiks! Esmu demo AI asistents Google Ads jautājumiem. Izvēlies piemēru vai uzraksti savu jautājumu.",
    },
  ]);

  const quick = useMemo(
    () => [
      "Kā uzlabot Quality Score?",
      "Ko darīt ar Search Terms un negatīvajiem?",
      "Kā saprast, vai budžets ir par mazu?",
      "Kā uzlabot CTR?",
      "Ko pārbaudīt PMax kampaņā?",
    ],
    []
  );

  function copyToInput(q: string) {
    // ✅ prasība: pogas ir aktīvas un tikai iekopē tekstu inputā
    setInput(q);
    // fokusē + ieliek kursoru beigās
    setTimeout(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      try {
        const len = el.value.length;
        el.setSelectionRange(len, len);
      } catch {
        // ignore
      }
    }, 0);
  }

  function send(text?: string) {
    const question = (text ?? input).trim();
    if (!question) return;

    setMsgs((m) => [
      ...m,
      { role: "user", text: question },
      { role: "assistant", text: cannedAnswer(question) },
    ]);
    setInput("");
  }

  return (
    <>
      <button className={btn} onClick={() => setOpen(true)}>
        AI asistents
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-0 h-full w-full max-w-[520px] border-l border-white/10 bg-black/80 backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-white">AI asistents</div>
                <div className="text-xs text-white/50">Demo režīms (bez API). Jautā par Google Ads.</div>
              </div>

              <button className={btn} onClick={() => setOpen(false)}>
                Aizvērt
              </button>
            </div>

            {/* ✅ Quick questions */}
            <div className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {quick.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className={chip}
                    onClick={() => copyToInput(q)}
                    title="Iekopēt jautājumu"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="h-[calc(100%-180px)] overflow-y-auto px-4 pb-4">
              <div className="space-y-3">
                {msgs.map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.role === "user"
                        ? "ml-auto max-w-[85%] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white"
                        : "mr-auto max-w-[85%] rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/90"
                    }
                  >
                    {m.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-white/10 px-4 py-3">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") send();
                  }}
                  placeholder="Uzdod jautājumu par Google Ads…"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
                />
                <button className={btn} onClick={() => send()}>
                  Sūtīt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

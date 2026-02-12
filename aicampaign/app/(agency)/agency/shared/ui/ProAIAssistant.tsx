"use client";

import { useMemo, useRef, useState } from "react";

type QA = { q: string; a: string };

const shell = "mx-auto w-full max-w-6xl px-4 py-6";
const card =
  "rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur";
const pill =
  "rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 transition";
const inputWrap =
  "flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-4 py-2";
const inputCls =
  "h-10 w-full bg-transparent text-sm font-semibold text-white placeholder:text-white/35 outline-none";
const sendBtn =
  "shrink-0 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-black hover:opacity-90";

function answerFor(q: string, fallback: string) {
  const key = q.trim().toLowerCase();

  const map: Record<string, string> = {
    "kā samazināt cpa?":
      "Ja CPA ir par augstu: 1) Search terms tīrīšana + negatīvie, 2) sašaurini match tipus (Phrase/Exact top vaicājumiem), 3) pārbaudi Primary konversijas un atribūciju, 4) uzlabo landing (message match + ātrums), 5) testē bidding (Target CPA konservatīvi 7+ dienas). (Demo)",
    "kāpēc krīt ctr?":
      "CTR krīt parasti dēļ neatbilstošiem vaicājumiem vai vājiem RSA: 1) search terms, 2) šaurākas ad grupas, 3) vairāk RSA virsrakstu variāciju ar USP, 4) atbilstošs landing + extensions. (Demo)",
    "ko darīt, ja budžets iztērējas pārāk ātri?":
      "Ja budžets iztērējas pārāk ātri: 1) pārbaudi ad schedule (ierobežo pīķa stundas), 2) samazini bid korekcijas dārgajos periodos, 3) pārdali budžetu uz segmentiem ar labāku CPA/ROAS, 4) ja pieprasījums ir stabils – palielini budžetu pakāpeniski (+10–20%). (Demo)",
    "kā pareizi izvēlēties match tipus?":
      "Match tipi: 1) Broad – tikai ar labu negatīvo sarakstu + pietiekamu konversiju signālu, 2) Phrase – labs balanss mērogam, 3) Exact – top vaicājumiem un kontrolei. Praktiski: broad izmanto testiem, top konvertējošos vaicājumus pārvieto uz phrase/exact. (Demo)",
    "kā uzlabot quality score?":
      "Quality Score parasti uzlabo: 1) ciešāka keyword–ad–landing atbilstība, 2) augstāks CTR (USP, RSA variācijas, extensions), 3) labāka landing pieredze (ātrums, content match), 4) tematiskas ad grupas. (Demo)",
    "ko darīt ar search terms un negatīvajiem?":
      "Search terms: 1) atfiltrē waste vaicājumus (bez pirkšanas nodoma), 2) pievieno negatīvos (account/campaign/ad group līmenī), 3) top konvertējošos vaicājumus pārvieto uz Phrase/Exact, 4) regulāri pārskati 1–2x nedēļā. (Demo)",
    "kā saprast, vai budžets ir par mazu?":
      "Budžets ir par mazu, ja: 1) regulāri “Limited by budget”, 2) IS lost (budget) augsts, 3) CPA/ROAS ir labs un vari mērogot, 4) dienas beigās pietrūkst apjoma. Ja veiktspēja laba – palielini pakāpeniski un seko CPA/ROAS. (Demo)",
    "kā uzlabot ctr?":
      "CTR uzlabo: 1) precīzāks keyword targeting (match + negatīvie), 2) labāki RSA virsraksti (USP, skaitļi, CTA), 3) vairāk ad assets (sitelinks, callouts), 4) segmentē ad grupas pa tēmu. (Demo)",
    "ko pārbaudīt pmax kampaņā?":
      "PMax pārbaude: 1) konversijas (Primary) pareizas, 2) asset group kvalitāte (teksti/attēli/video), 3) audience signals, 4) search term insights/brand exclusions, 5) URL expansion, 6) budžets vs rezultāts (CPA/ROAS). (Demo)",
  };

  return map[key] ?? fallback;
}

export default function ProAIAssistant() {
  const quick: string[] = useMemo(
    () => [
      "Kā samazināt CPA?",
      "Kāpēc krīt CTR?",
      "Ko darīt, ja budžets iztērējas pārāk ātri?",
      "Kā pareizi izvēlēties match tipus?",
    ],
    []
  );

  const [messages, setMessages] = useState<QA[]>([]);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  function addQuestion(question: string) {
    const questionTrimmed = question.trim();
    if (!questionTrimmed) return;

    const a = answerFor(
      questionTrimmed,
      "Demo atbilde: uzraksti konkrētāk (kampaņas tips, mērķis, budžets, valsts), un es ieteikšu nākamos soļus. (Demo)"
    );

    setMessages((prev) => [...prev, { q: questionTrimmed, a }]);
  }

  function onSend() {
    addQuestion(q);
    setQ("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <div className={shell}>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white/90">AI asistents</h1>
      <div className="mt-3 text-base font-semibold text-white/70">
        Atbild uz jautājumiem par Google Ads
      </div>

      <div className={card + " mt-8 p-6"}>
        {/* Quick questions */}
        <div className="flex flex-wrap gap-3">
          {quick.map((qq) => (
            <button
              key={qq}
              type="button"
              className={pill}
              onClick={() => {
                setQ(qq);
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              title="Ielikt jautājumu laukā"
            >
              {qq}
            </button>
          ))}
        </div>

        {/* Hint pill */}
        <div className="mt-6 rounded-full border border-white/10 bg-black/25 px-6 py-4 text-base font-bold text-white/85">
          Uzdod jautājumu par Google Ads
        </div>

        {/* Messages */}
        <div className="mt-6 space-y-5">
          {messages.map((m, idx) => (
            <div key={`${m.q}-${idx}`} className="space-y-3">
              <div className="rounded-full border border-white/10 bg-white/5 px-6 py-4 text-lg font-extrabold text-white/90">
                {m.q}
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/25 px-6 py-5 text-base font-semibold leading-relaxed text-white/80">
                {m.a}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="mt-8 flex items-center gap-4">
          <div className={inputWrap + " w-full"}>
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Uzraksti jautājumu..."
              className={inputCls}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSend();
              }}
            />
          </div>

          <button type="button" className={sendBtn} onClick={onSend}>
            Sūtīt
          </button>
        </div>
      </div>
    </div>
  );
}

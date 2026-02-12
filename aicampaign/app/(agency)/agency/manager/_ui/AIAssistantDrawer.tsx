"use client";

import { useMemo, useState } from "react";

export default function AIAssistantDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([
    {
      role: "ai",
      text: "Sveiks! Pajautā man par Google Ads (demo režīms). Piem.: “Ko pārbaudīt katru dienu kampaņā?”",
    },
  ]);

  const canned = useMemo(
    () => [
      {
        match: ["ko pārbaudīt", "katru dienu", "daily"],
        answer:
          "Katru dienu parasti pārbauda: budžeta pacing, search terms, reklāmu kvalitāti/CTR, konversiju tracking, landing page atbilstību un dārgākos atslēgvārdus.",
      },
      {
        match: ["budžets", "pacing", "iztērēts"],
        answer:
          "Ja budžets iztērējas pārāk ātri, samazini bidus, ierobežo stundas, vai pārdali budžetu uz rīt/vēlāku dienas daļu.",
      },
      {
        match: ["search terms", "negatīvie", "vaicājumi"],
        answer:
          "Pārskati search terms un pievieno negatīvos atslēgvārdus. Sāc ar 5–10 acīmredzami neatbilstošiem vaicājumiem.",
      },
    ],
    []
  );

  function answerFor(q: string) {
    const t = q.toLowerCase();
    for (const c of canned) {
      if (c.match.some((m) => t.includes(m))) return c.answer;
    }
    return "Demo atbilde: šobrīd bez API es varu dot tikai vispārīgus ieteikumus. Pajautā konkrētāk (piem. par budžetu, search terms vai reklāmu kvalitāti).";
  }

  function send() {
    const q = input.trim();
    if (!q) return;

    setMessages((m) => [...m, { role: "user", text: q }, { role: "ai", text: answerFor(q) }]);
    setInput("");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      {/* overlay */}
      <button
        className="absolute inset-0 bg-black/60"
        aria-label="Aizvērt"
        onClick={onClose}
      />

      {/* drawer */}
      <div className="absolute right-0 top-0 h-full w-[min(520px,100vw)] border-l border-white/10 bg-[#0b0f16] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="text-base font-semibold text-white/90">AI asistents</div>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
          >
            Aizvērt
          </button>
        </div>

        <div className="flex h-[calc(100%-112px)] flex-col">
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`max-w-[90%] rounded-2xl border px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto border-white/15 bg-white/10 text-white"
                    : "mr-auto border-white/10 bg-white/5 text-white/85"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                placeholder="Uzdod jautājumu par Google Ads…"
                className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
              />
              <button
                onClick={send}
                className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:opacity-90"
              >
                Sūtīt
              </button>
            </div>

            <div className="mt-2 text-xs text-white/40">
              Demo režīms: atbildes ir “hardcoded”.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

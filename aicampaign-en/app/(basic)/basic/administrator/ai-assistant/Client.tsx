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
    return `If CPA is too high: 1) review Search terms + add negative keywords, 2) move top queries to Phrase/Exact, 3) verify Primary conversions and attribution, 4) improve landing page (message match + speed), 5) run bidding tests for at least 7 days. (Demo)`;
  }

  if (s.includes("ctr")) {
    return `CTR drops are usually caused by irrelevant queries or weak RSAs: 1) clean up Search terms, 2) use more specific headlines with your USP + keyword, 3) align ad copy with the landing page, 4) split ad groups tighter. (Demo)`;
  }

  if (s.includes("budget")) {
    return `If your budget is spending too fast: 1) use ad scheduling (limit peak hours), 2) reduce bid adjustments during peak times, 3) shift budget to segments with better CPA/ROAS, 4) scale gradually (+10–20%) if demand is stable. (Demo)`;
  }

  if (s.includes("match")) {
    return `Match types: Broad = more reach (more volume, more waste), Phrase/Exact = more control. Practical tip: use Broad only with strong negatives and regular Search terms cleanup; move proven queries to Phrase/Exact. (Demo)`;
  }

  return `Share your campaign type, goal (leads vs. sales), budget, language, and primary KPI—and I’ll suggest a concrete action plan. (Demo)`;
}

export default function Client() {
  const [q, setQ] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: uid(),
      role: "assistant",
      text: "Ask a question about Google Ads. (Basic AI Assistant)",
    },
  ]);

  const suggestions = useMemo(
    () => [
      "How do I reduce CPA?",
      "Why is my CTR dropping?",
      "What should I do about budget spikes?",
      "How do I choose match types?",
    ],
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
        <div className="text-sm text-white/60">Basic / AI Assistant</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white/90">
          AI Assistant
        </h1>
        <p className="mt-2 text-sm font-semibold text-white/60">
          Answers questions about Google Ads
        </p>
      </div>

      <div className={card}>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className={chip}
              onClick={() => send(s)}
            >
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
            placeholder="Type your question…"
            className={input}
            onKeyDown={(e) => {
              if (e.key === "Enter") send(q);
            }}
          />
          <button type="button" className={btn} onClick={() => send(q)}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

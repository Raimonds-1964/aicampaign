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

  if (s.includes("quality score") || s.includes("quality")) {
    return `To improve Quality Score: (1) align keyword → RSA → landing page (tight message match), (2) clean up Search Terms and add negative keywords, (3) raise CTR with clearer value props and more specific headlines, (4) improve landing page speed and relevance. (Demo)`;
  }

  if (s.includes("cpa") || s.includes("cost per acquisition")) {
    return `If CPA is too high: (1) review Search Terms and add negatives, (2) tighten match types (focus on Phrase/Exact for top queries), (3) verify Primary conversions and attribution, (4) improve landing page conversion rate, (5) test bidding (run Target CPA steadily for 7+ days before judging). (Demo)`;
  }

  if (s.includes("ctr") || s.includes("click-through")) {
    return `CTR usually drops due to mismatched queries or weak RSAs: (1) audit Search Terms, (2) tighten themes/ad groups, (3) add more RSA headline variations with clear USPs, (4) ensure the landing page matches the ad promise. (Demo)`;
  }

  if (s.includes("budget") || s.includes("spend")) {
    return `If your budget is spending too fast: (1) use ad scheduling, (2) reduce exposure during low-performing hours, (3) reallocate budget to segments with the best CPA/ROAS, (4) scale gradually (+10–20%). (Demo)`;
  }

  return `Share a bit more context (campaign type, goal, budget, KPI, landing page), and I’ll outline a concrete action plan. (Demo)`;
}

export default function Client() {
  const [q, setQ] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: uid(), role: "assistant", text: "Ask a question about Google Ads." },
  ]);

  const suggestions = useMemo(
    () => [
      "How can I reduce CPA?",
      "Why is my CTR dropping?",
      "What should I do if my budget is spending too fast?",
      "How do I choose the right match types?",
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
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white/90">
          AI Assistant
        </h1>
        <p className="mt-2 text-sm font-semibold text-white/60">
          Get quick answers and optimization ideas for Google Ads.
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

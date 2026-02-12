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
    "how do i lower cpa?":
      "If CPA is too high: 1) Clean up Search terms (add negatives), 2) tighten match types (move top queries to Phrase/Exact), 3) confirm conversion setup (Primary vs Secondary, attribution), 4) improve landing page message match + speed, 5) test bidding carefully (Target CPA only after you have enough conversion volume). (Demo)",
    "why is ctr dropping?":
      "CTR usually drops due to less relevant queries or weak ad messaging: 1) review Search terms, 2) tighten ad groups, 3) improve RSA assets (more headline variety + strong value props), 4) add/refresh assets (sitelinks, callouts, structured snippets), 5) ensure landing page matches intent. (Demo)",
    "what if my budget spends too fast?":
      "If budget is spending too fast: 1) use an ad schedule to reduce peak hours, 2) reduce bids where CPC spikes (device/geo/time), 3) reallocate budget toward better CPA/ROAS segments, 4) if performance is strong, increase budget gradually (+10–20%) and watch CPA/ROAS. (Demo)",
    "how should i choose match types?":
      "Match types in practice: Broad = scale (needs strong negatives + good conversion signals), Phrase = balanced control, Exact = highest control for top queries. A common approach: test Broad, then move proven converting queries into Phrase/Exact and add negatives to reduce waste. (Demo)",
    "how can i improve quality score?":
      "Quality Score is driven by expected CTR, ad relevance, and landing page experience. Improve it by: 1) tighter keyword–ad–landing alignment, 2) stronger RSAs (clear value props + CTA), 3) better landing page speed + content match, 4) more tightly themed ad groups. (Demo)",
    "what should i do with search terms and negatives?":
      "Search terms workflow: 1) identify waste (low intent / irrelevant), 2) add negatives at the right level (account/campaign/ad group), 3) promote top converting queries into Phrase/Exact keywords, 4) review consistently (1–2x per week). (Demo)",
    "how do i know if my budget is too low?":
      "Budget is likely too low if: 1) you’re frequently Limited by budget, 2) Search Lost IS (budget) is high, 3) CPA/ROAS is strong and you can scale, 4) volume drops late in the day. If efficiency is good, increase budget gradually and monitor CPA/ROAS. (Demo)",
    "how do i improve ctr?":
      "To improve CTR: 1) tighten targeting (match types + negatives), 2) strengthen RSAs (more headline variety, specific value props, numbers, clear CTA), 3) add/refresh assets (sitelinks/callouts), 4) split ad groups by theme to improve message match. (Demo)",
    "what should i check in a pmax campaign?":
      "PMax checklist: 1) conversion setup (Primary goals), 2) asset group quality (text/images/video), 3) audience signals, 4) search term insights + brand controls (where applicable), 5) final URL expansion settings, 6) budget vs results (CPA/ROAS). (Demo)",

    // Back-compat: if someone still clicks Latvian quick buttons
    "kā samazināt cpa?":
      "If CPA is too high: 1) Clean up Search terms (add negatives), 2) tighten match types (move top queries to Phrase/Exact), 3) confirm conversion setup (Primary vs Secondary, attribution), 4) improve landing page message match + speed, 5) test bidding carefully (Target CPA only after you have enough conversion volume). (Demo)",
    "kāpēc krīt ctr?":
      "CTR usually drops due to less relevant queries or weak ad messaging: 1) review Search terms, 2) tighten ad groups, 3) improve RSA assets (more headline variety + strong value props), 4) add/refresh assets (sitelinks, callouts, structured snippets), 5) ensure landing page matches intent. (Demo)",
    "ko darīt, ja budžets iztērējas pārāk ātri?":
      "If budget is spending too fast: 1) use an ad schedule to reduce peak hours, 2) reduce bids where CPC spikes (device/geo/time), 3) reallocate budget toward better CPA/ROAS segments, 4) if performance is strong, increase budget gradually (+10–20%) and watch CPA/ROAS. (Demo)",
    "kā pareizi izvēlēties match tipus?":
      "Match types in practice: Broad = scale (needs strong negatives + good conversion signals), Phrase = balanced control, Exact = highest control for top queries. A common approach: test Broad, then move proven converting queries into Phrase/Exact and add negatives to reduce waste. (Demo)",
  };

  return map[key] ?? fallback;
}

export default function ProAIAssistant() {
  const quick: string[] = useMemo(
    () => [
      "How do I lower CPA?",
      "Why is CTR dropping?",
      "What if my budget spends too fast?",
      "How should I choose match types?",
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
      "Demo answer: share a bit more context (campaign type, goal, daily budget, location) and I’ll suggest next steps using Google Ads best practices. (Demo)"
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
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white/90">
        AI Assistant
      </h1>
      <div className="mt-3 text-base font-semibold text-white/70">
        Answers questions about Google Ads
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
              title="Insert into the input"
            >
              {qq}
            </button>
          ))}
        </div>

        {/* Hint pill */}
        <div className="mt-6 rounded-full border border-white/10 bg-black/25 px-6 py-4 text-base font-bold text-white/85">
          Ask a question about Google Ads
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
              placeholder="Type your question..."
              className={inputCls}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSend();
              }}
            />
          </div>

          <button type="button" className={sendBtn} onClick={onSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

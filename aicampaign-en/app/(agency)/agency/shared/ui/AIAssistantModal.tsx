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
  "shrink-0 rounded-full bg-white px-7 py-3 text-sm font-extrabold text-black hover:opacity-90 disabled:opacity-50";
const closeBtn =
  "rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white hover:bg-white/10";

function demoAnswer(q: string) {
  const t = q.toLowerCase();

  if (t.includes("cpa")) {
    return [
      "To lower CPA:",
      "• Review the Search terms report and add negative keywords to cut wasted spend.",
      "• Tighten match types (move top performers from Broad → Phrase/Exact).",
      "• Validate conversion tracking (Primary vs. Secondary), values, and attribution settings.",
      "• If you have enough volume, test Target CPA with a conservative target for ~7 days before changing again.",
    ].join("\n");
  }

  if (t.includes("ctr")) {
    return [
      "If CTR is dropping:",
      "• Check message match: keywords ↔ RSA headlines ↔ landing page.",
      "• Improve RSAs: add more unique headlines (USPs + clear CTAs) and avoid over-pinning.",
      "• Verify targeting isn’t too broad (match types, audiences, geo, devices).",
      "• Run 2–3 RSA variations and evaluate over 7–14 days (unless volume is very low).",
    ].join("\n");
  }

  if (t.includes("budget") || t.includes("spend too fast") || t.includes("pacing") || t.includes("overspend")) {
    return [
      "If budget spends too fast:",
      "• Use ad scheduling to reduce delivery during low-quality peak hours.",
      "• Review Search Lost IS (budget) and monitor CPC increases from competition.",
      "• Reduce exposure where performance is weak (devices, geos, time-of-day).",
      "• Reallocate budget toward segments with better CPA / ROAS.",
    ].join("\n");
  }

  if (t.includes("match") || t.includes("match type")) {
    return [
      "Match types (quick view):",
      "• Broad — most reach, least control (requires strong negatives + search terms discipline).",
      "• Phrase — balanced reach and precision.",
      "• Exact — highest control, typically lower volume.",
      "Practical approach: move proven queries into Phrase/Exact, and keep Broad only for controlled expansion.",
    ].join("\n");
  }

  return [
    "Ask a bit more specifically (e.g., “CTR dropped on mobile for Campaign X” or “CPA spikes after 6pm”).",
    "Quick checklist:",
    "• Search terms + negatives",
    "• Match type tightening",
    "• Budget allocation by CPA / ROAS",
    "• RSA testing + landing page alignment",
  ].join("\n");
}

export default function AIAssistantModal({ open, onClose }: Props) {
  const [q, setQ] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const quick = useMemo(
    () => [
      "How do I lower CPA?",
      "Why is CTR dropping?",
      "What should I do if my budget spends too fast?",
      "How should I choose match types?",
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
        aria-label="Close"
        onClick={onClose}
      />

      <div className="absolute left-1/2 top-10 w-[min(1200px,calc(100vw-24px))] -translate-x-1/2">
        <div className="mb-4 flex items-center justify-between">
          <div />
          <button type="button" className={closeBtn} onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mb-6">
          <div className="text-sm text-white/60">Pro / AI Assistant</div>
          <h1 className="mt-2 text-5xl font-extrabold tracking-tight text-white">
            AI Assistant
          </h1>
          <p className="mt-3 text-lg font-semibold text-white/70">
            Answers Google Ads questions (demo). We’ll connect a real AI model later.
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
                Ask a Google Ads question.
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className={inputWrap + " w-full"}>
                  <input
                    ref={inputRef}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Type your question..."
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
                  title={!canSend ? "Type a question" : "Send"}
                >
                  Send
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
                        {m.role === "user" ? "Question" : "Answer"}
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
          Demo: responses are pre-written. Later we’ll connect real AI + account data.
        </div>
      </div>
    </div>
  );
}

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
      text: "Hi! Ask me about Google Ads (demo mode). For example: “What should I check daily in a campaign?”",
    },
  ]);

  const canned = useMemo(
    () => [
      {
        match: ["what to check", "daily", "every day", "each day"],
        answer:
          "Daily checks typically include: budget pacing, search terms, ad performance (CTR), conversion tracking, landing page relevance, and high-cost keywords.",
      },
      {
        match: ["budget", "pacing", "spent too fast", "spend too fast"],
        answer:
          "If your budget is spending too quickly, consider lowering bids, tightening targeting, adjusting ad schedule, or reallocating budget to later in the day.",
      },
      {
        match: ["search terms", "negative", "negatives", "queries"],
        answer:
          "Review the Search terms report and add negative keywords. Start with 5–10 clearly irrelevant queries with the highest spend.",
      },
    ],
    []
  );

  function answerFor(q: string) {
    const t = q.toLowerCase();
    for (const c of canned) {
      if (c.match.some((m) => t.includes(m))) return c.answer;
    }
    return "Demo answer: without the Google Ads API connected, I can only provide general guidance. Ask something more specific (e.g., budget pacing, search terms, or ad performance).";
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
      <button className="absolute inset-0 bg-black/60" aria-label="Close" onClick={onClose} />

      {/* drawer */}
      <div className="absolute right-0 top-0 h-full w-[min(520px,100vw)] border-l border-white/10 bg-[#0b0f16] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="text-base font-semibold text-white/90">AI Assistant</div>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
          >
            Close
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
                placeholder="Ask a question about Google Ads…"
                className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
              />
              <button
                onClick={send}
                className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:opacity-90"
              >
                Send
              </button>
            </div>

            <div className="mt-2 text-xs text-white/40">
              Demo mode: responses are hardcoded.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

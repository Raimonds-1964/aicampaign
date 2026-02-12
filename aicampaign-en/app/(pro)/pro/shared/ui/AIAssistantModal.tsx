"use client";

import { useMemo, useState } from "react";

const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10";
const chip =
  "rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10";

type Msg = { role: "user" | "assistant"; text: string };

function cannedAnswer(q: string): string {
  const t = q.toLowerCase();

  if (t.includes("quality score") || t.includes("quality")) {
    return "Quality Score is driven by expected CTR, ad relevance, and landing page experience. Start by tightening keyword → RSA → landing page alignment, then use Search Terms to exclude irrelevant queries with negative keywords.";
  }

  if (t.includes("search terms") || t.includes("query") || t.includes("negative")) {
    return "Review Search Terms regularly and add negative keywords for low relevance, low purchase intent, competitor brands (if not desired), and common waste terms like “free”, “jobs”, “course”, etc.";
  }

  if (t.includes("budget") || t.includes("spend")) {
    return "Optimize budget based on conversions/CPA/ROAS. If you’re budget-limited (Search IS lost to budget), either increase budget or narrow targeting/keywords to focus spend on the best-performing segments.";
  }

  if (t.includes("pmax") || t.includes("performance max")) {
    return "For Performance Max: refine asset group signals, use audience signals thoughtfully, apply brand exclusions (if needed), review Search term insights, and validate conversion quality (primary conversions + attribution).";
  }

  if (t.includes("ctr") || t.includes("click-through")) {
    return "Improve CTR by tightening keyword themes, strengthening RSA headlines with clear USPs, adding assets (sitelinks/callouts/etc.), and using the right match types plus negatives to reduce irrelevant impressions.";
  }

  return "Demo AI Assistant: ask a Google Ads question (budget, Search Terms, Quality Score, PMax, account structure, RSAs) and I’ll share optimization ideas.";
}

export default function AIAssistantDrawer() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Hi! I’m a demo AI Assistant for Google Ads. Ask a question or pick one of the examples below.",
    },
  ]);

  const quick = useMemo(
    () => [
      "How can I improve Quality Score?",
      "What should I do with Search Terms and negative keywords?",
      "How do I tell if my budget is too low?",
      "How can I improve CTR?",
      "What should I review in a Performance Max campaign?",
    ],
    []
  );

  const ask = (q: string) => {
    const question = q.trim();
    if (!question) return;

    setMsgs((m) => [
      ...m,
      { role: "user", text: question },
      { role: "assistant", text: cannedAnswer(question) },
    ]);
  };

  return (
    <>
      <button type="button" className={btn} onClick={() => setOpen(true)}>
        AI Assistant
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-0 h-full w-full max-w-[520px] border-l border-white/10 bg-black/80 backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-white">AI Assistant</div>
                <div className="text-xs text-white/50">
                  Demo mode (no API). Ask about Google Ads.
                </div>
              </div>

              <button
                type="button"
                className={btn}
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {quick.map((q) => (
                  <button
                    type="button"
                    key={q}
                    className={chip}
                    onClick={() => ask(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

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

            <div className="border-t border-white/10 px-4 py-3">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a Google Ads question…"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      ask(input);
                      setInput("");
                    }
                  }}
                />

                <button
                  type="button"
                  className={btn}
                  onClick={() => {
                    ask(input);
                    setInput("");
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

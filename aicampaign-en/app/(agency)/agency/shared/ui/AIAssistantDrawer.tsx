"use client";

import { useMemo, useRef, useState } from "react";

const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10";
const chip =
  "rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10 active:scale-[0.99]";

type Msg = { role: "user" | "assistant"; text: string };

function cannedAnswer(q: string): string {
  const t = q.toLowerCase();

  if (t.includes("quality score")) {
    return (
      "Quality Score is influenced by expected CTR, ad relevance, and landing page experience. " +
      "Start by tightening keyword → ad → landing page alignment, improving RSA messaging, and adding negative keywords to filter irrelevant queries. " +
      "Also review match types and search intent to reduce wasted clicks."
    );
  }

  if (t.includes("search terms") || t.includes("negative") || t.includes("negatives")) {
    return (
      "Review the Search terms report and add negative keywords for low-intent or irrelevant queries (e.g., “free”, “jobs”, “definition”, support requests). " +
      "Watch for broad match leakage, competitor terms (if you’re not targeting them), and mismatched geography. " +
      "Prioritize negatives by spend and poor conversion rate."
    );
  }

  if (t.includes("budget") || t.includes("limited") || t.includes("pacing")) {
    return (
      "Optimize budget based on conversions and target CPA / ROAS. If Search is limited by budget (Search Lost IS (budget)), " +
      "either increase the daily budget or narrow targeting (tighter keywords, negatives, geo, schedule). " +
      "Also check whether the campaign is hitting peak hours too early and consider ad scheduling."
    );
  }

  if (t.includes("pmax") || t.includes("performance max")) {
    return (
      "For Performance Max: strengthen asset groups (high-quality creatives + variety), add audience signals, and verify conversion quality. " +
      "Review search term insights and placement exclusions if needed. " +
      "Use brand exclusions only when there’s a clear strategy and measurement plan."
    );
  }

  if (t.includes("ctr")) {
    return (
      "Improve CTR by tightening ad group structure, using stronger RSA headlines aligned to user intent, " +
      "adding assets (sitelinks, callouts, structured snippets), and cleaning up match types + negatives. " +
      "Test 1–2 clear value props and a strong CTA per ad group."
    );
  }

  return (
    "Demo AI Assistant: ask a Google Ads question (budget, search terms, Quality Score, Performance Max, structure, RSAs) " +
    "and I’ll provide best-practice recommendations."
  );
}

export default function AIAssistantDrawer() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      text:
        "Hi! I’m a demo AI assistant for Google Ads. Pick a sample question or type your own.",
    },
  ]);

  const quick = useMemo(
    () => [
      "How can I improve Quality Score?",
      "What should I do with Search terms and negative keywords?",
      "How do I know if my budget is too low?",
      "How can I improve CTR?",
      "What should I review in a Performance Max campaign?",
    ],
    []
  );

  function copyToInput(q: string) {
    // Requirement: chips stay active and only copy into the input
    setInput(q);

    // Focus + place caret at the end
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
        AI Assistant
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-0 h-full w-full max-w-[520px] border-l border-white/10 bg-black/80 backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-white">
                  AI Assistant
                </div>
                <div className="text-xs text-white/50">
                  Demo mode (no API). Ask about Google Ads.
                </div>
              </div>

              <button className={btn} onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            {/* Quick questions */}
            <div className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {quick.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className={chip}
                    onClick={() => copyToInput(q)}
                    title="Copy question"
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
                  placeholder="Ask a Google Ads question…"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
                />
                <button className={btn} onClick={() => send()}>
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

"use client";

import { useMemo, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const card =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm overflow-hidden";
const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10";
const btnWhite =
  "rounded-xl border border-white/50 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90";

function answerFor(q: string) {
  const t = q.toLowerCase();

  if (t.includes("budget")) {
    return `Budget recommendations:
- Check whether your daily budget is too low (Search lost IS (budget)).
- If CPC is high, tighten keywords and add negative keywords/search terms.
- Review ad schedule and device performance.`;
  }

  if (t.includes("keyword") || t.includes("keywords") || t.includes("search term") || t.includes("search terms")) {
    return `Keywords / Search terms:
- Add negative keywords for recurring terms that don’t convert.
- Split Broad / Phrase / Exact to control traffic.
- Focus on 5–20 core keywords per ad group.`;
  }

  if (t.includes("quality") || t.includes("quality score") || t.includes("qs")) {
    return `Ad quality:
- Improve keyword-to-ad relevance (message match).
- Add more assets (sitelinks, callouts, structured snippets).
- Validate landing page speed and alignment with ad copy.`;
  }

  if (t.includes("landing") || t.includes("lp") || t.includes("landing page")) {
    return `Landing page:
- Make the headline reinforce the ad promise.
- Put the primary CTA above the fold.
- Test mobile performance: speed and form UX.`;
  }

  return `Quick checklist:
- Start with account structure (campaigns → ad groups → keywords).
- Review Search terms and add negative keywords.
- Revisit budgets and KPIs (CPA/ROAS).
Ask more specifically: “What should I improve in campaign X?” or “Why is my CPC high?”`;
}

export default function AIAssistantModal({ open, onClose }: Props) {
  const [q, setQ] = useState("");
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);

  const canSend = useMemo(() => q.trim().length > 0, [q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="absolute left-1/2 top-12 w-[min(900px,calc(100vw-24px))] -translate-x-1/2">
        <div className={card}>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-white/90">AI Assistant</div>
              <div className="text-xs text-white/50">
                Demo mode — prewritten answers, no live API.
              </div>
            </div>

            <button className={btn} onClick={onClose} type="button">
              Close
            </button>
          </div>

          <div className="px-5 py-4">
            <div className="grid gap-3">
              <textarea
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder='Ask a Google Ads question (e.g., "How do I reduce CPC?")'
                className="min-h-[90px] w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
              />

              <div className="flex items-center gap-2">
                <button
                  className={btnWhite}
                  type="button"
                  disabled={!canSend}
                  onClick={() => {
                    const qq = q.trim();
                    if (!qq) return;
                    const a = answerFor(qq);
                    setHistory((h) => [{ q: qq, a }, ...h]);
                    setQ("");
                  }}
                >
                  Ask
                </button>

                <button
                  className={btn}
                  type="button"
                  onClick={() => {
                    setHistory([]);
                    setQ("");
                  }}
                >
                  Clear
                </button>
              </div>

              <div className="mt-2 grid gap-3">
                {history.length === 0 && (
                  <div className="text-sm text-white/60">
                    Examples: “How can I improve Quality Score?”, “How do I choose negative
                    keywords?”, “Why is my budget spending too fast?”.
                  </div>
                )}

                {history.map((h, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="text-xs text-white/50">Question</div>
                    <div className="text-sm font-medium text-white/90">{h.q}</div>

                    <div className="mt-3 text-xs text-white/50">Answer</div>
                    <div className="whitespace-pre-wrap text-sm text-white/80">{h.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 px-5 py-3 text-xs text-white/40">
            Tip: later we can connect a real LLM plus your account data.
          </div>
        </div>
      </div>
    </div>
  );
}

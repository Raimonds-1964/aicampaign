"use client";

import { useRef, useState } from "react";
import CampaignWizard from "../../features/ai-campaign-builder/ui/CampaignWizard";
import CampaignResults from "../../features/ai-campaign-builder/ui/CampaignResults";
import type { CampaignDraft } from "../../features/ai-campaign-builder/state/types";

export default function Client() {
  const [draft, setDraft] = useState<CampaignDraft | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  function handleComplete(d: CampaignDraft) {
    setDraft(d);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function handleResetAll() {
    setDraft(null);
    // The wizard clears its own fields via the internal "Clear" action,
    // but we also need to clear the generated results.
  }

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-6">
          <div className="text-sm text-white/60">AI Campaign Builder</div>
          <h1 className="mt-2 text-4xl font-semibold">AI Campaign Builder</h1>
          <p className="mt-2 text-white/60">
            Enter your website URL and generate a Search campaign structure.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <CampaignWizard plan="pro" onComplete={handleComplete} onResetAll={handleResetAll} />
        </div>

        <div ref={resultsRef}>{draft ? <CampaignResults draft={draft} /> : null}</div>
      </div>
    </div>
  );
}

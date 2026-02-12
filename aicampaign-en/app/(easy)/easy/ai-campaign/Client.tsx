"use client";

import { useRef, useState } from "react";
import CampaignWizard from "../../../features/ai-campaign-builder/ui/CampaignWizard";
import CampaignResults from "../../../features/ai-campaign-builder/ui/CampaignResults";
import type { CampaignDraft } from "../../../features/ai-campaign-builder/state/types";

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
  }

  return (
    <div className="min-h-screen w-full bg-black text-white/90">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-6">
          <div className="text-xl text-white/60">AI Campaign Builder — Easy</div>
          <h1 className="mt-2 text-3xl font-semibold">AI Campaign Builder</h1>
          <p className="mt-2 text-white/60">
            Easy plan: 1 ad group, up to 10 keywords.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <CampaignWizard
            plan="easy"
            onComplete={handleComplete}
            onResetAll={handleResetAll}
          />
        </div>

        <div ref={resultsRef}>
          {draft ? <CampaignResults draft={draft} /> : null}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import type { CampaignDraft, Plan } from "../state/types";
import { generateCampaign } from "../services/generateCampaign";

const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35";
const label = "text-sm font-semibold text-white/80";
const help = "text-xs text-white/45";
const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition";
const btnPrimary =
  "rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition";

type Props = {
  plan: Plan;
  onComplete: (draft: CampaignDraft) => void;

  onResetAll?: () => void;
  onClearCampaign?: () => void;
};

// ✅ Separate key per plan (so Easy/Basic don't interfere)
const DOMAIN_LOCK_KEY: Record<string, string> = {
  easy: "aicampaign_easy_domain_lock_v1",
  basic: "aicampaign_basic_domain_lock_v1",
};

function normalizeDomain(rawUrl: string): string | null {
  const v = (rawUrl || "").trim();
  if (!v) return null;

  const withProto = v.startsWith("http://") || v.startsWith("https://") ? v : `https://${v}`;

  try {
    const u = new URL(withProto);
    const host = (u.hostname || "").toLowerCase().trim();
    if (!host) return null;
    return host.startsWith("www.") ? host.slice(4) : host;
  } catch {
    return null;
  }
}

export default function CampaignWizard({
  plan,
  onComplete,
  onResetAll,
  onClearCampaign,
}: Props) {
  const [url, setUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [goal, setGoal] = useState("leads");
  const [location, setLocation] = useState("United States");
  const [language, setLanguage] = useState("en");
  const [dailyBudget, setDailyBudget] = useState<number>(20);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ✅ Easy + Basic: lock only the DOMAIN (host)
  const isDomainLockedPlan = plan === "easy" || plan === "basic";
  const [lockedDomain, setLockedDomain] = useState<string | null>(null);

  useEffect(() => {
    if (!isDomainLockedPlan) return;

    try {
      const key = DOMAIN_LOCK_KEY[plan];
      const v = localStorage.getItem(key);
      const d = v ? v.trim().toLowerCase() : "";
      if (d) setLockedDomain(d);
    } catch {
      // ignore
    }
  }, [plan, isDomainLockedPlan]);

  const urlDomain = useMemo(() => normalizeDomain(url), [url]);

  async function onGenerate() {
    setErr(null);

    if (isDomainLockedPlan) {
      const d = urlDomain;

      if (!d) {
        setErr("Enter a valid website URL (e.g., example.com/page or https://example.com/page).");
        return;
      }

      if (lockedDomain && lockedDomain !== d) {
        setErr(
          `This plan is limited to a single domain. Your plan is currently locked to: ${lockedDomain}.`
        );
        return;
      }
    }

    setLoading(true);
    try {
      const draft = await generateCampaign({
        url,
        industry: industry.trim(),
        campaignName: campaignName.trim(),
        goal,
        location,
        language,
        dailyBudget,
        plan,
      });

      // ✅ Lock applies after the first successful generation
      if (isDomainLockedPlan) {
        const d = urlDomain;
        if (d && !lockedDomain) {
          try {
            const key = DOMAIN_LOCK_KEY[plan];
            localStorage.setItem(key, d);
          } catch {}
          setLockedDomain(d);
        }
      }

      onComplete(draft);
    } catch (e: any) {
      setErr(e?.message || "Failed to generate the campaign.");
    } finally {
      setLoading(false);
    }
  }

  function onClearAll() {
    setUrl("");
    setIndustry("");
    setCampaignName("");
    setGoal("leads");
    setLocation("United States");
    setLanguage("en");
    setDailyBudget(20);
    setErr(null);

    onResetAll?.();
    onClearCampaign?.();
  }

  function onClearOnlyCampaign() {
    setErr(null);
    onClearCampaign?.();
    onResetAll?.();
  }

  const domainWarning =
    isDomainLockedPlan && lockedDomain && urlDomain && lockedDomain !== urlDomain
      ? `Domain must stay the same: ${lockedDomain} (you can change only the page/path).`
      : null;

  return (
    <div>
      <div>
        <div className="text-lg font-semibold text-white/90">AI Campaign Builder</div>
        <div className="mt-1 text-sm text-white/60">
          Enter a destination URL to generate Search campaign copy and keyword ideas.
        </div>

        {isDomainLockedPlan ? (
          <div className="mt-2 text-xs text-white/45">
            Plan limit: you can generate campaigns for <b className="text-white/70">one domain</b>,
            but you may freely change the specific page (URL path).
            {lockedDomain ? (
              <>
                {" "}
                Locked domain:{" "}
                <span className="font-mono text-white/70">{lockedDomain}</span>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <div className={label}>Destination URL</div>
          <div className={help}>Example: example.com/page or https://example.com/page</div>

          <input
            className={input}
            placeholder="https://example.com/page"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          {domainWarning ? (
            <div className="mt-2 text-xs text-rose-200">{domainWarning}</div>
          ) : null}
        </div>

        <div>
          <div className={label}>What are you advertising? (optional)</div>
          <div className={help}>Example: house cleaning, training, home remodeling…</div>
          <input
            className={input}
            placeholder="Industry / service…"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
        </div>

        <div>
          <div className={label}>Campaign name</div>
          <div className={help}>Example: “Brand · Leads · US”</div>
          <input
            className={input}
            placeholder="Campaign name…"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
          />
        </div>

        <div>
          <div className={label}>Goal</div>
          <div className={help}>Demo parameters.</div>
          <select className={input} value={goal} onChange={(e) => setGoal(e.target.value)}>
            <option className="bg-white/90 text-black" value="leads">
              Leads
            </option>
            <option className="bg-white/90 text-black" value="sales">
              Sales
            </option>
            <option className="bg-white/90 text-black" value="traffic">
              Website traffic
            </option>
          </select>
        </div>

        <div>
          <div className={label}>Location</div>
          <div className={help}>Example: United States, New York, CA.</div>
          <input className={input} value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        <div>
          <div className={label}>Language</div>
          <div className={help}>en / es</div>
          <select className={input} value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option className="bg-white/90 text-black" value="en">
              en
            </option>
            <option className="bg-white/90 text-black" value="es">
              es
            </option>
          </select>
        </div>

        <div>
          <div className={label}>Daily budget (USD)</div>
          <div className={help}>Demo.</div>
          <input
            className={input}
            type="number"
            min={1}
            value={dailyBudget}
            onChange={(e) => setDailyBudget(Number(e.target.value || 0))}
          />
        </div>
      </div>

      {err ? (
        <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          {err}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button className={btn} type="button" onClick={onClearAll} disabled={loading}>
          Clear all
        </button>

        <button className={btn} type="button" onClick={onClearOnlyCampaign} disabled={loading}>
          Clear campaign
        </button>

        <button className={btnPrimary} type="button" onClick={onGenerate} disabled={loading}>
          {loading ? "Generating…" : "Generate campaign with AI"}
        </button>
      </div>
    </div>
  );
}

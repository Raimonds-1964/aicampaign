"use client";

import { useEffect, useMemo, useState } from "react";

type AdResult = {
  headlines: string[];
  descriptions?: string[]; // <— 2 rindas
  description?: string;    // backward
  sitelinks?: string[];
  demo?: boolean;
  meta?: {
    generationId?: string;
    variationProfile?: string;
    angle?: string;
  };
};

const DEMO_LIMIT_PER_DAY = 3;
const LS_KEY = "demo_generations_v3";
const LS_PREV_KEY = "demo_prev_outputs_v3";

function maskText(s: string) {
  if (!s) return "";
  const keep = Math.max(10, Math.floor(s.length * 0.6));
  return s.slice(0, keep) + " •••";
}

function getDisplayUrl(inputUrl: string) {
  try {
    const u = new URL(inputUrl.startsWith("http") ? inputUrl : `https://${inputUrl}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "example.com";
  }
}

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const NEUTRAL_EXAMPLE: AdResult = {
  headlines: [
    "Digitālais mārketings",
    "Ātrs piedāvājums",
    "Sazinies šodien",
    "Skaidri soļi",
    "Rezultāts bez lieka",
  ],
  descriptions: [
    "Piesakies • Saņem piedāvājumu. Izvēlies sev labāko risinājumu.",
    "Skaidrs process un saprotamas izmaksas. Sāc ar vienu klikšķi.",
  ],
  sitelinks: ["Pakalpojumi", "Cenas", "Atsauksmes", "Kontakti"],
};

export default function DemoPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ad, setAd] = useState<AdResult | null>(null);

  const [previousOutputs, setPreviousOutputs] = useState<any[]>([]);
  const [attempt, setAttempt] = useState(1);

  const displayUrl = useMemo(() => getDisplayUrl(url), [url]);
  const showCreateCampaignCTA = error.includes("Šodienas limits") || error.includes("kopēšana ir atslēgta");

  useEffect(() => {
    const prev = safeParse<any[]>(localStorage.getItem(LS_PREV_KEY), []);
    if (Array.isArray(prev)) setPreviousOutputs(prev.slice(0, 2));
  }, []);

  const canGenerateTodayOrSetError = () => {
    const today = new Date().toISOString().slice(0, 10);
    const obj = safeParse<{ date: string; count: number }>(localStorage.getItem(LS_KEY), {
      date: today,
      count: 0,
    });
    const count = obj.date === today ? Number(obj.count || 0) : 0;

    if (count >= DEMO_LIMIT_PER_DAY) {
      setError("Šodienas limits (3 ģenerācijas) ir sasniegts. Izveido kampaņu.");
      return { ok: false, today, count };
    }
    return { ok: true, today, count };
  };

  const markGenerated = (today: string, count: number) => {
    localStorage.setItem(LS_KEY, JSON.stringify({ date: today, count: count + 1 }));
  };

  const savePrevOutputs = (nextPrev: any[]) => {
    const trimmed = nextPrev.slice(0, 2);
    localStorage.setItem(LS_PREV_KEY, JSON.stringify(trimmed));
    setPreviousOutputs(trimmed);
  };

  const handleGenerate = async () => {
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      setError("Lūdzu ievadi mājaslapas URL");
      return;
    }

    const limit = canGenerateTodayOrSetError();
    if (!limit.ok) return;

    setLoading(true);
    setError("");
    setAd(null);

    try {
      const generationId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}_${Math.random().toString(16).slice(2)}`;

      const variationProfile = (["A", "B", "C"] as const)[(attempt - 1) % 3];
      const angles = ["quality", "price", "speed", "support", "simplicity", "eco"] as const;
      const angle = angles[(attempt - 1) % angles.length];

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: cleanUrl,
          generationId,
          attempt,
          variationProfile,
          angle,
          previousOutputs,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Servera kļūda");

      setAd(data);
      markGenerated(limit.today, limit.count);

      const nextPrev = [
        {
          headlines: Array.isArray(data.headlines) ? data.headlines : [],
          descriptions: Array.isArray(data.descriptions)
            ? data.descriptions
            : [data.description || ""],
        },
        ...previousOutputs,
      ];
      savePrevOutputs(nextPrev);

      setAttempt((x) => x + 1);
    } catch (e: any) {
      setError(e?.message || "Radās kļūda, mēģini vēlreiz");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAd(null);
    setError("");
    setLoading(false);
  };

  // helper
  const getTwoDescriptions = (a: AdResult | null) => {
    const ds = Array.isArray(a?.descriptions) ? a!.descriptions! : [];
    if (ds.length >= 2) return ds.slice(0, 2);
    const d1 = a?.description ? [a.description] : [];
    const merged = [...ds, ...d1].filter(Boolean);
    while (merged.length < 2) merged.push("Uzzini vairāk un sāc ar vienkāršu soli.");
    return merged.slice(0, 2);
  };

  return (
    <main style={{ maxWidth: 920, margin: "0 auto", padding: "60px 16px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ fontSize: 36, margin: 0 }}>Piemērs</h1>

        <a href="#" onClick={(e) => { e.preventDefault(); history.back(); }} style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none", fontSize: 22 }}>
          ← Atpakaļ
        </a>
      </div>

      {/* Neitrālais piemērs UZREIZ */}
      <div style={{ marginTop: 22 }}>
        <GoogleAdCard
          label="example.com/services/marketing"
          titleParts={[
            "Digitālais mārketings — example.com",
            "Ātrs piedāvājums",
            "Sazinies šodien",
          ]}
          descLines={getTwoDescriptions(NEUTRAL_EXAMPLE)}
          sitelinks={NEUTRAL_EXAMPLE.sitelinks || ["Pakalpojumi", "Cenas", "Atsauksmes", "Kontakti"]}
          blurRight={false}
        />
      </div>

      {/* URL + ģenerācija */}
      <div style={{ marginTop: 26, display: "grid", gridTemplateColumns: "1fr 260px", gap: 14, alignItems: "center" }}>
        <input
          type="text"
          placeholder="Ievadi mājaslapas URL (https://...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 14px",
            fontSize: 18,
            borderRadius: 14,
            border: "1px solid #e5e7eb",
            background: "#f3f4f6",
            outline: "none",
          }}
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            padding: "14px 18px",
            fontSize: 22,
            fontWeight: 800,
            backgroundColor: "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: 14,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Ģenerē..." : "Izveidot savu paraugu"}
        </button>
      </div>

      {/* CTA zem "Izveidot savu paraugu" */}
      <div style={{ marginTop: 12 }}>
        <a
          href="/pricing"
          style={{
            display: "inline-block",
            padding: "14px 18px",
            fontSize: 22,
            fontWeight: 800,
            backgroundColor: "#2563eb",
            color: "#ffffff",
            borderRadius: 14,
            textDecoration: "none",
          }}
        >
          Izveidot kampaņu
        </a>
      </div>

      {error && (
        <div style={{ marginTop: 14, background: "#fee2e2", borderRadius: 14, padding: "14px 16px", color: "#7f1d1d", fontSize: 20, fontWeight: 700 }}>
          {error}
        </div>
      )}

      {showCreateCampaignCTA && (
        <div style={{ marginTop: 12 }}>
          <a
            href="/pricing"
            style={{
              display: "inline-block",
              padding: "14px 18px",
              fontSize: 20,
              fontWeight: 800,
              backgroundColor: "#2563eb",
              color: "#ffffff",
              borderRadius: 14,
              textDecoration: "none",
            }}
          >
            Izveidot kampaņu
          </a>
        </div>
      )}

      {/* Ģenerētais paraugs (ar blur labo pusi) */}
      {ad && (
        <div style={{ marginTop: 24 }}>
          <GoogleAdCard
            label={`${displayUrl}/pakalpojumi`}
            titleParts={(ad.headlines || []).slice(0, 3)}
            descLines={getTwoDescriptions(ad)}
            sitelinks={(ad.sitelinks || ["Pakalpojumi", "Cenas", "Atsauksmes", "Kontakti"]).slice(0, 4)}
            blurRight={true} // <-- blur tikai pa labo pusi
            mask={true}       // <-- 60% maskēšana
            onCopyBlocked={() => setError("Demo režīmā kopēšana ir atslēgta. Izveido kampaņu.")}
          />

          <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{
                padding: "10px 16px",
                fontSize: 14,
                backgroundColor: "#ffffff",
                border: "1px solid #d1d5db",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              Izveidot jaunu paraugu
            </button>

            <a
              href="/pricing"
              style={{
                padding: "10px 16px",
                fontSize: 14,
                fontWeight: "bold",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                borderRadius: 10,
                textDecoration: "none",
              }}
            >
              Izveidot kampaņu
            </a>
          </div>
        </div>
      )}
    </main>
  );
}

function GoogleAdCard(props: {
  label: string;
  titleParts: string[];
  descLines: string[];
  sitelinks: string[];
  blurRight: boolean;
  mask?: boolean;
  onCopyBlocked?: () => void;
}) {
  const { label, titleParts, descLines, sitelinks, blurRight, mask, onCopyBlocked } = props;

  const title = titleParts.filter(Boolean);

  const t0 = title[0] || "Piedāvājums";
  const t1 = title[1] || "Uzzini vairāk";
  const t2 = title[2] || "Sāc šodien";

  const d0 = descLines[0] || "Uzzini vairāk.";
  const d1 = descLines[1] || "Sāc ar vienkāršu soli.";

  const shownTitle = mask ? [maskText(t0), maskText(t1), maskText(t2)] : [t0, t1, t2];
  const shownD0 = mask ? maskText(d0) : d0;
  const shownD1 = mask ? maskText(d1) : d1;

  return (
    <div
      onCopy={(e) => {
        if (!onCopyBlocked) return;
        e.preventDefault();
        onCopyBlocked();
      }}
      style={{
        position: "relative",
        padding: 26,
        borderRadius: 26,
        background: "#f8fafc",
        border: "1px solid #eef2f7",
        overflow: "hidden",
        userSelect: onCopyBlocked ? "none" : "auto",
        WebkitUserSelect: onCopyBlocked ? "none" : "auto",
      }}
    >
      {/* Blur overlay tikai pa labo pusi (bez krāsas) */}
      {blurRight && (
        <>
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "38%",
              height: "100%",
              backdropFilter: "blur(7px)",
              WebkitBackdropFilter: "blur(7px)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 22,
              bottom: 18,
              padding: "10px 14px",
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 16,
              color: "#ffffff",
              background: "#2563eb",
              pointerEvents: "none",
            }}
          >
            Izveido kampaņu, lai atbloķētu paraugu.
          </div>
        </>
      )}

      <div style={{ fontSize: 20, color: "#1a0dab", fontWeight: 800 }}>{label}</div>

      <div style={{ marginTop: 10, fontSize: 34, fontWeight: 800, color: "#1a0dab", lineHeight: 1.1 }}>
        {shownTitle[0]} · {shownTitle[1]} · {shownTitle[2]}
      </div>

      <div style={{ marginTop: 10, fontSize: 22, color: "#111827", lineHeight: 1.35 }}>
        <div>{shownD0}</div>
        <div>{shownD1}</div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 18, flexWrap: "wrap" }}>
        {sitelinks.slice(0, 4).map((t, i) => (
          <span key={i} style={{ color: "#1a0dab", fontSize: 22, fontWeight: 700 }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

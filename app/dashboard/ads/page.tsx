"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { _raw: text };
  }
}

function extractBlockerCodes(customersStatus: any): string[] {
  const codes = new Set<string>();
  const rows = Array.isArray(customersStatus?.customers) ? customersStatus.customers : [];
  for (const r of rows) {
    if (r?.ok === false && r?.error && typeof r.error === "object") {
      const key = Object.keys(r.error)[0];
      if (key && r.error[key]) codes.add(String(r.error[key]));
    }
  }
  return Array.from(codes);
}

export default function AdsPage() {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  const [from, setFrom] = useState(formatDate(weekAgo));
  const [to, setTo] = useState(formatDate(today));

  const [summary, setSummary] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [customersStatus, setCustomersStatus] = useState<any>(null);

  const [error, setError] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadCustomersStatus() {
    try {
      const r = await fetch(`/api/google-ads/customers`, { cache: "no-store" });
      const j = await safeJson(r);
      setCustomersStatus(j);
    } catch {
      // ignore
    }
  }

  async function loadData() {
    setLoading(true);
    setError(null);
    setErrorText(null);
    setSummary(null);
    setCampaigns([]);

    try {
      const s = await fetch(`/api/google-ads/summary?from=${from}&to=${to}`, {
        cache: "no-store",
      });
      const sJson = await safeJson(s);

      if (!s.ok) {
        setError(sJson?.error || "SUMMARY_ERROR");
        setErrorText(sJson?.message || null);

        const errCode = String(sJson?.error || "");
        if (
          errCode === "NO_ENABLED_CLIENT_UNDER_MANAGER" ||
          errCode === "CUSTOMER_NOT_ENABLED" ||
          errCode === "GOOGLE_ADS_API_ERROR"
        ) {
          await loadCustomersStatus();
        }

        setLoading(false);
        return;
      }

      const c = await fetch(`/api/google-ads/campaigns?from=${from}&to=${to}`, {
        cache: "no-store",
      });
      const cJson = await safeJson(c);

      if (!c.ok) {
        setError(cJson?.error || "CAMPAIGNS_ERROR");
        setErrorText(cJson?.message || null);
        await loadCustomersStatus();
        setLoading(false);
        return;
      }

      setSummary(sJson);
      setCampaigns(cJson?.campaigns || []);
      setCustomersStatus(null);
    } catch {
      setError("SERVER_CRASH");
      setErrorText(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const blockers = useMemo(() => extractBlockerCodes(customersStatus), [customersStatus]);

  const showBlockersPanel =
    error === "NO_ENABLED_CLIENT_UNDER_MANAGER" ||
    error === "CUSTOMER_NOT_ENABLED" ||
    blockers.length > 0;

  return (
    <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1>Google Ads pārskats</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <label>
          No:
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{ marginLeft: 6 }}
          />
        </label>

        <label>
          Līdz:
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ marginLeft: 6 }}
          />
        </label>

        <button
          onClick={loadData}
          disabled={loading}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #2563eb",
            background: "#2563eb",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading ? "Ielādē..." : "Ielādēt"}
        </button>

        <Link href="/dashboard/customers" style={{ marginLeft: "auto", fontWeight: 800 }}>
          ← Mainīt kontu
        </Link>
      </div>

      {showBlockersPanel && (
        <div
          style={{
            marginTop: 18,
            padding: 14,
            borderRadius: 12,
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            color: "#9a3412",
            fontWeight: 900,
            maxWidth: 980,
          }}
        >
          <div style={{ fontSize: 16, marginBottom: 8 }}>Datu ielāde šobrīd ir bloķēta</div>

          {error && (
            <div style={{ fontWeight: 800, marginBottom: 8 }}>
              Kļūda: <code>{error}</code>
              {errorText ? <span style={{ fontWeight: 700 }}> — {errorText}</span> : null}
            </div>
          )}

          {blockers.length > 0 && (
            <>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>
                Iemesli (no kontu diagnostikas):
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontWeight: 800 }}>
                {blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>

              <div style={{ marginTop: 10, fontWeight: 700, color: "#7c2d12" }}>
                <b>DEVELOPER_TOKEN_NOT_APPROVED</b> pazudīs, kad Google piešķirs{" "}
                <b>Standard access</b>.
                <br />
                <b>CUSTOMER_NOT_ENABLED</b> pazudīs, kad kontam pabeigsi billing/aktivizāciju.
              </div>
            </>
          )}

          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <Link
              href="/dashboard/customers"
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 10,
                background: "#9a3412",
                color: "white",
                fontWeight: 900,
                textDecoration: "none",
              }}
            >
              Atvērt kontu izvēli
            </Link>

            <button
              onClick={loadCustomersStatus}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #9a3412",
                background: "transparent",
                color: "#9a3412",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Pārlādēt kontu statusu
            </button>
          </div>
        </div>
      )}

      {customersStatus && (
        <div style={{ marginTop: 18, maxWidth: 980 }}>
          <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 8 }}>
            Kontu diagnostika (avots: <code>/api/google-ads/customers</code>)
          </div>
          <pre
            style={{
              padding: 12,
              borderRadius: 10,
              background: "#0b1220",
              color: "#e5e7eb",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(customersStatus, null, 2)}
          </pre>
        </div>
      )}

      {summary && (
        <div style={{ marginTop: 30 }}>
          <h2>Kopsavilkums</h2>
          <pre>{JSON.stringify(summary.metrics, null, 2)}</pre>
        </div>
      )}

      {campaigns.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h2>Kampaņas</h2>
          <pre>{JSON.stringify(campaigns, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}

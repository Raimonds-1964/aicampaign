"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { _raw: text };
  }
}

type CustomerOkRow = {
  id: string;
  ok: true;
  customer: {
    id: string;
    descriptiveName?: string;
    currencyCode?: string;
    timeZone?: string;
    manager?: boolean;
  };
};

type CustomerBadRow = {
  id: string;
  ok: false;
  status: number;
  error?: any;
  message?: string;
};

type CustomerRow = CustomerOkRow | CustomerBadRow;

export default function CustomersPage() {
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [needsLogin, setNeedsLogin] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    setNeedsLogin(false);

    try {
      const r = await fetch("/api/google-ads/customers", { cache: "no-store" });
      const j = await safeJson(r);
      setData(j);

      if (!r.ok) {
        const err = j?.error || "LOAD_ERROR";
        setError(err);

        if (err === "NOT_AUTHENTICATED" || r.status === 401) {
          setNeedsLogin(true);
        }

        setRows([]);
        setSelectedCustomerId(null);
        setLastUpdatedAt(new Date().toLocaleString());
        return;
      }

      const list = Array.isArray(j?.customers) ? (j.customers as CustomerRow[]) : [];
      setRows(list);

      // saglabājam DB izvēli, bet to NEUZSPIEŽAM, ja tā ir manager
      const currentSelected = j?.selectedCustomerId ? String(j.selectedCustomerId) : null;
      setSelectedCustomerId(currentSelected);

      setLastUpdatedAt(new Date().toLocaleString());
    } catch {
      setError("SERVER_CRASH");
      setRows([]);
      setSelectedCustomerId(null);
      setLastUpdatedAt(new Date().toLocaleString());
    } finally {
      setLoading(false);
    }
  }

  // auto refresh ik pēc 30s (ļoti noderīgi, kad Google apstiprina tokenu)
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(() => {
      load();
    }, 30_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]);

  const enabledClients = useMemo(() => {
    return rows.filter((r): r is CustomerOkRow => {
      if (r.ok !== true) return false;
      return r.customer?.manager === false;
    });
  }, [rows]);

  const managers = useMemo(() => {
    return rows.filter((r): r is CustomerOkRow => {
      if (r.ok !== true) return false;
      return Boolean(r.customer?.manager);
    });
  }, [rows]);

  const blocked = useMemo(() => {
    return rows.filter((r): r is CustomerBadRow => r.ok === false);
  }, [rows]);

  const blockersSummary = useMemo(() => {
    const codes = new Set<string>();
    for (const b of blocked) {
      const e = b.error;
      if (e && typeof e === "object") {
        // piemērs: { authorizationError: "DEVELOPER_TOKEN_NOT_APPROVED" }
        const key = Object.keys(e)[0];
        if (key && e[key]) codes.add(String(e[key]));
      }
    }
    return Array.from(codes);
  }, [blocked]);

  // Auto-select: ja parādās tieši 1 derīgs klients, uzreiz atzīmējam
  useEffect(() => {
    if (enabledClients.length === 1) {
      const onlyId = String(enabledClients[0].customer?.id || enabledClients[0].id);
      setSelectedCustomerId(onlyId);
    }
  }, [enabledClients]);

  const canSave = Boolean(
    selectedCustomerId &&
      enabledClients.some((c) => String(c.customer?.id || c.id) === String(selectedCustomerId))
  );

  async function saveSelection() {
    if (!canSave || !selectedCustomerId) return;

    setSaving(true);
    setError(null);

    try {
      const r = await fetch("/api/google-ads/select-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: selectedCustomerId }),
      });
      const j = await safeJson(r);

      if (!r.ok) {
        const err = j?.error || "SAVE_ERROR";
        setError(err);
        if (err === "NOT_AUTHENTICATED" || r.status === 401) setNeedsLogin(true);
        return;
      }

      router.push("/dashboard/ads");
    } catch {
      setError("SERVER_CRASH");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial, sans-serif", maxWidth: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Kontu izvēle</h1>

        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 800 }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto atjaunot (30s)
          </label>

          <Link href="/dashboard/ads" style={{ fontWeight: 800 }}>
            ← Atpakaļ uz pārskatu
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 10, opacity: 0.85 }}>
        Izvēlei pieejami ir tikai <b>aktīvi klienta konti</b> (<code>manager:false</code> un{" "}
        <code>ok:true</code>).
      </div>

      {lastUpdatedAt && (
        <div style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>
          Pēdējais atjauninājums: {lastUpdatedAt}
        </div>
      )}

      {needsLogin && (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 12,
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            color: "#9a3412",
            fontWeight: 900,
          }}
        >
          Tu neesi ielogojies.
          <div style={{ marginTop: 10 }}>
            <Link
              href="/api/auth/signin"
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
              Ielogoties
            </Link>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <button
          onClick={load}
          disabled={loading}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #111827",
            background: "transparent",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          {loading ? "Ielādē..." : "Pārlādēt tagad"}
        </button>

        <button
          onClick={saveSelection}
          disabled={saving || !canSave || needsLogin}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #2563eb",
            background: canSave ? "#2563eb" : "#93c5fd",
            color: "white",
            fontWeight: 900,
            cursor: canSave ? "pointer" : "not-allowed",
          }}
          title={!canSave ? "Nav pieejama aktīva klienta konta izvēle" : "Saglabāt"}
        >
          {saving ? "Saglabā..." : "Saglabāt izvēli"}
        </button>
      </div>

      {blockersSummary.length > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 12,
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            color: "#9a3412",
            fontWeight: 900,
          }}
        >
          <div style={{ marginBottom: 8 }}>Šobrīd kontu izvēle ir bloķēta:</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontWeight: 800 }}>
            {blockersSummary.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          <div style={{ marginTop: 10, fontWeight: 700, color: "#7c2d12" }}>
            <b>DEVELOPER_TOKEN_NOT_APPROVED</b> pazudīs, kad Google piešķirs <b>Standard access</b>.
            <br />
            <b>CUSTOMER_NOT_ENABLED</b> pazudīs, kad kontam pabeigsi billing/aktivizāciju.
          </div>
        </div>
      )}

      {error && !needsLogin && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 10,
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            fontWeight: 900,
          }}
        >
          Kļūda: {error}
        </div>
      )}

      <section style={{ marginTop: 22 }}>
        <h2 style={{ marginBottom: 8 }}>Aktīvie klienti (izvēlei)</h2>

        {enabledClients.length === 0 ? (
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              fontWeight: 800,
            }}
          >
            Nav neviena aktīva klienta konta (<code>ok:true</code>, <code>manager:false</code>), ko
            var izvēlēties.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {enabledClients.map((r) => {
              const id = String(r.customer?.id || r.id);
              const name = r.customer?.descriptiveName || "Klienta konts";
              const checked = String(selectedCustomerId) === id;

              return (
                <label
                  key={id}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    padding: 12,
                    borderRadius: 12,
                    border: checked ? "2px solid #2563eb" : "1px solid #e5e7eb",
                    background: checked ? "#eff6ff" : "white",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="customer"
                    checked={checked}
                    onChange={() => setSelectedCustomerId(id)}
                  />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ fontWeight: 900 }}>
                      {name} <span style={{ opacity: 0.75 }}>({id})</span>
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.85 }}>
                      currency: {r.customer?.currencyCode || "-"} • timezone:{" "}
                      {r.customer?.timeZone || "-"}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </section>

      <section style={{ marginTop: 26 }}>
        <h2 style={{ marginBottom: 8 }}>Manager (MCC) konti</h2>
        {managers.length === 0 ? (
          <div style={{ opacity: 0.75 }}>Nav.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {managers.map((r) => {
              const id = String(r.customer?.id || r.id);
              const name = r.customer?.descriptiveName || "Manager konts";
              return (
                <div
                  key={id}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    background: "#f9fafb",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>
                    {name} <span style={{ opacity: 0.75 }}>({id})</span>
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.85 }}>
                    Manager (MCC) kontam metrikas tieši neprasa — jāizvēlas klienta konts zem tā.
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section style={{ marginTop: 26 }}>
        <h2 style={{ marginBottom: 8 }}>Neaktīvi / bloķēti konti</h2>
        {blocked.length === 0 ? (
          <div style={{ opacity: 0.75 }}>Nav.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {blocked.map((r) => {
              const id = String(r.id);
              const pretty =
                r?.error && typeof r.error === "object"
                  ? JSON.stringify(r.error)
                  : r?.message || "UNKNOWN";

              return (
                <div
                  key={id}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #fecaca",
                    background: "#fff1f2",
                    color: "#991b1b",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>
                    Konts {id} (status {r.status})
                  </div>
                  <div style={{ marginTop: 6, fontWeight: 800, fontSize: 13 }}>
                    {pretty}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section style={{ marginTop: 26 }}>
        <h2 style={{ marginBottom: 8 }}>Debug (pilna API atbilde)</h2>
        <pre
          style={{
            padding: 12,
            borderRadius: 10,
            background: "#0b1220",
            color: "#e5e7eb",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      </section>
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

type ApiErr = { error?: string; message?: string };

// API reizēm atdod stringus, reizēm objektus.
// Tāpēc taisām elastīgu tipu:
type CustomerItem =
  | string
  | { resourceName?: string; id?: string | number }
  | { customer?: { resourceName?: string; id?: string | number } };

type CustomersOk = { customers: CustomerItem[] };

function onlyId(resourceName: unknown) {
  const s = getCustomerResourceName(resourceName);
  if (!s) return "";
  return s.replace(/^customers\//, "").trim();
}

// ✅ Galvenā funkcija: no jebkura formāta dabū resourceName stringu
function getCustomerResourceName(item: unknown): string {
  if (typeof item === "string") return item;

  if (item && typeof item === "object") {
    const direct = (item as any).resourceName;
    if (typeof direct === "string") return direct;

    const nested = (item as any).customer?.resourceName;
    if (typeof nested === "string") return nested;
  }

  return "";
}

// ✅ Drošs key React listēm (vienmēr string, un pēc iespējas unikāls)
function getCustomerKey(item: unknown, index: number): string {
  const rn = getCustomerResourceName(item);
  if (rn) return rn; // customers/123

  // ja nav resourceName, mēģinam id laukus
  if (item && typeof item === "object") {
    const id = (item as any).id ?? (item as any).customer?.id;
    if (typeof id === "string" || typeof id === "number") return `id:${id}`;
  }

  // pēdējais fallback
  return `idx:${index}`;
}

export default function CustomersPage() {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<string | null>(null);

  const [selecting, setSelecting] = useState<string | null>(null);

  async function loadCustomers() {
    setLoading(true);
    setError(null);
    setRaw(null);
    setCustomers([]);

    try {
      const res = await fetch("/api/google-ads/customers", {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      const text = await res.text();
      setRaw(text);

      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        setError(`API neatgrieza JSON. Status: ${res.status}`);
        return;
      }

      if (!res.ok) {
        const e = json as ApiErr;
        setError(e?.error || e?.message || `API kļūda. Status: ${res.status}`);
        return;
      }

      const ok = json as CustomersOk;
      setCustomers(Array.isArray(ok.customers) ? ok.customers : []);
    } catch (e: any) {
      setError(e?.message || "SERVER_CRASH");
    } finally {
      setLoading(false);
    }
  }

  async function selectCustomer(customerResourceNameOrId: string) {
    setSelecting(customerResourceNameOrId);
    setError(null);

    try {
      const res = await fetch("/api/google-ads/select-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ customerId: customerResourceNameOrId }),
      });

      const text = await res.text();
      let json: any = null;

      try {
        json = JSON.parse(text);
      } catch {
        setError(`select-customer neatgrieza JSON. Status: ${res.status}`);
        return;
      }

      if (!res.ok) {
        setError(json?.error || json?.message || "SELECT_ERROR");
        return;
      }

      window.location.href = "/dashboard/ads";
    } catch (e: any) {
      setError(e?.message || "SERVER_CRASH");
    } finally {
      setSelecting(null);
    }
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginTop: 0 }}>Google Ads konti</h1>
      <p style={{ color: "#374151", marginTop: 6 }}>
        Ja redzi <b>CUSTOMER_NOT_ENABLED</b>, tas nozīmē, ka konkrētais Ads konts nav aktivizēts (nav pabeigts maksājumu/billing
        iestatījums). Izvēlies citu kontu vai aktivizē šo Google Ads UI.
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
        <button
          onClick={loadCustomers}
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #d1d5db",
            background: loading ? "#f3f4f6" : "white",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          {loading ? "Ielādē..." : "Ielādēt kontus"}
        </button>

        <Link href="/dashboard" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 700 }}>
          ← Atpakaļ uz Dashboard
        </Link>
      </div>

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 12,
            border: "1px solid #fecaca",
            background: "#fff1f2",
            color: "#991b1b",
            fontWeight: 800,
          }}
        >
          Kļūda: {error}
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <h3 style={{ margin: "0 0 10px" }}>Pieejamie konti</h3>

        {customers.length === 0 ? (
          <div style={{ color: "#6b7280" }}>Nav ielādētu kontu.</div>
        ) : (
          <div style={{ display: "grid", gap: 10, maxWidth: 820 }}>
            {customers.map((c, idx) => {
              const resourceName = getCustomerResourceName(c); // "customers/123"
              const id = onlyId(c); // "123"
              const key = getCustomerKey(c, idx);

              return (
                <div
                  key={key}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 14,
                    background: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ fontFamily: "monospace", fontWeight: 900 }}>
                      {resourceName || JSON.stringify(c)}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: 12 }}>
                      ID: <span style={{ fontFamily: "monospace" }}>{id || "—"}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => selectCustomer(resourceName || id)}
                    disabled={!!selecting}
                    style={{
                      padding: "9px 12px",
                      borderRadius: 10,
                      border: "1px solid #2563eb",
                      background: selecting === (resourceName || id) ? "#93c5fd" : "#2563eb",
                      color: "white",
                      fontWeight: 800,
                      cursor: selecting ? "not-allowed" : "pointer",
                      minWidth: 130,
                    }}
                  >
                    {selecting === (resourceName || id) ? "Saglabā..." : "Izvēlēties"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {raw && (
        <div style={{ marginTop: 22 }}>
          <h3 style={{ margin: "0 0 10px" }}>API atbilde (debug)</h3>
          <pre
            style={{
              padding: 14,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: "#fafafa",
              overflow: "auto",
              maxWidth: 980,
            }}
          >
            {raw}
          </pre>
        </div>
      )}
    </main>
  );
}

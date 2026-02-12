"use client";

import { useState } from "react";
import Link from "next/link";

type ApiErr = { error?: string; message?: string };

type CustomerItem =
  | string
  | { resourceName?: string; id?: string | number }
  | { customer?: { resourceName?: string; id?: string | number } };

type CustomersOk = { customers: CustomerItem[] };

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

function onlyId(resourceName: unknown) {
  const s = getCustomerResourceName(resourceName);
  if (!s) return "";
  return s.replace(/^customers\//, "").trim();
}

function getCustomerKey(item: unknown, index: number): string {
  const rn = getCustomerResourceName(item);
  if (rn) return rn;

  if (item && typeof item === "object") {
    const id = (item as any).id ?? (item as any).customer?.id;
    if (typeof id === "string" || typeof id === "number") return `id:${id}`;
  }

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
        setError(`API did not return JSON. Status: ${res.status}`);
        return;
      }

      if (!res.ok) {
        const e = json as ApiErr;
        setError(e?.error || e?.message || `API error. Status: ${res.status}`);
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
        setError(`select-customer did not return JSON. Status: ${res.status}`);
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
    <div className="w-full">
      <h1 className="mt-0 text-2xl font-semibold">Google Ads accounts</h1>

      <p className="mt-2 text-slate-600">
        If you see <b>CUSTOMER_NOT_ENABLED</b>, it means that specific Ads account isn’t enabled yet
        (billing setup isn’t completed). Select a different account or enable it in the Google Ads UI.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={loadCustomers}
          disabled={loading}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {loading ? "Loading…" : "Load accounts"}
        </button>

        <Link href="/dashboard" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          Error: {error}
        </div>
      )}

      <div className="mt-6">
        <h3 className="mb-3 text-lg font-semibold">Accessible accounts</h3>

        {customers.length === 0 ? (
          <div className="text-slate-500">No accounts loaded.</div>
        ) : (
          <div className="grid gap-3">
            {customers.map((c, idx) => {
              const resourceName = getCustomerResourceName(c);
              const id = onlyId(c);
              const key = getCustomerKey(c, idx);

              return (
                <div
                  key={key}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex min-w-[240px] flex-col gap-1">
                    <div className="font-mono text-sm font-bold text-slate-900">
                      {resourceName || JSON.stringify(c)}
                    </div>
                    <div className="text-xs text-slate-500">
                      ID: <span className="font-mono">{id || "—"}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => selectCustomer(resourceName || id)}
                    disabled={!!selecting}
                    className="min-w-[130px] rounded-xl border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {selecting === (resourceName || id) ? "Saving…" : "Select"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {raw && (
        <div className="mt-6">
          <h3 className="mb-3 text-lg font-semibold">API response (debug)</h3>
          <pre className="max-w-full overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
            {raw}
          </pre>
        </div>
      )}
    </div>
  );
}

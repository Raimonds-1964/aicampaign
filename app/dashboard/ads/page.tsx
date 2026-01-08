"use client";
import Link from "next/link";

export default function AdsPage() {
  return (
    <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          display: "inline-block",
          padding: "6px 10px",
          borderRadius: 10,
          background: "#fee2e2",
          color: "#991b1b",
          fontWeight: 900,
          marginBottom: 14,
        }}
      >
        ADS PAGE OVERRIDE ✅ (NO useSession)
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Dashboard / Ads</h1>

      <p style={{ marginTop: 10, color: "#334155", fontWeight: 700 }}>
        Šī sadaļa ir īslaicīgi atslēgta, lai Vercel build nekrīt.
      </p>

      <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link
          href="/dashboard/ai"
          style={{
            display: "inline-block",
            padding: "12px 16px",
            borderRadius: 12,
            background: "#2563eb",
            color: "white",
            textDecoration: "none",
            fontWeight: 900,
          }}
        >
          Iet uz AI ģeneratoru →
        </Link>

        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid #cbd5e1",
            color: "#0f172a",
            textDecoration: "none",
            fontWeight: 900,
            background: "white",
          }}
        >
          Uz sākumu
        </Link>
      </div>
    </main>
  );
}

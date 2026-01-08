"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

export default function AdsPage() {
  return (
    <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>
        Dashboard / Ads
      </h1>

      <p style={{ marginTop: 10, color: "#334155", fontWeight: 700 }}>
        Šī sadaļa ir īslaicīgi atslēgta, lai Vercel build nekrīt.
      </p>

      <div style={{ marginTop: 18 }}>
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
      </div>
    </main>
  );
}

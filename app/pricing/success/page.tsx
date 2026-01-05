"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PricingSuccessPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const plan = sp.get("plan") || "pro";

  // Vari izvēlēties: automātiski aizvest uz dashboard pēc 1.2s
  useEffect(() => {
    const t = setTimeout(() => {
      router.push(`/dashboard/ai?success=1&plan=${encodeURIComponent(plan)}`);
    }, 1200);
    return () => clearTimeout(t);
  }, [router, plan]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 720 }}>
        <h1 style={{ marginTop: 0 }}>✅ Apmaksa veiksmīga</h1>
        <p style={{ color: "#374151", fontWeight: 700 }}>
          Paldies! Tūlīt atvērsim Dashboard un atbloķēsim PRO.
        </p>

        <a
          href={`/dashboard/ai?success=1&plan=${encodeURIComponent(plan)}`}
          style={{
            display: "inline-block",
            marginTop: 10,
            padding: "12px 16px",
            borderRadius: 12,
            background: "#2563eb",
            color: "white",
            fontWeight: 900,
            textDecoration: "none",
          }}
        >
          Doties uz Dashboard
        </a>

        <div style={{ marginTop: 12, color: "#6b7280", fontSize: 12, fontWeight: 700 }}>
          Ja pāradresācija nenostrādā, spied pogu.
        </div>
      </div>
    </main>
  );
}

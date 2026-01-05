"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PricingSuccessClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const plan = sp.get("plan") ?? "pro";

  useEffect(() => {
    const t = setTimeout(() => {
      router.push(`/dashboard?success=1&plan=${encodeURIComponent(plan)}`);
    }, 1200);

    return () => clearTimeout(t);
  }, [router, plan]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 720, width: "100%" }}>
        <h1 style={{ marginTop: 0 }}>✅ Apmaksa veiksmīga</h1>
        <p style={{ color: "#374151", fontWeight: 700 }}>
          Tiekat novirzīts uz paneli…
        </p>
      </div>
    </main>
  );
}

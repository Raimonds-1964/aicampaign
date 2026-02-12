"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function DashboardGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // ✅ drošs useSession (lai nekad nekrīt)
  const sessionHook = useSession();
  const status = sessionHook?.status ?? "unauthenticated";

  // ✅ /dashboard/ai ir publisks (bez login / bez apmaksas)
  // Lai “Izmēģināt bez maksas” vienmēr strādā un neiekrīt gate lapā.
  if (pathname === "/dashboard/ai") {
    return <>{children}</>;
  }

  // Ielogojies -> rādi dashboard saturu
  if (status === "authenticated") return <>{children}</>;

  // Loading -> vienkārši ielāde
  if (status === "loading") {
    return <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>Ielādējas…</div>;
  }

  // NAV ielogojies -> pricing + login poga
  return (
    <div
      style={{
        padding: 24,
        maxWidth: 760,
        margin: "40px auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 30, marginBottom: 10 }}>Dashboard pieejams pēc apmaksas</h1>

      <p style={{ color: "#334155", lineHeight: 1.6 }}>
        Vispirms apmaksā plānu Stripe Checkout (bez login). Pēc apmaksas vari ielogoties,
        lai saņemtu piekļuvi dashboardam.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
        <Link
          href="/pricing"
          style={{
            display: "inline-block",
            padding: "12px 16px",
            borderRadius: 10,
            background: "#2563eb",
            color: "white",
            textDecoration: "none",
            fontWeight: 800,
          }}
        >
          Aiziet uz apmaksu (Pricing)
        </Link>

        <button
          type="button"
          onClick={() => signIn("google")}
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "white",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Es jau apmaksāju — ielogoties
        </button>

        {/* Šis links ir noderīgs arī no gate ekrāna */}
        <Link
          href="/dashboard/ai"
          style={{
            display: "inline-block",
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "white",
            textDecoration: "none",
            fontWeight: 800,
            color: "#0f172a",
          }}
        >
          Izmēģināt bez maksas
        </Link>
      </div>
    </div>
  );
}

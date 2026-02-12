"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function DashboardGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Safe useSession (never crashes)
  const sessionHook = useSession();
  const status = sessionHook?.status ?? "unauthenticated";

  // ✅ /dashboard/ai is public (no login, no payment)
  // Allows "Try for free" to always work without hitting the gate.
  if (pathname === "/dashboard/ai") {
    return <>{children}</>;
  }

  // Authenticated → show dashboard content
  if (status === "authenticated") {
    return <>{children}</>;
  }

  // Loading state
  if (status === "loading") {
    return (
      <div
        style={{
          padding: 24,
          fontFamily: "Arial, sans-serif",
          color: "#0f172a",
        }}
      >
        Loading your dashboard…
      </div>
    );
  }

  // Not authenticated → pricing + login
  return (
    <div
      style={{
        padding: 24,
        maxWidth: 760,
        margin: "40px auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 30, marginBottom: 12 }}>
        Dashboard access requires an active plan
      </h1>

      <p style={{ color: "#334155", lineHeight: 1.6 }}>
        To access your Google Ads dashboard, please choose a plan and complete
        checkout. After that, sign in to unlock all features, analytics, and AI
        recommendations.
      </p>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 20,
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/pricing"
          style={{
            display: "inline-block",
            padding: "12px 18px",
            borderRadius: 999,
            background: "#2563eb",
            color: "white",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          View plans & pricing
        </Link>

        <button
          type="button"
          onClick={() => signIn("google")}
          style={{
            padding: "12px 18px",
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            background: "white",
            fontWeight: 700,
            cursor: "pointer",
            color: "#0f172a",
          }}
        >
          I already have a plan — Sign in
        </button>

        {/* Useful even from the gate screen */}
        <Link
          href="/dashboard/ai"
          style={{
            display: "inline-block",
            padding: "12px 18px",
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            background: "white",
            textDecoration: "none",
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          Try AI Assistant for free
        </Link>
      </div>
    </div>
  );
}

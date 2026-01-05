"use client";

import { useState } from "react";

type Props = {
  label: string;
  plan: "easy" | "basic" | "pro" | "agency";
  mode: "payment" | "subscription";
  className?: string;
  style?: React.CSSProperties;
};

export default function CTAButton({ label, plan, mode, className, style }: Props) {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    try {
      setLoading(true);

      const r = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, mode }),
      });

      const text = await r.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        // ignore
      }

      if (!r.ok || !data?.ok || !data?.url) {
        console.error("Stripe checkout error:", { status: r.status, text, data });
        alert("Neizdevās atvērt apmaksu. Lūdzu pamēģini vēlreiz.");
        return;
      }

      window.location.href = data.url; // Stripe hosted checkout
    } catch (e) {
      console.error(e);
      alert("Neizdevās atvērt apmaksu. Lūdzu pamēģini vēlreiz.");
    } finally {
      setLoading(false);
    }
  }

  const base: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #2563eb",
    background: "#2563eb",
    color: "white",
    fontWeight: 900,
    fontSize: 16,
    cursor: loading ? "default" : "pointer",
    opacity: loading ? 0.75 : 1,
    textAlign: "center",
    ...style,
  };

  return (
    <button className={className} style={base} onClick={onClick} disabled={loading}>
      {loading ? "Atver apmaksu..." : label}
    </button>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

const btn: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  background: "#0f172a",
  color: "white",
  fontWeight: 900,
  fontSize: 16,
  cursor: "pointer",
};

const card: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 16,
  background: "white",
};

export default function PricingPage() {
  return (
    <main style={{ padding: 46, fontFamily: "Arial, sans-serif", color: "#0f172a" }}>
      <div
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          zIndex: 999999,
          background: "red",
          color: "white",
          padding: "8px 10px",
          borderRadius: 10,
          fontWeight: 900,
        }}
      >
        PRICING MARKER: 2026-01-08
      </div>

      <h1 style={{ margin: 0, fontSize: 40, fontWeight: 900 }}>Cenas</h1>
      <p style={{ marginTop: 10, color: "#334155", fontWeight: 700 }}>
        Visas pogas zemāk ved <b>tieši</b> uz Stripe Checkout caur{" "}
        <code>/api/stripe/checkout-redirect</code>.
      </p>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
          maxWidth: 980,
        }}
      >
        {/* EASY */}
        <div style={card}>
          <div style={{ fontSize: 20, fontWeight: 900 }}>Easy</div>
          <div style={{ marginTop: 6, color: "#64748b", fontWeight: 800 }}>One-time payment</div>
          <ul style={{ marginTop: 12, paddingLeft: 18, color: "#0f172a", fontWeight: 800, lineHeight: 1.5 }}>
            <li>Vienreizējs pirkums</li>
            <li>Bez abonēšanas</li>
          </ul>
          <div style={{ marginTop: 12 }}>
            <Link href="/api/stripe/checkout-redirect?planKey=easy">
              <button style={btn}>Pirkt Easy → Stripe</button>
            </Link>
          </div>
        </div>

        {/* BASIC */}
        <div style={card}>
          <div style={{ fontSize: 20, fontWeight: 900 }}>Basic</div>
          <div style={{ marginTop: 6, color: "#64748b", fontWeight: 800 }}>Subscription</div>
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <Link href="/api/stripe/checkout-redirect?planKey=basic_monthly">
              <button style={btn}>Basic Monthly → Stripe</button>
            </Link>
            <Link href="/api/stripe/checkout-redirect?planKey=basic_yearly">
              <button style={btn}>Basic Yearly → Stripe</button>
            </Link>
          </div>
        </div>

        {/* PRO */}
        <div style={card}>
          <div style={{ fontSize: 20, fontWeight: 900 }}>Pro</div>
          <div style={{ marginTop: 6, color: "#64748b", fontWeight: 800 }}>Subscription</div>
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <Link href="/api/stripe/checkout-redirect?planKey=pro_monthly">
              <button style={btn}>Pro Monthly → Stripe</button>
            </Link>
            <Link href="/api/stripe/checkout-redirect?planKey=pro_yearly">
              <button style={btn}>Pro Yearly → Stripe</button>
            </Link>
          </div>
        </div>

        {/* AGENCY */}
        <div style={card}>
          <div style={{ fontSize: 20, fontWeight: 900 }}>Agency</div>
          <div style={{ marginTop: 6, color: "#64748b", fontWeight: 800 }}>Subscription</div>
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <Link href="/api/stripe/checkout-redirect?planKey=agency_monthly">
              <button style={btn}>Agency Monthly → Stripe</button>
            </Link>
            <Link href="/api/stripe/checkout-redirect?planKey=agency_yearly">
              <button style={btn}>Agency Yearly → Stripe</button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

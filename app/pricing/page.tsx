export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

type BtnProps = {
  href: string;
  children: React.ReactNode;
};

function BuyButton({ href, children }: BtnProps) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <button
        style={{
          width: "100%",
          padding: "14px 16px",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          background: "#0f172a",
          color: "white",
          fontWeight: 900,
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        {children}
      </button>
    </Link>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        padding: 16,
        background: "white",
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 900 }}>{title}</div>
      <div style={{ marginTop: 6, color: "#64748b", fontWeight: 800 }}>{subtitle}</div>
      <div style={{ marginTop: 14 }}>{children}</div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <main style={{ padding: 46, fontFamily: "Arial, sans-serif", color: "#0f172a" }}>
      <h1 style={{ margin: 0, fontSize: 40, fontWeight: 900 }}>Cenas</h1>
      <p style={{ marginTop: 10, color: "#334155", fontWeight: 700 }}>
        Izvēlies plānu — maksājums notiek Stripe Checkout. Login pirms maksājuma netiek prasīts.
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
        <Card title="Easy" subtitle="One-time payment">
          <ul style={{ margin: 0, paddingLeft: 18, fontWeight: 800, lineHeight: 1.6 }}>
            <li>Vienreizējs pirkums</li>
            <li>Bez abonēšanas</li>
          </ul>
          <div style={{ marginTop: 12 }}>
            <BuyButton href="/api/stripe/checkout?planKey=easy">Pirkt Easy → Stripe</BuyButton>
          </div>
        </Card>

        <Card title="Basic" subtitle="Subscription">
          <div style={{ display: "grid", gap: 10 }}>
            <BuyButton href="/api/stripe/checkout?planKey=basic_monthly">
              Basic Monthly → Stripe
            </BuyButton>
            <BuyButton href="/api/stripe/checkout?planKey=basic_yearly">
              Basic Yearly → Stripe
            </BuyButton>
          </div>
        </Card>

        <Card title="Pro" subtitle="Subscription">
          <div style={{ display: "grid", gap: 10 }}>
            <BuyButton href="/api/stripe/checkout?planKey=pro_monthly">Pro Monthly → Stripe</BuyButton>
            <BuyButton href="/api/stripe/checkout?planKey=pro_yearly">Pro Yearly → Stripe</BuyButton>
          </div>
        </Card>

        <Card title="Agency" subtitle="Subscription">
          <div style={{ display: "grid", gap: 10 }}>
            <BuyButton href="/api/stripe/checkout?planKey=agency_monthly">
              Agency Monthly → Stripe
            </BuyButton>
            <BuyButton href="/api/stripe/checkout?planKey=agency_yearly">
              Agency Yearly → Stripe
            </BuyButton>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 22, color: "#64748b", fontWeight: 700, maxWidth: 980 }}>
        Ja vēlies, bezmaksas paraugs paliek bez login (tas ir atsevišķi no maksājumiem).
      </div>
    </main>
  );
}

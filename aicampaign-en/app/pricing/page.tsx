"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "../components/Container";

type UiPlanKey = "easy" | "basic" | "pro" | "agency";

type Plan = {
  key: UiPlanKey;
  name: string;
  badge?: string;
  priceType: "one_time" | "monthly";
  price: number;
  ctaLabel: string;
  ctaHint?: string;

  forWho: string;
  outcome: string;
  highlights: string[];
  features: string[];
};

// ✅ USD formatting (stable, proper currency formatting)
function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function PricingButton(props: { label: string; href: string }) {
  const baseStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #2563eb",
    background: "#2563eb",
    color: "white",
    fontWeight: 900,
    fontSize: 16,
    cursor: "pointer",
    textAlign: "center",
    textDecoration: "none",
    display: "inline-block",
  };

  return (
    <a href={props.href} style={baseStyle}>
      {props.label}
    </a>
  );
}

function Pill(props: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 999,
        border: "1px solid #e5e7eb",
        background: "white",
        color: "#0f172a",
        fontWeight: 900,
        fontSize: 13,
        lineHeight: 1,
      }}
    >
      {props.children}
    </span>
  );
}

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const yearlyDiscount = 0.2;

  // ✅ details state per card (so they don’t interfere)
  const [detailsOpen, setDetailsOpen] = useState<Record<UiPlanKey, boolean>>({
    easy: false,
    basic: false,
    pro: false,
    agency: false,
  });

  const router = useRouter();
  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  }

  const heroTitle = "Choose a plan and take control with AI";
  // ✅ Single, stable hero copy (no A/B variants)
  const heroSub =
    "AI Google Ads is not just an ad copy generator. You get a structured Google Ads campaign setup ready to review, edit, and export - plus an optional account and campaign control system with AI-powered monitoring and recommendations.";

  const paidCtaLabel = "Choose plan";

  const plans: Plan[] = useMemo(
    () => [
      {
        key: "easy",
        name: "Easy",
        priceType: "one_time",
        price: 29,
        ctaLabel: "Start with Easy",
        ctaHint: "One-time purchase",
        forWho: "Fast start with a single campaign draft",
        outcome:
          "Get a structured campaign draft you can review, edit, and use as a starting point in Google Ads.",
        highlights: ["AI campaign draft", "Fully editable output", "Export to PDF, HTML, CSV, XLS"],
        features: [
          "One campaign draft: up to 6 headlines, 4 descriptions, 4 sitelinks, keyword ideas + negative keyword ideas",
          "Regenerate drafts",
          "No direct export to a Google Ads account",
        ],
      },
      {
        key: "basic",
        name: "Basic",
        badge: "Most Popular",
        priceType: "monthly",
        price: 49,
        ctaLabel: paidCtaLabel,
        ctaHint: "Up to 5 campaigns",
        forWho: "Small businesses running ongoing ads",
        outcome:
          "A managed workspace for one website: build campaigns and keep them under AI-assisted control.",
        highlights: ["Dashboard", "One AI Google Ads workspace", "AI campaign drafts"],
        features: [
          "Campaigns for 1 website",
          "Up to 5 campaigns with AI-assisted control",
          "Fully editable output",
          "Export to PDF, HTML, CSV, XLS",
          "Export to Google Ads account",
          "Remove campaigns and add new ones",
          "Ongoing monitoring of 4 key campaign parameters",
          "AI alerts and issue guidance",
          "AI recommendations for optimization",
          "Daily budget monitoring",
          "Ad position monitoring",
          "Daily spend by keyword",
          "AI Assistant",
        ],
      },
      {
        key: "pro",
        name: "Pro",
        priceType: "monthly",
        price: 99,
        ctaLabel: paidCtaLabel,
        ctaHint: "Unlimited",
        forWho: "Teams and advertisers with higher volume",
        outcome:
          "Unlimited campaigns with full AI-assisted monitoring and recommendations - built for serious Google Ads work.",
        highlights: [
          "Dashboard",
          "Unlimited campaigns with AI-assisted control",
          "Bring existing campaigns into AI control",
        ],
        features: [
          "One own or AI account included, with the option to add additional accounts for $99 /mo per account",
          "AI campaign drafts",
          "Fully editable output",
          "Ad copy generation and editing",
          "Export to PDF, HTML, CSV, XLS",
          "Export to Google Ads account",
          "Ongoing monitoring of 8 key campaign parameters",
          "AI alerts and issue guidance",
          "AI recommendations for optimization",
          "Daily budget monitoring",
          "Ad position monitoring",
          "Daily spend by keyword",
          "Generate detailed reports for any date range",
          "AI Assistant",
        ],
      },
      {
        key: "agency",
        name: "Agency",
        priceType: "monthly",
        price: 299,
        ctaLabel: paidCtaLabel,
        ctaHint: "Unlimited",
        forWho: "Agencies managing multiple clients and a team",
        outcome:
          "Collaborative workspace for managing unlimited campaigns across clients, with role-based access.",
        highlights: ["Admin/Manager dashboards", "Assign campaigns to managers", "Manager performance oversight"],
        features: [
          "One own or AI account included, with the option to add additional accounts for $99 /mo per account",
          "Unlimited campaigns with AI-assisted control",
          "Bring existing campaigns into AI control",
          "AI campaign drafts",
          "Fully editable output",
          "Export to PDF, HTML, CSV, XLS",
          "Export to Google Ads account",
          "Ongoing monitoring of 8 key campaign parameters",
          "AI alerts and issue guidance",
          "AI recommendations for optimization",
          "Daily budget monitoring",
          "Ad position monitoring",
          "Daily spend by keyword",
          "Generate detailed reports for any date range",
          "AI Assistant",
        ],
      },
    ],
    []
  );

  function displayPrice(plan: Plan) {
    if (plan.priceType === "one_time") return { primary: `${formatUSD(plan.price)}`, secondary: "one-time" };
    if (billing === "monthly") return { primary: `${formatUSD(plan.price)}`, secondary: "/mo" };
    const yearly = plan.price * 12 * (1 - yearlyDiscount);
    return { primary: `${formatUSD(yearly)}`, secondary: "/yr" };
  }

  function getStripePlanKey(uiKey: UiPlanKey) {
    if (uiKey === "easy") return "easy";
    if (uiKey === "basic") return billing === "monthly" ? "basic_monthly" : "basic_yearly";
    if (uiKey === "pro") return billing === "monthly" ? "pro_monthly" : "pro_yearly";
    return billing === "monthly" ? "agency_monthly" : "agency_yearly";
  }

  function getCheckoutHref(uiKey: UiPlanKey) {
    if (uiKey === "easy") return "/easy/start";
    const planKey = getStripePlanKey(uiKey);
    return `/api/stripe/checkout?planKey=${planKey}`;
  }

  return (
    <Container style={{ paddingTop: 46, paddingBottom: 70, fontFamily: "Arial, sans-serif", color: "#0f172a" }}>
      <main>
        {/* HERO */}
        <section
          style={{
            borderRadius: 18,
            padding: "26px 18px",
            background:
              "radial-gradient(1200px 380px at 30% 0%, rgba(124,58,237,0.16), transparent 55%), radial-gradient(900px 320px at 80% 10%, rgba(37,99,235,0.16), transparent 60%), #f8fafc",
            border: "1px solid #e5e7eb",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 520px", minWidth: 280 }}>
              <h1 style={{ margin: 0, fontSize: 40, fontWeight: 900, letterSpacing: -0.4 }}>{heroTitle}</h1>
              <p
                style={{
                  marginTop: 10,
                  marginBottom: 0,
                  fontSize: 18,
                  color: "#334155",
                  maxWidth: 860,
                  lineHeight: 1.55,
                }}
              >
                {heroSub}
              </p>
              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Pill>⚡ From URL to structure</Pill>
                <Pill>🧠 AI + account organization</Pill>
                <Pill>📤 AI-assisted campaign control</Pill>
              </div>
            </div>

            {/* Back + billing toggle */}
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={goBack}
                style={{
                  color: "#2563eb",
                  fontWeight: 900,
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  textAlign: "right",
                }}
              >
                ← Back
              </button>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: 999,
                  padding: "10px 12px",
                }}
              >
                <span style={{ fontWeight: 900, color: billing === "yearly" ? "#111827" : "#64748b" }}>
                  Yearly −20%
                </span>

                <button
                  onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
                  aria-label="Toggle billing period"
                  style={{
                    width: 54,
                    height: 30,
                    borderRadius: 999,
                    border: "1px solid #cbd5e1",
                    background: billing === "yearly" ? "#2563eb" : "#e2e8f0",
                    position: "relative",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 3,
                      left: billing === "yearly" ? 27 : 3,
                      width: 24,
                      height: 24,
                      borderRadius: 999,
                      background: "white",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                      transition: "left 150ms ease",
                    }}
                  />
                </button>

                <span style={{ fontWeight: 900, color: billing === "monthly" ? "#111827" : "#64748b" }}>
                  Monthly
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 16,
            marginTop: 14,
          }}
        >
          {plans.map((p) => {
            const price = displayPrice(p);
            const isPopular = p.key === "basic";

            return (
              <div
                key={p.key}
                style={{
                  background: "white",
                  borderRadius: 18,
                  border: isPopular ? "2px solid #2563eb" : "1px solid #e5e7eb",
                  padding: 18,
                  boxShadow: isPopular ? "0 10px 30px rgba(37,99,235,0.12)" : "0 6px 20px rgba(15,23,42,0.06)",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 500,
                }}
              >
                {p.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      left: 16,
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: "#2563eb",
                      color: "white",
                      fontWeight: 900,
                      fontSize: 12,
                    }}
                  >
                    {p.badge}
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                  <h3 style={{ margin: 0, fontSize: 22 }}>{p.name}</h3>
                  {p.ctaHint && <div style={{ color: "#64748b", fontWeight: 800, fontSize: 13 }}>{p.ctaHint}</div>}
                </div>

                <div style={{ marginTop: 8, color: "#334155", fontWeight: 800, fontSize: 13, lineHeight: 1.45 }}>
                  {p.forWho}
                </div>

                <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 8 }}>
                  <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: -0.5 }}>{price.primary}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#64748b" }}>{price.secondary}</div>
                </div>

                {p.priceType === "monthly" && billing === "yearly" && (
                  <div style={{ marginTop: 6, color: "#16a34a", fontWeight: 900, fontSize: 13 }}>
                    Yearly plan: save 20%
                  </div>
                )}

                <div
                  style={{
                    marginTop: 10,
                    padding: "10px 12px",
                    borderRadius: 14,
                    background: "#f8fafc",
                    border: "1px solid #eef2f7",
                    color: "#0f172a",
                    lineHeight: 1.5,
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  <div style={{ fontWeight: 900, color: "#2563eb", marginBottom: 4 }}>Outcome</div>
                  {p.outcome}
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>Included</div>
                  <ul style={{ paddingLeft: 18, margin: 0, color: "#111827", lineHeight: 1.55 }}>
                    {p.highlights.map((h) => (
                      <li key={h} style={{ marginBottom: 6 }}>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ✅ details per card */}
                <details
                  open={detailsOpen[p.key]}
                  onToggle={(e) => {
                    const isOpen = (e.currentTarget as HTMLDetailsElement).open;
                    setDetailsOpen((prev) => ({ ...prev, [p.key]: isOpen }));
                  }}
                  style={{ marginTop: 10 }}
                >
                  <summary style={{ cursor: "pointer", color: "#2563eb", fontWeight: 900 }}>
                    {detailsOpen[p.key] ? "▼ Hide details" : "▶ View details"}
                  </summary>

                  <ul style={{ marginTop: 10, paddingLeft: 18, color: "#111827", lineHeight: 1.55 }}>
                    {p.features.map((f) => (
                      <li key={f} style={{ marginBottom: 7 }}>
                        {f}
                      </li>
                    ))}
                  </ul>
                </details>

                <div style={{ marginTop: "auto" }}>
                  <div style={{ marginTop: 14 }}>
                    <PricingButton label={p.ctaLabel} href={getCheckoutHref(p.key)} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </Container>
  );
}

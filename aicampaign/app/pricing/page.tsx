"use client";

import { useEffect, useMemo, useState } from "react";
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

function SectionTitle(props: { kicker?: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {props.kicker && (
        <div style={{ fontWeight: 900, color: "#2563eb", fontSize: 12, letterSpacing: 0.35 }}>
          {props.kicker}
        </div>
      )}
      <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", marginTop: 4 }}>{props.title}</div>
      {props.sub && (
        <div style={{ marginTop: 8, color: "#334155", lineHeight: 1.55, maxWidth: 860 }}>
          {props.sub}
        </div>
      )}
    </div>
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

  // ✅ atvērumi katrai kartei atsevišķi
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

  const heroTitle = "Izvēlies plānu un sāc ar AI kontroli";
  // ✅ VIENS teksts (nav A/B variantu) — vienādi strādā localhost + Vercel
  const heroSub =
    "AI Google Ads nav tikai reklāmas tekstu ģenerators. Tu saņem sakārtotu Google Ads kampaņas struktūru gatavu rediģēšanai un eksportam vai papildus arī ērtu kontu un kampaņu vadības sistēmu ar pilnu AI kontroli.";

  const paidCtaLabel = "Izvēlēties plānu";

  const plans: Plan[] = useMemo(
    () => [
      {
        key: "easy",
        name: "Easy",
        priceType: "one_time",
        price: 29,
        ctaLabel: "Sākt ar Easy",
        ctaHint: "Vienreizējs pirkums",
        forWho: "Ātram startam ar vienu kampaņu",
        outcome: "Saņem gatavu kampaņas struktūru, ko vari ielikt Google Ads un pielāgot sev.",
        highlights: ["Reklāmas kampaņu AI ģenerators", "Pilnas rediģēšanas iespējas", "Eksports PDF, HTML, CSV, XLSX"],
        features: [
          "Viena Google Ads reklāmas kampaņa: 6 virsraksti, 4 apraksti, 4 vietnes saites ar virsrakstiem, 10 atslēgvārdi + negatīvie vārdi",
          "Atkārtota ģenerēšana",
          "Bez eksporta uz Google Ads kontu",
        ],
      },
      {
        key: "basic",
        name: "Basic",
        badge: "Vispopulārākais",
        priceType: "monthly",
        price: 49,
        ctaLabel: paidCtaLabel,
        ctaHint: "Līdz 5 kampaņām",
        forWho: "Nelielam uzņēmumam regulārai reklāmai",
        outcome: "Gatavs Google Ads konts ar kampaņām vienai mājaslapai. Kampaņu veidošana un kontrole ar AI",
        highlights: ["Vadības panelis", "Viens AI Google Ads konts", "Reklāmas kampaņu AI ģenerators"],
        features: [
          "Reklāmas kampaņas 1 mājaslapai",
          "Līdz 5 reklāmas kampaņām ar AI kontroli",
          "Pilnas rediģēšanas iespējas",
          "Eksports PDF, HTML, CSV, XLSX",
          "Eksports uz Google Ads kontu",
          "Kampaņu noņemšana un jaunu pielikšana",
          "Katras kampaņas 4 parametru pastāvīga kontrole",
          "AI ziņojumi par situāciju un problēmu novēršana",
          "AI ieteikumi kampaņu uzlabošanai",
          "Pastāvīgs dienas budžeta monitorings",
          "Pastāvīga reklāmas pozīciju noteikšana",
          "Katra atslēgvārda iztērētais dienas budžets",
          "AI asistents",
        ],
      },
      {
        key: "pro",
        name: "Pro",
        priceType: "monthly",
        price: 99,
        ctaLabel: paidCtaLabel,
        ctaHint: "Neierobežots",
        forWho: "Profesionāļiem un uzņēmumiem ar apjomu",
        outcome: "Neierobežots kampaņu apjoms un pilna AI kontrole. Piemērots nopietnam Google Ads darbam.",
        highlights: ["Vadības panelis", "Neierobežotas kampaņas ar AI kontroli", "Savu esošo kampaņu pievienošana AI kontrolei"],
        features: [
          "Viena sava vai AI konta pievienošana ar iespēju pievienot papildus kontus - 99/mēnesī par kontu",
          "Reklāmas kampaņu AI ģenerators",
          "Pilnas rediģēšanas iespējas",
          "Reklāmu tekstu ģenerēšana un rediģēšana",
          "Eksports PDF, HTML, CSV, XLSX",
          "Eksports uz Google Ads kontu",
          "Katras kampaņas 8 parametru pastāvīga kontrole",
          "AI ziņojumi par situāciju un problēmu novēršana",
          "AI ieteikumi kampaņu uzlabošanai",
          "Pastāvīgs dienas budžeta monitorings",
          "Pastāvīga reklāmas pozīciju noteikšana",
          "Katra atslēgvārda iztērētais dienas budžets",
          "Detalizētu pārskatu veidošana par jebkuru periodu",
          "AI asistents",
        ],
      },
      {
        key: "agency",
        name: "Agency",
        priceType: "monthly",
        price: 299,
        ctaLabel: paidCtaLabel,
        ctaHint: "Neierobežots",
        forWho: "Aģentūrām ar vairākiem klientiem un komandu",
        outcome: "Viegla neierobežotu kampaņu pārvaldība strādājot komandā.",
        highlights: ["Admin/Manager vadības paneļi", "Kampaņu piešķiršana menedžeriem", "Menedžeru darba kontrole"],
        features: [
          "Viena sava vai AI konta pievienošana ar iespēju pievienot papildus kontus - 99/mēnesī par kontu",
          "Neierobežotas kampaņas ar AI kontroli",
          "Savu esošo kampaņu pievienošana AI kontrolei",
          "Reklāmas kampaņu AI ģenerators",
          "Pilnas rediģēšanas iespējas",
          "Eksports PDF, HTML, CSV, XLSX",
          "Eksports uz Google Ads kontu",
          "Neierobežotas reklāmas kampaņas ar AI kontroli",
          "Katras kampaņas 8 parametru pastāvīga kontrole",
          "AI ziņojums par situāciju un problēmu novēršana",
          "AI ieteikumi kampaņu uzlabošanai",
          "Pastāvīgs dienas budžeta monitorings",
          "Pastāvīga reklāmas pozīciju noteikšana",
          "Katra atslēgvārda iztērētais dienas budžets",
          "Detalizētu pārskatu veidošana par jebkuru periodu",
          "AI asistents",
        ],
      },
    ],
    []
  );

  function displayPrice(plan: Plan) {
    if (plan.priceType === "one_time") return { primary: `${formatUSD(plan.price)}`, secondary: "vienreiz" };
    if (billing === "monthly") return { primary: `${formatUSD(plan.price)}`, secondary: "/ mēn" };
    const yearly = plan.price * 12 * (1 - yearlyDiscount);
    return { primary: `${formatUSD(yearly)}`, secondary: "/ gadā" };
  }

  function getStripePlanKey(uiKey: UiPlanKey) {
    if (uiKey === "easy") return "easy";
    if (uiKey === "basic") return billing === "monthly" ? "basic_monthly" : "basic_yearly";
    if (uiKey === "pro") return billing === "monthly" ? "pro_monthly" : "pro_yearly";
    return billing === "monthly" ? "agency_monthly" : "agency_yearly";
  }

  function getCheckoutHref(uiKey: UiPlanKey) {
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
              <p style={{ marginTop: 10, marginBottom: 0, fontSize: 18, color: "#334155", maxWidth: 860, lineHeight: 1.55 }}>
                {heroSub}
              </p>
              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Pill>⚡ No URL līdz kampaņai</Pill>
                <Pill>🧠 AI + kampaņu struktūra</Pill>
                <Pill>📤 Kampaņu AI kontrole</Pill>
              </div>
            </div>

            {/* ✅ "Atpakaļ" virs slēdža */}
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
                ← Atpakaļ
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
                <span style={{ fontWeight: 900, color: billing === "yearly" ? "#111827" : "#64748b" }}>Gadā −20%</span>

                <button
                  onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
                  aria-label="Mainīt norēķinu periodu"
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

                <span style={{ fontWeight: 900, color: billing === "monthly" ? "#111827" : "#64748b" }}>Mēnesī</span>
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
                    Gada plāns: ietaupījums 20%
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
                  <div style={{ fontWeight: 900, color: "#2563eb", marginBottom: 4 }}>Rezultāts</div>
                  {p.outcome}
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>Iekļauts</div>
                  <ul style={{ paddingLeft: 18, margin: 0, color: "#111827", lineHeight: 1.55 }}>
                    {p.highlights.map((h) => (
                      <li key={h} style={{ marginBottom: 6 }}>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ✅ details katrai kartei atsevišķi */}
                <details
                  open={detailsOpen[p.key]}
                  onToggle={(e) => {
                    const isOpen = (e.currentTarget as HTMLDetailsElement).open;
                    setDetailsOpen((prev) => ({ ...prev, [p.key]: isOpen }));
                  }}
                  style={{ marginTop: 10 }}
                >
                  <summary style={{ cursor: "pointer", color: "#2563eb", fontWeight: 900 }}>
                    {detailsOpen[p.key] ? "▼ Aizvērt detaļas" : "▶ Skatīt detaļas"}
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

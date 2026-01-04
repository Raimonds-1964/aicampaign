"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "../components/Container";
import { TopBar } from "../components/TopBar";

type Plan = {
  key: "easy" | "basic" | "pro" | "agency";
  name: string;
  badge?: string;
  priceType: "one_time" | "monthly";
  price: number; // one-time vai mēneša
  ctaLabel: string;
  ctaKind: "link" | "signin";
  ctaHref?: string; // link gadījumam
  ctaHint?: string;

  // “Pārdošanas” saturs
  forWho: string;
  outcome: string;

  // īss, konkrēts “ko saņem”
  highlights: string[];

  // pārējās detaļas
  features: string[];
};

function formatEUR(n: number) {
  return `€${Math.round(n)}`;
}

function PricingButton(props: {
  label: string;
  kind: "link" | "signin";
  href?: string;
}) {
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

  if (props.kind === "link") {
    return (
      <a href={props.href || "/"} style={baseStyle}>
        {props.label}
      </a>
    );
  }

  // NextAuth default sign-in page
  return (
    <a href="/api/auth/signin" style={baseStyle}>
      {props.label}
    </a>
  );
}

function SectionTitle(props: { kicker?: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {props.kicker && (
        <div style={{ fontWeight: 900, color: "#2563eb", fontSize: 12, letterSpacing: 0.3 }}>
          {props.kicker}
        </div>
      )}
      <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", marginTop: 4 }}>
        {props.title}
      </div>
      {props.sub && (
        <div style={{ marginTop: 8, color: "#334155", lineHeight: 1.55, maxWidth: 820 }}>
          {props.sub}
        </div>
      )}
    </div>
  );
}

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [variant, setVariant] = useState<"A" | "B">("A");
  const yearlyDiscount = 0.2; // -20%

  const router = useRouter();
  function goBack() {
    // Uzvedība kā pārlūkprogrammā: atgriežas uz iepriekšējo lapu.
    // Ja vēsture nav pieejama (piem., atvērts jaunā tabā), ejam uz sākumu.
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  }

  // A/B hero copy (persisted per user)
  useEffect(() => {
    try {
      const key = "pricing_ab_variant";
      const existing = localStorage.getItem(key);
      if (existing === "A" || existing === "B") {
        setVariant(existing);
        return;
      }
      const v = Math.random() < 0.5 ? "A" : "B";
      localStorage.setItem(key, v);
      setVariant(v);
    } catch {}
  }, []);

  const heroTitle = "Izvēlies plānu, kas dod kontroli";
  const heroSub =
    variant === "A"
      ? "Šis nav tikai reklāmu tekstu ģenerators. Tu saņem sakārtotu Google Ads kampaņas struktūru (ad groups, atslēgvārdi, negatīvie vārdi, reklāmas) — gatavu rediģēšanai un eksportam."
      : "No mājaslapas URL līdz strukturētai Google Ads kampaņai — ar loģiku, ko vari pārņemt, labot un mērogot.";

  const paidCtaLabel = "Izvēlēties plānu";

  const plans: Plan[] = useMemo(
    () => [
      {
        key: "easy",
        name: "Easy",
        priceType: "one_time",
        price: 29,
        ctaLabel: "Sākt ar Easy",
        ctaKind: "link",
        ctaHref: "/demo",
        ctaHint: "Vienreizējs pirkums",
        forWho: "Vienai kampaņai ātram startam",
        outcome: "Saņem vienu sakārtotu kampaņu, ko var ielikt Google Ads ar minimālu darbu.",
        highlights: [
          "1 kampaņa ar loģisku struktūru",
          "Atslēgvārdi + negatīvie vārdi",
          "Reklāmu teksti, ko vari pielāgot",
        ],
        features: [
          "Viena Google Ads reklāmas kampaņa",
          "Atslēgvārdu ieteikumi",
          "Negatīvo atslēgvārdu ieteikumi",
          "Reklāmas tekstu ģenerēšana un rediģēšana",
          "Budžeta un iestatījumu ieteikumi",
          "Kampaņas struktūra (vienkārši un saprotami)",
          "PDF instrukcija pa soļiem",
          "Bez Google Ads konta savienošanas",
        ],
      },
      {
        key: "basic",
        name: "Basic",
        badge: "Vispopulārākais",
        priceType: "monthly",
        price: 49,
        ctaLabel: paidCtaLabel,
        ctaKind: "signin",
        ctaHint: "Līdz 3 kampaņām / mēn",
        forWho: "Uzņēmumiem un mārketinga speciālistiem",
        outcome:
          "Regulāri veido un uzlabo kampaņas ar skaidru struktūru — bez haosa un liekas manuālās būvēšanas.",
        highlights: [
          "Līdz 3 AI kampaņām mēnesī",
          "Eksports (PDF / CSV)",
          "Pārskati + pamat-analītika",
        ],
        features: [
          "Līdz 3 reklāmas kampaņu izveidošana ar AI",
          "Atslēgvārdu ieteikumi",
          "Negatīvo atslēgvārdu ieteikumi",
          "Reklāmas tekstu ģenerēšana un rediģēšana",
          "Budžeta un iestatījumu ieteikumi",
          "Vietnes saišu ģenerēšana",
          "Pārskatu ģenerācija (Impressions, Click, CPC)",
          "Personīgais kabinets",
          "AI atbalsts",
          "Eksports (PDF / CSV)",
        ],
      },
      {
        key: "pro",
        name: "Pro",
        priceType: "monthly",
        price: 99,
        ctaLabel: paidCtaLabel,
        ctaKind: "signin",
        ctaHint: "Līdz 10 kampaņām / mēn",
        forWho: "Profesionāļiem, kas grib pilnu kontroli",
        outcome:
          "Pilna darba plūsma: ģenerē → rediģē → analizē → eksportē. Piemērots nopietnam Google Ads darbam.",
        highlights: [
          "Līdz 10 AI kampaņām mēnesī",
          "Detalizēta analītika + ieteikumi",
          "Konversijas ieteikumi mājaslapai",
        ],
        features: [
          "Līdz 10 reklāmas kampaņu izveidošana ar AI",
          "Izveidots viens Google Ads konts ar kampaņu vai sava konta pievienošana",
          "Atslēgvārdu ieteikumi",
          "Negatīvo atslēgvārdu ieteikumi",
          "Reklāmas tekstu ģenerēšana un rediģēšana",
          "Budžeta un iestatījumu ieteikumi",
          "Vietnes saišu ģenerēšana",
          "Detalizēta pārskatu ģenerēšana",
          "AI analītika (CTR, CPC, konversiju analīze)",
          "AI ieteikumi uzlabojumiem (CTR/CPC)",
          "Mājaslapas analīze un ieteikumi labākai konversijai",
          "Eksports (PDF / CSV)",
          "Personīgais kabinets",
        ],
      },
      {
        key: "agency",
        name: "Agency",
        priceType: "monthly",
        price: 299,
        ctaLabel: paidCtaLabel,
        ctaKind: "signin",
        ctaHint: "Neierobežots apjoms",
        forWho: "Aģentūrām un komandām ar vairākiem kontiem",
        outcome:
          "Vienots standarts 10–200+ kontiem: struktūra, pārvaldība un komandas darbs vienuviet.",
        highlights: [
          "Neierobežotas kampaņas",
          "MCC / vairāki konti",
          "Komanda + klientu pārvaldība",
        ],
        features: [
          "Neierobežoti Google Ads konti (MCC)",
          "Savu kontu pievienošana",
          "Neierobežots kampaņu skaits",
          "Klientu pārvaldība (vienā vietā)",
          "Komandas piekļuve",
          "White-label pārskati (PDF) (draft)",
          "Kampaņu šabloni aģentūras darbam",
          "Prioritārs atbalsts",
          "Onboarding / uzstādīšanas palīdzība",
          "Paplašināti iestatījumi un darba plūsma",
        ],
      },
    ],
    []
  );

  function displayPrice(plan: Plan) {
    if (plan.priceType === "one_time") {
      return { primary: `${formatEUR(plan.price)}`, secondary: "vienreiz" };
    }

    if (billing === "monthly") {
      return { primary: `${formatEUR(plan.price)}`, secondary: "/ mēn" };
    }

    // yearly
    const yearly = plan.price * 12 * (1 - yearlyDiscount);
    return { primary: `${formatEUR(yearly)}`, secondary: "/ gadā" };
  }

  return (
    <Container style={{ paddingTop: 46, paddingBottom: 70, fontFamily: "Arial, sans-serif", color: "#0f172a" }}>
      <main>
        <TopBar active="pricing" />

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
          <h1 style={{ margin: 0, fontSize: 40, fontWeight: 900, letterSpacing: -0.4 }}>
            {heroTitle}
          </h1>

          <p
            style={{
              marginTop: 10,
              marginBottom: 0,
              fontSize: 18,
              fontWeight: 400,
              color: "#334155",
              maxWidth: 860,
              lineHeight: 1.55,
            }}
          >
            {heroSub}
          </p>

          {/* Billing toggle */}
          <div
            style={{
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
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
              <span
                style={{
                  fontWeight: 900,
                  color: billing === "yearly" ? "#111827" : "#64748b",
                }}
              >
                Gadā −20%
              </span>

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

              <span
                style={{
                  fontWeight: 900,
                  color: billing === "monthly" ? "#111827" : "#64748b",
                }}
              >
                Mēnesī
              </span>
            </div>

            <div style={{ marginLeft: "auto" }}>
              <button
              type="button"
              onClick={goBack}
              style={{
                color: "#2563eb",
                textDecoration: "none",
                fontWeight: 900,
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            >
              ← Atpakaļ
            </button>
            </div>
          </div>

          {/* Trust microline */}
          <div style={{ marginTop: 14, color: "#475569", fontWeight: 800 }}>
            30 dienu garantija — 100% atmaksa
          </div>
        </section>

        {/* Kā izvēlēties */}
        <section style={{ marginTop: 18, marginBottom: 8 }}>
          <SectionTitle
            kicker="ĀTRS VADLĪNIJS"
            title="Kuru plānu izvēlēties?"
            sub="Ja tev vajag vienu kampaņu ātram startam — Easy. Ja regulāri veido kampaņas uzņēmumam — Basic. Ja strādā profesionāli ar analītiku un optimizāciju — Pro. Ja pārvaldi daudzus kontus — Agency."
          />
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
                  boxShadow: isPopular
                    ? "0 10px 30px rgba(37,99,235,0.12)"
                    : "0 6px 20px rgba(15,23,42,0.06)",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 560,
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
                      letterSpacing: 0.2,
                    }}
                  >
                    {p.badge}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 22 }}>{p.name}</h3>
                  {p.ctaHint && (
                    <div style={{ color: "#64748b", fontWeight: 800, fontSize: 13 }}>
                      {p.ctaHint}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 10, color: "#334155", fontWeight: 900, fontSize: 13 }}>
                  {p.forWho}
                </div>

                <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 8 }}>
                  <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: -0.5 }}>
                    {price.primary}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#64748b" }}>
                    {price.secondary}
                  </div>
                </div>

                {p.priceType === "monthly" && billing === "yearly" && (
                  <div style={{ marginTop: 6, color: "#16a34a", fontWeight: 900, fontSize: 13 }}>
                    Ietaupīsi 20% ar gada plānu
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
                  <div style={{ fontWeight: 900, color: "#2563eb", marginBottom: 4 }}>
                    Rezultāts
                  </div>
                  {p.outcome}
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>
                    Iekļauts
                  </div>
                  <ul style={{ paddingLeft: 18, margin: 0, color: "#111827", lineHeight: 1.55 }}>
                    {p.highlights.map((h) => (
                      <li key={h} style={{ marginBottom: 6 }}>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                <details style={{ marginTop: 10 }}>
                  <summary style={{ cursor: "pointer", color: "#2563eb", fontWeight: 900 }}>
                    Skatīt visas detaļas
                  </summary>
                  <ul
                    style={{
                      marginTop: 10,
                      paddingLeft: 18,
                      color: "#111827",
                      lineHeight: 1.55,
                    }}
                  >
                    {p.features.map((f) => (
                      <li key={f} style={{ marginBottom: 7 }}>
                        {f}
                      </li>
                    ))}
                  </ul>
                </details>

                <div style={{ marginTop: "auto" }}>
                  <div style={{ marginTop: 14 }}>
                    <PricingButton label={p.ctaLabel} kind={p.ctaKind} href={p.ctaHref} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Bottom reassurance */}
        <section
          style={{
            marginTop: 22,
            borderRadius: 18,
            border: "1px solid #e5e7eb",
            background: "white",
            padding: "18px 18px",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            <div>
              <div style={{ fontWeight: 900, color: "#0f172a" }}>Kāpēc tas ir vērtīgi</div>
              <div style={{ marginTop: 6, color: "#334155", lineHeight: 1.55 }}>
                Ietaupa stundas (dažreiz dienas) uz struktūras veidošanu un samazina kļūdas, kas Google Ads maksā naudu.
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 900, color: "#0f172a" }}>Eksports un kontrole</div>
              <div style={{ marginTop: 6, color: "#334155", lineHeight: 1.55 }}>
                Tu redzi un kontrolē kampaņas loģiku — nevis saņem “melno kasti”. Rediģē un eksportē, kad esi gatavs.
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 900, color: "#0f172a" }}>Garantija</div>
              <div style={{ marginTop: 6, color: "#334155", lineHeight: 1.55 }}>
                30 dienu garantija — ja nav vērtība, atgriežam naudu.
              </div>
            </div>
          </div>
        </section>

        <div style={{ marginTop: 18, color: "#94a3b8", fontSize: 12 }}>
          Šī vietne nav pievienota vai saistīta ar Google LLC. Visi Google zīmoli ir Google LLC īpašums.
        </div>
      </main>
    </Container>
  );
}
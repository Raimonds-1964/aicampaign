"use client";

import Link from "next/link";

export default function HomePage() {
  const ctaBtn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "14px 14px",
    borderRadius: 14,
    background: "#1d4ed8", // slightly darker, less “glossy”
    color: "white",
    fontWeight: 900,
    fontSize: 16,
    textDecoration: "none",
    border: "1px solid rgba(29,78,216,0.35)",
    boxShadow: "0 10px 22px rgba(29,78,216,0.14)",
    cursor: "pointer",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
  };

  const ctaBtnSecondary: React.CSSProperties = {
    ...ctaBtn,
    background: "#ffffff",
    color: "#1d4ed8",
    border: "1px solid rgba(29,78,216,0.35)",
    boxShadow: "0 10px 22px rgba(15,23,42,0.06)",
  };

  return (
    <main
      style={{
        paddingBottom: 80,
        fontFamily: "Arial, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* HERO */}
      <section style={{ marginTop: 18 }}>
        <div
          style={{
            padding: "56px 48px",
            borderRadius: 28,
            background:
              "radial-gradient(1200px 520px at 18% 0%, rgba(124,58,237,0.10), transparent 55%), radial-gradient(900px 460px at 85% 15%, rgba(37,99,235,0.10), transparent 60%), #f8fafc",
            border: "1px solid #eef2f7",
          }}
        >
          <h1
            style={{
              fontSize: 42,
              lineHeight: 1.05,
              fontWeight: 900,
              maxWidth: 980,
              margin: "0 auto 18px",
              color: "#0f172a",
              letterSpacing: -0.6,
              textAlign: "center",
            }}
          >
            From a website URL to a complete Google Ads campaign - in minutes
          </h1>

          <p
            style={{
              fontSize: 26,
              maxWidth: 900,
              color: "#334155",
              margin: "0 auto 26px",
              lineHeight: 1.55,
              textAlign: "center",
              fontWeight: 800,
            }}
          >
            You don’t need to be a Google Ads expert - AI does the heavy lifting
          </p>

          <p
            style={{
              fontSize: 20,
              maxWidth: 900,
              color: "#334155",
              margin: "0 auto 26px",
              lineHeight: 1.55,
              textAlign: "center",
            }}
          >
            AI Google Ads is a platform that turns publicly available website content into a structured
            Google Ads account setup - campaigns, ad copy, and keywords - plus an optional control system
            with AI monitoring and optimization recommendations.
          </p>

          <div
            style={{
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
              fontWeight: 800,
              fontSize: 16,
              color: "#334155",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <div>⚡ From URL to launch-ready structure</div>
            <div>🧠 AI + Google Ads account structure</div>
            <div>🏢 Built for businesses and agencies</div>
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section style={{ marginTop: 32 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 28,
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>Business owners</div>
            <p style={{ marginTop: 8, color: "#334155", lineHeight: 1.55 }}>
              A clean Google Ads structure without an agency - start with a solid foundation for performance.
            </p>
          </div>

          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>Marketers</div>
            <p style={{ marginTop: 8, color: "#334155", lineHeight: 1.55 }}>
              Simple campaign control you can test, iterate, and improve quickly.
            </p>
          </div>

          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>Agencies</div>
            <p style={{ marginTop: 8, color: "#334155", lineHeight: 1.55 }}>
              A management system built for dozens (or hundreds) of Google Ads campaigns.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ marginTop: 28 }}>
        <div
          style={{
            display: "flex",
            gap: 38,
            flexWrap: "wrap",
            fontSize: 16,
            fontWeight: 900,
            color: "#334155",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div>
            <span style={{ color: "#2563eb" }}>1.</span> Enter your website URL
          </div>
          <div>
            <span style={{ color: "#2563eb" }}>2.</span> AI builds the campaign structure
          </div>
          <div>
            <span style={{ color: "#2563eb" }}>3.</span> Get a Google Ads-ready setup to review and apply
          </div>
        </div>
      </section>

      {/* CTA BLOCK (TWO ROWS) */}
      <section style={{ marginTop: 32 }}>
        <div
          style={{
            padding: "36px 48px",
            borderRadius: 24,
            background:
              "radial-gradient(1200px 520px at 18% 0%, rgba(124,58,237,0.06), transparent 55%), radial-gradient(900px 460px at 85% 15%, rgba(37,99,235,0.06), transparent 60%), #fbfdff",
            border: "1px solid #eef2f7",
          }}
        >
          {/* ROW 1 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 280px",
              gap: 24,
              alignItems: "center",
              marginBottom: 28,
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>
              Start with a free sample - no sign-in and no card required
            </div>

            <div>
              <Link href="/dashboard/ai" style={ctaBtn}>
                Try it free
              </Link>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: "#64748b",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                Your first sample in ~10 seconds
              </div>
            </div>
          </div>

          {/* ROW 2 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 280px",
              gap: 24,
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>
              Or choose the plan that fits your workflow
            </div>

            <div>
              <Link href="/pricing" style={ctaBtnSecondary}>
                View plans
              </Link>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: "#64748b",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                Plans for businesses, marketers, and agencies
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 860px) {
          section :global(div[style*="grid-template-columns: 1fr 280px"]) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

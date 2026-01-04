"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{
        marginTop: 46,
        borderTop: "1px solid #eef2f7",
        paddingTop: 26,
        paddingBottom: 30,
        color: "#334155",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 22,
          alignItems: "start",
        }}
      >
        {/* Brand + short value */}
        <div>
          <div style={{ fontWeight: 900, color: "#0f172a", fontSize: 16 }}>
            AI Google Ads
          </div>
          <div style={{ marginTop: 8, lineHeight: 1.55, maxWidth: 360 }}>
            No mājaslapas URL līdz strukturētai Google Ads kampaņai — ar loģiku, ko vari pārņemt,
            rediģēt un eksportēt.
          </div>
          <div style={{ marginTop: 12 }}>
            <Link
              href="/dashboard/ai"
              style={{
                display: "inline-block",
                padding: "10px 14px",
                borderRadius: 14,
                background: "rgba(37,99,235,0.10)",
                border: "1px solid rgba(37,99,235,0.35)",
                color: "#2563eb",
                fontWeight: 900,
                textDecoration: "none",
              }}
            >
              Izmēģināt paraugu
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <div style={{ fontWeight: 900, color: "#0f172a" }}>Navigācija</div>
          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            <Link href="/" style={{ color: "#334155", textDecoration: "none", fontWeight: 800 }}>
              Sākums
            </Link>
            <Link
              href="/pricing"
              style={{ color: "#334155", textDecoration: "none", fontWeight: 800 }}
            >
              Cenas
            </Link>
            <Link
              href="/#par-mums"
              style={{ color: "#334155", textDecoration: "none", fontWeight: 800 }}
            >
              Par mums
            </Link>
            <Link
              href="/#kontakti"
              style={{ color: "#334155", textDecoration: "none", fontWeight: 800 }}
            >
              Kontakti
            </Link>
          </div>
        </div>

        {/* Legal */}
        <div>
          <div style={{ fontWeight: 900, color: "#0f172a" }}>Informācija</div>
          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            <Link
              href="/#noteikumi"
              style={{ color: "#334155", textDecoration: "none", fontWeight: 800 }}
            >
              Noteikumi
            </Link>
            <Link
              href="/#privatums"
              style={{ color: "#334155", textDecoration: "none", fontWeight: 800 }}
            >
              Privātums
            </Link>
            <Link
              href="/#atmaksa"
              style={{ color: "#334155", textDecoration: "none", fontWeight: 800 }}
            >
              Atmaksa
            </Link>
          </div>
        </div>

        {/* Contacts */}
        <div>
          <div style={{ fontWeight: 900, color: "#0f172a" }}>Kontakti</div>
          <div style={{ marginTop: 10, lineHeight: 1.7 }}>
            <div>
              <span style={{ fontWeight: 900, color: "#0f172a" }}>E-pasts:</span>{" "}
              <a
                href="mailto:hello@aigoogleads.ai"
                style={{ color: "#2563eb", textDecoration: "none", fontWeight: 800 }}
              >
                hello@aigoogleads.ai
              </a>
            </div>
            <div style={{ marginTop: 6 }}>
              <span style={{ fontWeight: 900, color: "#0f172a" }}>Darba laiks:</span>{" "}
              P–Pk 10:00–18:00
            </div>
            <div style={{ marginTop: 10, color: "#64748b", fontSize: 12 }}>
              Ja vēlies “Agency” sadarbību vai vairāku kontu uzstādīšanu — uzraksti, un iedosim īsu
              demo.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          marginTop: 22,
          paddingTop: 14,
          borderTop: "1px solid #eef2f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
          color: "#64748b",
          fontSize: 12,
          fontWeight: 800,
        }}
      >
        <div>© {new Date().getFullYear()} AI Google Ads</div>
        <div style={{ maxWidth: 760 }}>
          Šī vietne nav pievienota vai saistīta ar Google LLC. Visi Google zīmoli ir Google LLC
          īpašums.
        </div>
      </div>
    </footer>
  );
}

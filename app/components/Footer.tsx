"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{
        marginTop: 46,
        paddingBottom: 0,
        // ✅ noņemam full-width triku
        width: "100%",
        background: "transparent",
      }}
    >
      {/* ✅ fons tagad ir tikai šai “kastei” (1200) */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "30px 18px 34px",
          background: "#f8fafc",
          borderRadius: 22,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 22,
            alignItems: "start",
            color: "#334155",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div>
            <div style={{ fontWeight: 900, color: "#0f172a", fontSize: 16 }}>
              AI Google Ads
            </div>
            <div style={{ marginTop: 8, lineHeight: 1.55, maxWidth: 360 }}>
              No mājaslapas URL līdz strukturētai Google Ads kampaņai — ar loģiku, ko vari pārņemt,
              rediģēt un eksportēt.
            </div>
          </div>

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
                href="/par-mums"
                style={{ color: "#334155", textDecoration: "none", fontWeight: 800 }}
              >
                Par mums
              </Link>
              <Link
                href="/kontakti"
                style={{ color: "#334155", textDecoration: "none", fontWeight: 800 }}
              >
                Kontakti
              </Link>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 900, color: "#0f172a" }}>Informācija</div>
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              <Link
                href="/noteikumi"
                style={{ color: "#334155", textDecoration: "none", fontWeight: 800 }}
              >
                Noteikumi
              </Link>
              <Link
                href="/privatums"
                style={{ color: "#334155", textDecoration: "none", fontWeight: 800 }}
              >
                Privātums
              </Link>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 900, color: "#0f172a" }}>Kontakti</div>
            <div style={{ marginTop: 10, lineHeight: 1.7 }}>
              <div>
                <span style={{ fontWeight: 900, color: "#0f172a" }}>E-pasts:</span>{" "}
                <a
                  href="mailto:mediatelecom@inbox.lv"
                  style={{ color: "#2563eb", textDecoration: "none", fontWeight: 800 }}
                >
                  mediatelecom@inbox.lv
                </a>
              </div>
              <div style={{ marginTop: 6 }}>
                <span style={{ fontWeight: 900, color: "#0f172a" }}>Atbalsts:</span> 24/7
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 22,
            paddingTop: 14,
            display: "grid",
            gap: 8,
            justifyItems: "center",
            textAlign: "center",
            color: "#64748b",
            fontSize: 12,
            fontWeight: 800,
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div>© {new Date().getFullYear()} AI Google Ads</div>
          <div style={{ maxWidth: 760 }}>
            Šī vietne nav pievienota vai saistīta ar Google LLC. Visi Google zīmoli ir Google LLC īpašums.
          </div>
        </div>
      </div>
    </footer>
  );
}

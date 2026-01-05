import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kontakti | AI Google Ads",
  description: "Sazinies ar AI Google Ads atbalstu – e-pasts, tālrunis un juridiskā informācija.",
};

export default function KontaktiPage() {
  return (
    <main style={{ padding: "18px 0 80px", fontFamily: "Arial, sans-serif" }}>
      {/* HERO */}
      <section>
        <div
          style={{
            padding: "40px 36px",
            borderRadius: 24,
            background:
              "radial-gradient(1200px 520px at 18% 0%, rgba(37,99,235,0.10), transparent 55%), radial-gradient(900px 460px at 85% 15%, rgba(124,58,237,0.08), transparent 60%), #f8fafc",
            border: "1px solid #eef2f7",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 36,
              lineHeight: 1.1,
              fontWeight: 900,
              color: "#0f172a",
              letterSpacing: -0.4,
            }}
          >
            Kontakti
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              fontSize: 18,
              lineHeight: 1.6,
              color: "#334155",
              maxWidth: 900,
            }}
          >
            Jautājumi par produktu, apmaksu vai izmantošanu? Raksti vai zvani – atbildēsim pēc iespējas ātri.
          </p>
        </div>
      </section>

      {/* CONTACT CARDS */}
      <section style={{ marginTop: 22 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          <div
            style={{
              padding: "18px 18px",
              borderRadius: 18,
              background: "#ffffff",
              border: "1px solid #eef2f7",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>E-pasts</div>
            <div style={{ marginTop: 8, color: "#334155", fontWeight: 700, lineHeight: 1.6 }}>
              <a href="mailto:mediatelecom@inbox.lv" style={{ color: "#2563eb", textDecoration: "none" }}>
                mediatelecom@inbox.lv
              </a>
            </div>
            <div style={{ marginTop: 8, color: "#64748b", fontSize: 13, fontWeight: 700 }}>
              Atbalsts: 24/7
            </div>
          </div>

          <div
            style={{
              padding: "18px 18px",
              borderRadius: 18,
              background: "#ffffff",
              border: "1px solid #eef2f7",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>Tālrunis</div>
            <div style={{ marginTop: 8, color: "#334155", fontWeight: 700, lineHeight: 1.6 }}>
              <a href="tel:+37129444795" style={{ color: "#2563eb", textDecoration: "none" }}>
                +371 29444795
              </a>
            </div>
            <div style={{ marginTop: 8, color: "#64748b", fontSize: 13, fontWeight: 700 }}>
              Ja neatbildam uzreiz – atzvanīsim.
            </div>
          </div>

          <div
            style={{
              padding: "18px 18px",
              borderRadius: 18,
              background: "#ffffff",
              border: "1px solid #eef2f7",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>Uzņēmums</div>
            <div style={{ marginTop: 8, color: "#334155", fontWeight: 700, lineHeight: 1.6 }}>
              World Union, SIA
              <br />
              Reģ. Nr. 40203628481
            </div>
          </div>
        </div>
      </section>

      {/* ADDRESS + LINKS */}
      <section style={{ marginTop: 16 }}>
        <div
          style={{
            padding: "18px 18px",
            borderRadius: 18,
            background: "#ffffff",
            border: "1px solid #eef2f7",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>Juridiskā adrese</div>
          <div style={{ marginTop: 8, color: "#334155", fontWeight: 700, lineHeight: 1.6 }}>
            Ozolu iela 13, Dreiliņi, Stopiņu pag., Ropažu nov., Latvija
          </div>

          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Link
              href="/noteikumi"
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #cbd5e1",
                textDecoration: "none",
                color: "#0f172a",
                fontWeight: 900,
              }}
            >
              Noteikumi
            </Link>
            <Link
              href="/privatums"
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #cbd5e1",
                textDecoration: "none",
                color: "#0f172a",
                fontWeight: 900,
              }}
            >
              Privātuma politika
            </Link>
          </div>
        </div>
      </section>

      {/* OPTIONAL MESSAGE BOX (no backend, just UI) */}
      <section style={{ marginTop: 16 }}>
        <div
          style={{
            padding: "18px 18px",
            borderRadius: 18,
            background:
              "radial-gradient(900px 420px at 20% 0%, rgba(37,99,235,0.07), transparent 55%), #fbfdff",
            border: "1px solid #eef2f7",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>Ātrā saziņa</div>
          <p style={{ margin: "8px 0 0", color: "#334155", lineHeight: 1.6, fontWeight: 700 }}>
            Ērtākais veids: uzraksti uz e-pastu. Ja vēlies, vari pievienot: mājaslapas URL, nozari un mērķi
            (pieteikumi / zvani / pirkumi).
          </p>

          <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href="mailto:mediatelecom@inbox.lv?subject=AI%20Google%20Ads%20-%20Jaut%C4%81jums"
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                background: "#2563eb",
                color: "white",
                textDecoration: "none",
                fontWeight: 900,
              }}
            >
              Rakstīt e-pastu
            </a>

            <a
              href="tel:+37129444795"
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid #cbd5e1",
                color: "#0f172a",
                textDecoration: "none",
                fontWeight: 900,
                background: "white",
              }}
            >
              Zvanīt
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

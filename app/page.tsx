import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ paddingBottom: 80, fontFamily: "Arial, sans-serif" }}>
      {/* ✅ BUILD MARKER (neapstrīdams tests) */}
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
          fontFamily: "Arial",
        }}
      >
        BUILD MARKER: 2026-01-08
      </div>

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
              margin: "0 0 18px",
              color: "#0f172a",
              letterSpacing: -0.6,
            }}
          >
            No mājaslapas URL līdz pilnai Google Ads reklāmas kampaņai – dažu minūšu laikā
          </h1>

          <p
            style={{
              fontSize: 20,
              maxWidth: 900,
              color: "#334155",
              margin: "0 0 26px",
              lineHeight: 1.55,
            }}
          >
            Platforma, kas no publiska mājaslapas satura izveido strukturētu Google Ads kampaņu – ar
            kampaņām, ad grupām, reklāmu tekstiem un atslēgvārdiem. Pilna kontrole bez aģentūras.
          </p>

          <div
            style={{
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
              fontWeight: 800,
              fontSize: 16,
              color: "#334155",
            }}
          >
            <div>⚡ No URL līdz gatavai kampaņai</div>
            <div>🧠 AI + Google Ads struktūra</div>
            <div>🏢 Uzņēmumiem un aģentūrām</div>
          </div>
        </div>
      </section>

      {/* KAM PAREDZĒTS */}
      <section style={{ marginTop: 32 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 28,
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>Uzņēmumiem</div>
            <p style={{ marginTop: 8, color: "#334155", lineHeight: 1.55 }}>
              Sakārtota Google Ads struktūra bez aģentūras – skaidrs pamats efektīvai reklāmai.
            </p>
          </div>

          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>
              Mārketinga speciālistiem
            </div>
            <p style={{ marginTop: 8, color: "#334155", lineHeight: 1.55 }}>
              Atkārtojama kampaņu loģika, ko viegli testēt un uzlabot.
            </p>
          </div>

          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>Reklāmas aģentūrām</div>
            <p style={{ marginTop: 8, color: "#334155", lineHeight: 1.55 }}>
              Mērogojama sistēma desmitiem vai simtiem Google Ads kontu.
            </p>
          </div>
        </div>
      </section>

      {/* KĀ TAS STRĀDĀ */}
      <section style={{ marginTop: 28 }}>
        <div
          style={{
            display: "flex",
            gap: 38,
            flexWrap: "wrap",
            fontSize: 16,
            fontWeight: 900,
            color: "#334155",
          }}
        >
          <div>
            <span style={{ color: "#2563eb" }}>1.</span> Ievadi mājaslapas URL
          </div>
          <div>
            <span style={{ color: "#2563eb" }}>2.</span> AI izveido kampaņu struktūru
          </div>
          <div>
            <span style={{ color: "#2563eb" }}>3.</span> Eksportē uz Google Ads
          </div>
        </div>
      </section>

      {/* CTA BLOKS AR DIVĀM RINDĀM (izmēģināt + skatīt plānus) */}
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
          {/* RINDA 1 */}
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
              Sāc ar bezmaksas paraugu – bez pieslēgšanās un kartes
            </div>

            <div>
              <Link
                href="/demo"
                style={{
                  display: "block",
                  width: "100%",
                  padding: "16px 0",
                  borderRadius: 14,
                  background: "#2563eb",
                  color: "white",
                  fontWeight: 800,
                  fontSize: 17,
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                Izmēģināt bez maksas
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
                10 sekundes līdz pirmajam paraugam
              </div>
            </div>
          </div>

          {/* RINDA 2 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 280px",
              gap: 24,
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>
              Vai uzreiz izvēlies sev piemērotāko piedāvājuma plānu
            </div>

            <div>
              <Link
                href="/pricing"
                style={{
                  display: "block",
                  width: "100%",
                  padding: "16px 0",
                  borderRadius: 14,
                  background: "#2563eb",
                  color: "white",
                  fontWeight: 800,
                  fontSize: 17,
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                Skatīt piedāvājuma plānus
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
                Plāni uzņēmumiem, speciālistiem un aģentūrām
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

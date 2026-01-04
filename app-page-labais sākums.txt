import Link from "next/link";
import { TopBar } from "./components/TopBar";
import { Container } from "./components/Container";

export default function HomePage() {
  return (
    <main style={{ paddingBottom: 80, fontFamily: "Arial, sans-serif" }}>
      <div style={{ paddingTop: 26 }}>
        <Container>
          <TopBar active="home" />
        </Container>
      </div>

      {/* HERO */}
      <section
        style={{
          marginTop: 18,
        }}
      >
        <Container>
          <div
            style={{
              padding: "clamp(28px, 6vw, 56px) clamp(16px, 4vw, 48px)",
              borderRadius: 28,
              background:
                "radial-gradient(1200px 520px at 18% 0%, rgba(124,58,237,0.10), transparent 55%), radial-gradient(900px 460px at 85% 15%, rgba(37,99,235,0.10), transparent 60%), #f8fafc",
              border: "1px solid #eef2f7",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(30px, 4.5vw, 42px)",
                lineHeight: 1.05,
                fontWeight: 900,
                maxWidth: 980,
                margin: "0 0 18px",
                color: "#0f172a",
                letterSpacing: -0.6,
              }}
            >
              No mājaslapas URL līdz pilnai Google Ads reklāmas kampaņai - dažu
              minūšu laikā
            </h1>

            <p
              style={{
                fontSize: "clamp(16px, 2.2vw, 20px)",
                maxWidth: 900,
                color: "#334155",
                margin: "0 0 26px",
                lineHeight: 1.55,
              }}
            >
              Mūsu platforma ir ne tikai reklāmas teksti, bet sistēma: no URL
              izveido strukturētu kampaņu ar atslēgvārdiem, reklāmām un loģiku
              vienuviet. Piemērota gan uzņēmumiem, gan reklāmas aģentūrām - no
              viena konta līdz simtiem.
            </p>

            {/* 3 USP */}
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
              <div>🧠 AI + strukturēta Google Ads loģika</div>
              <div>🏢 Visiem uzņēmumiem un aģentūrām</div>
            </div>

            {/* NOTE: Hero pogas noņemtas pēc prasības */}
          </div>
        </Container>
      </section>

      {/* KAM DOMĀTS (3 kolonnas) */}
      <section style={{ marginTop: 26 }}>
        <Container>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 28,
            }}
          >
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>
                Uzņēmumiem
              </div>
              <p style={{ marginTop: 8, color: "#334155", lineHeight: 1.55 }}>
                Sakārtota Google Ads kampaņu struktūra bez aģentūras - skaidrs
                pamats efektīvai reklāmai.
              </p>
            </div>

            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>
                Mārketinga speciālistiem
              </div>
              <p style={{ marginTop: 8, color: "#334155", lineHeight: 1.55 }}>
                Vienota kampaņu veidošanas loģika, ko viegli testēt, uzlabot un
                atkārtot.
              </p>
            </div>

            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>
                Reklāmas aģentūrām
              </div>
              <p style={{ marginTop: 8, color: "#334155", lineHeight: 1.55 }}>
                Mērogojama sistēma desmitiem vai simtiem Google Ads kontu
                pārvaldībai ar AI palīdzību.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Kā tas strādā (1–2–3) */}
      <section style={{ marginTop: 28 }}>
        <Container>
          <div
            style={{
              display: "flex",
              gap: 18,
              rowGap: 14,
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
              <span style={{ color: "#2563eb" }}>2.</span> AI izveido kampaņas
              struktūru un reklāmas
            </div>
            <div>
              <span style={{ color: "#2563eb" }}>3.</span> Tu saņem Google Ads
              kontu ar gatavu kampaņu
            </div>
          </div>
        </Container>
      </section>

      {/* Apakšējais CTA */}
      <section style={{ marginTop: 26 }}>
        <Container>
          <div
            style={{
              padding: "clamp(22px, 5vw, 36px) clamp(16px, 4vw, 48px)",
              borderRadius: 24,
              background:
                "radial-gradient(1200px 520px at 18% 0%, rgba(124,58,237,0.06), transparent 55%), radial-gradient(900px 460px at 85% 15%, rgba(37,99,235,0.06), transparent 60%), #fbfdff",
              border: "1px solid #eef2f7",
            }}
          >
            {/* CTA ROW 1 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 24,
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>
                Sāc ar bezmaksas paraugu bez pieslēgšanās un kartes
              </div>

              <div style={{ maxWidth: 320, width: "100%" }}>
                <Link
                  href="/dashboard/ai"
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

            {/* CTA ROW 2 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 24,
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>
                Vai uzreiz izvēlies sev piemērotāko piedāvājuma plānu
              </div>

              <div style={{ maxWidth: 320, width: "100%" }}>
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
        </Container>
      </section>
    </main>
  );
}

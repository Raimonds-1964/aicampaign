import { Container } from "../components/Container";
import { TopBar } from "../components/TopBar";

export default function Page() {
  return (
    <Container style={{ paddingTop: 46, paddingBottom: 70, fontFamily: "Arial, sans-serif", color: "#0f172a" }}>
      <main>
        <TopBar active="other" />

        <section style={{ maxWidth: 860 }}>
          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 900, letterSpacing: -0.3 }}>
            Noteikumi
          </h1>
          <p style={{ marginTop: 10, color: "#334155", lineHeight: 1.6 }}>
            Šajā lapā būs pakalpojuma lietošanas noteikumi, atbildība un atmaksas nosacījumi.
          </p>

          <div
            style={{
              marginTop: 18,
              borderRadius: 18,
              background: "#f8fafc",
              padding: "16px 16px",
              color: "#64748b",
              lineHeight: 1.6,
              fontWeight: 700,
            }}
          >
            Saturs tiks pievienots nākamajā solī.
          </div>
        </section>
      </main>
    </Container>
  );
}

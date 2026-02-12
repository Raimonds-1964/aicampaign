import { Container } from "../components/Container";

export default function Page() {
  return (
    <Container
      style={{
        paddingTop: 46,
        paddingBottom: 70,
        fontFamily: "Arial, sans-serif",
        color: "#0f172a",
      }}
    >
      <main>
        <section style={{ maxWidth: 860 }}>
          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 900, letterSpacing: -0.3 }}>
            About Us
          </h1>

          <p style={{ marginTop: 12, color: "#334155", lineHeight: 1.7 }}>
            <strong>AI Google Ads</strong> is an online platform built to help you plan and organize
            Google Ads campaigns faster. It uses publicly available website content to draft a clear,
            structured setup—campaign structure (ad groups), keyword ideas, negative keywords, and ad copy.
          </p>

          <p style={{ marginTop: 12, color: "#334155", lineHeight: 1.7 }}>
            We don’t operate as a “black box.” Everything is transparent and editable, so you keep full
            control and can tailor the output to your offer, budget, and goals.
          </p>

          <p style={{ marginTop: 12, color: "#334155", lineHeight: 1.7 }}>
            AI Google Ads is not affiliated with Google LLC and is not an official Google product.
            Google and related marks are trademarks of their respective owners.
          </p>

          <h2 style={{ marginTop: 28, fontSize: 22, fontWeight: 900 }}>
            Who it’s for
          </h2>

          <ul style={{ marginTop: 10, paddingLeft: 18, lineHeight: 1.7 }}>
            <li>
              <strong>Businesses</strong> — launch faster without relying on an agency.
            </li>
            <li>
              <strong>Marketers</strong> — repeatable workflows with less manual work.
            </li>
            <li>
              <strong>Agencies</strong> — consistent account structure and collaboration across teams.
            </li>
          </ul>

          <h2 style={{ marginTop: 28, fontSize: 22, fontWeight: 900 }}>
            How it works
          </h2>

          <ol style={{ marginTop: 10, paddingLeft: 18, lineHeight: 1.7 }}>
            <li>Enter a website URL.</li>
            <li>The system analyzes publicly available content.</li>
            <li>It generates a structured campaign draft and ad recommendations.</li>
            <li>You review, edit, and apply the results in your Google Ads account.</li>
          </ol>

          <div
            style={{
              marginTop: 32,
              borderRadius: 18,
              background: "#f8fafc",
              padding: "18px 18px",
              lineHeight: 1.7,
            }}
          >
            <strong>Service Provider</strong>
            <br />
            AI Google Ads, Inc.
            <br />
            (Company details will be published here.)
            <br />
            <br />

            <strong>Contact</strong>
            <br />
            Email: support@aicampaign.app
            <br />
            Support availability: 24/7
          </div>
        </section>
      </main>
    </Container>
  );
}

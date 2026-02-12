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
      <h1 style={{ fontSize: 34, fontWeight: 900, margin: "0 0 16px" }}>
        Terms
      </h1>

      <section style={{ maxWidth: 860 }}>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 900, letterSpacing: -0.3 }}>
          Terms of Service
        </h1>

        <p style={{ marginTop: 14, color: "#334155", lineHeight: 1.7 }}>
          These Terms of Service govern access to and use of the online service{" "}
          <strong>AI Google Ads</strong> (the “Service”). By using the Service, you
          acknowledge that you have read, understood, and agree to be bound by these terms.
        </p>

        <h2 style={{ marginTop: 26, fontSize: 22, fontWeight: 900 }}>
          1. Service Provider
        </h2>

        <p style={{ color: "#334155", lineHeight: 1.7 }}>
          The Service is provided by the Company operating the AI Google Ads platform
          (“Company”). Official company details will be published on this page.
        </p>

        <h2 style={{ marginTop: 26, fontSize: 22, fontWeight: 900 }}>
          2. Service Description
        </h2>

        <p style={{ color: "#334155", lineHeight: 1.7 }}>
          AI Google Ads is a software platform designed to assist with the analysis,
          control, and management of Google Ads accounts and campaigns. The Service may
          provide insights, recommendations, automation support, and AI-assisted outputs
          related to campaign structure, ad assets, keywords, budgets, and performance.
        </p>

        <p style={{ color: "#334155", lineHeight: 1.7 }}>
          The Service does not guarantee advertising performance, results, conversions,
          or compliance outcomes. AI-generated suggestions and recommendations are provided
          for informational purposes only. Final decisions and actions remain the sole
          responsibility of the user.
        </p>

        <p style={{ color: "#334155", lineHeight: 1.7 }}>
          Unless explicitly stated otherwise, the Service does not independently publish
          ads, make changes to your Google Ads account without authorization, or act as an
          advertising agent on your behalf.
        </p>

        <h2 style={{ marginTop: 26, fontSize: 22, fontWeight: 900 }}>
          3. Limitation of Liability
        </h2>

        <p style={{ color: "#334155", lineHeight: 1.7 }}>
          To the maximum extent permitted by law, the Company shall not be liable for
          advertising performance, clicks, impressions, conversions, account suspensions,
          policy enforcement actions, billing issues, or any actions taken by Google or
          other third parties.
        </p>

        <p style={{ color: "#334155", lineHeight: 1.7 }}>
          The Service is provided on an “as is” and “as available” basis, without warranties
          of any kind, whether express or implied.
        </p>

        <h2 id="atmaksa" style={{ marginTop: 26, fontSize: 22, fontWeight: 900 }}>
          4. Payments and Refunds
        </h2>

        <p style={{ color: "#334155", lineHeight: 1.7 }}>
          Pricing and subscription plans are listed on the pricing page. Because the Service
          is digital and access is granted immediately upon activation, payments are generally
          non-refundable.
        </p>

        <p style={{ color: "#334155", lineHeight: 1.7 }}>
          Refund requests may be reviewed on a case-by-case basis. Any refund decision is made
          at the Company’s sole discretion.
        </p>

        <h2 style={{ marginTop: 26, fontSize: 22, fontWeight: 900 }}>
          5. Contact
        </h2>

        <p style={{ color: "#334155", lineHeight: 1.7 }}>
          Email: <strong>support@aicampaign.app</strong>
          <br />
          Support availability: <strong>24/7</strong>
        </p>
      </section>
    </Container>
  );
}

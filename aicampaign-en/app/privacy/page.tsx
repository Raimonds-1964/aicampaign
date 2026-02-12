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
            Privacy Policy
          </h1>

          <p style={{ marginTop: 14, color: "#334155", lineHeight: 1.7 }}>
            This Privacy Policy explains how personal information is collected, used, and shared when
            you use the online service <strong>AI Google Ads</strong> (the “Service”). By using the
            Service, you consent to the data practices described in this Policy.
          </p>

          <h2 style={{ marginTop: 26, fontSize: 22, fontWeight: 900 }}>
            1. Data Controller
          </h2>

          <p style={{ color: "#334155", lineHeight: 1.7 }}>
            The data controller is the company operating the AI Google Ads platform (“Company”).
            Official company details will be published on this page.
          </p>

          <h2 style={{ marginTop: 26, fontSize: 22, fontWeight: 900 }}>
            2. Information We Process
          </h2>

          <p style={{ color: "#334155", lineHeight: 1.7 }}>
            To provide and improve the Service, we may process the following categories of information:
          </p>

          <ul style={{ paddingLeft: 18, lineHeight: 1.7, color: "#334155" }}>
            <li>contact information (such as email address);</li>
            <li>billing and payment information (processed by Stripe);</li>
            <li>technical information (such as IP address, device and browser data);</li>
            <li>information you submit while using the Service (including account and campaign inputs).</li>
          </ul>

          <h2 style={{ marginTop: 26, fontSize: 22, fontWeight: 900 }}>
            3. Purpose of Processing
          </h2>

          <p style={{ color: "#334155", lineHeight: 1.7 }}>
            We process personal information to operate the Service, process payments, provide customer
            support, maintain security, and improve product functionality and performance.
          </p>

          <h2 style={{ marginTop: 26, fontSize: 22, fontWeight: 900 }}>
            4. Third Parties
          </h2>

          <p style={{ color: "#334155", lineHeight: 1.7 }}>
            We use <strong>Stripe</strong> to process payments. Stripe processes payment information in
            accordance with its own privacy policy. We do not store full payment card details on our servers.
          </p>

          <h2 style={{ marginTop: 26, fontSize: 22, fontWeight: 900 }}>
            5. Data Retention
          </h2>

          <p style={{ color: "#334155", lineHeight: 1.7 }}>
            We retain personal information only for as long as necessary to provide the Service, comply
            with legal obligations, resolve disputes, and enforce our agreements.
          </p>

          <h2 style={{ marginTop: 26, fontSize: 22, fontWeight: 900 }}>
            6. Your Rights
          </h2>

          <p style={{ color: "#334155", lineHeight: 1.7 }}>
            Depending on your location, you may have rights to access, correct, delete, or restrict the
            processing of your personal information. You may also have the right to object to certain
            processing or request data portability. To exercise these rights, contact us using the details below.
          </p>

          <h2 style={{ marginTop: 26, fontSize: 22, fontWeight: 900 }}>
            7. Contact
          </h2>

          <p style={{ color: "#334155", lineHeight: 1.7 }}>
            Email: <strong>support@aicampaign.app</strong>
            <br />
            Support availability: <strong>24/7</strong>
          </p>
        </section>
      </main>
    </Container>
  );
}

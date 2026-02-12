import { ContactForm } from "../components/ContactForm";

export default function ContactPage() {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 8 }}>Contact</h1>

      <p style={{ color: "#475569", fontWeight: 700, lineHeight: 1.55, marginTop: 0 }}>
        The fastest way to reach us is to use the form below. Your message will be prepared and opened
        in your email app.
      </p>

      <div
        style={{
          marginTop: 14,
          padding: 14,
          borderRadius: 14,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Email:</div>
        <a
          href="mailto:support@aicampaign.app"
          style={{ color: "#2563eb", textDecoration: "none", fontWeight: 900 }}
        >
          support@aicampaign.app
        </a>

        <div style={{ marginTop: 8, color: "#475569", fontWeight: 700 }}>
          <strong>Support:</strong> 24/7
        </div>

        {/* ✅ force compact mode */}
        <div style={{ marginTop: 12 }}>
          <ContactForm toEmail="support@aicampaign.app" title="Send a message" compact />
        </div>
      </div>
    </div>
  );
}

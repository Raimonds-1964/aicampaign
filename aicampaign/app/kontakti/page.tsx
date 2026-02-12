import { ContactForm } from "../components/ContactForm";

export default function KontaktiPage() {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 8 }}>Kontakti</h1>

      <p style={{ color: "#475569", fontWeight: 700, lineHeight: 1.55, marginTop: 0 }}>
        Ātrākais veids – aizpildi formu zemāk. Ziņa tiks sagatavota un atvērta tavā e-pasta aplikācijā.
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
        <div style={{ fontWeight: 900, marginBottom: 6 }}>E-pasts:</div>
        <a
          href="mailto:support@aicampaign.app"
          style={{ color: "#2563eb", textDecoration: "none", fontWeight: 900 }}
        >
          support@aicampaign.app
        </a>

        <div style={{ marginTop: 8, color: "#475569", fontWeight: 700 }}>
          <strong>Atbalsts:</strong> 24/7
        </div>

        {/* ✅ te mēs piespiežam kompaktu režīmu */}
        <div style={{ marginTop: 12 }}>
          <ContactForm toEmail="support@aicampaign.app" title="Nosūtīt ziņu" compact />
        </div>
      </div>
    </div>
  );
}

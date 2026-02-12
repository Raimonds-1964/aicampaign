export default function StatusPage() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "60px 20px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>
        Sistēmas statuss
      </h1>

      <div
        style={{
          marginTop: 20,
          padding: 16,
          borderRadius: 12,
          background: "#ecfdf5",
          border: "1px solid #a7f3d0",
          fontWeight: 800,
        }}
      >
        ✅ All systems operational
      </div>

      <ul style={{ marginTop: 20, lineHeight: 1.7 }}>
        <li>AI Campaign ģenerators – OK</li>
        <li>Stripe Checkout – OK</li>
        <li>Dashboard – OK</li>
      </ul>
    </div>
  );
}

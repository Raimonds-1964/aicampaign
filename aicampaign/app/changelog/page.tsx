export default function ChangelogPage() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "60px 20px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>
        Changelog
      </h1>

      <ul style={{ paddingLeft: 18, lineHeight: 1.7 }}>
        <li>
          <strong>2026-01-09</strong> – Pievienots AI Google Ads kampaņu ģenerators
        </li>
        <li>
          <strong>2026-01-08</strong> – Stripe Checkout un plānu sistēma
        </li>
        <li>
          <strong>2026-01-07</strong> – Publiskā sākumlapa
        </li>
      </ul>

      <p style={{ marginTop: 24, color: "#475569" }}>
        Jaunas izmaiņas tiks pievienotas šeit.
      </p>
    </div>
  );
}

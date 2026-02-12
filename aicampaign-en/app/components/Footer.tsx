import Link from "next/link";
import Image from "next/image";
import { ContactForm } from "./ContactForm";

function SocialIcon({
  href,
  src,
  alt,
}: {
  href: string;
  src: string;
  alt: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={alt}
      title={alt}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        cursor: "pointer",
        transition: "transform .12s ease, opacity .12s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.03)";
        e.currentTarget.style.opacity = "0.9";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.opacity = "1";
      }}
    >
      <Image src={src} alt={alt} width={26} height={26} />
    </a>
  );
}

function MainLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        fontSize: 15,
        fontWeight: 900,
        color: "#0f172a",
        textDecoration: "none",
        padding: "4px 0",
        lineHeight: 1.2,
      }}
    >
      {children}
    </Link>
  );
}

function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        fontSize: 12,
        fontWeight: 800,
        color: "#94a3b8",
        textDecoration: "none",
        padding: "2px 0",
        lineHeight: 1.2,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.textDecoration = "underline";
        e.currentTarget.style.color = "#64748b";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.textDecoration = "none";
        e.currentTarget.style.color = "#94a3b8";
      }}
    >
      {children}
    </Link>
  );
}

export function Footer() {
  const muted = {
    color: "#475569",
    fontSize: 14,
    lineHeight: 1.45,
    fontWeight: 700,
  };

  return (
    <footer
      style={{
        marginTop: 16,
        marginBottom: 16,
        padding: 14,
        borderRadius: 18,
        background: "#f8fafc",
      }}
    >
      <div
        className="footer-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr 1.05fr",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        {/* LEFT */}
        <div
          className="footer-left"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}>
            AI Google Ads
          </div>

          <p className="footer-desc" style={{ ...muted, margin: 0, maxWidth: "78%" }}>
            From a website URL to a structured Google Ads campaign - or even a ready-to-launch
            account setup - built with clear logic you can review, edit, and export. Full AI
            guidance and recommendations.
          </p>

          <div style={{ marginTop: "auto" }}>
            <div style={{ marginBottom: 8 }}>
              <SecondaryLink href="/docs">Docs</SecondaryLink>
              <SecondaryLink href="/changelog">Changelog</SecondaryLink>
              <SecondaryLink href="/status">Status</SecondaryLink>
            </div>

            <div className="footer-social" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <SocialIcon href="https://github.com/" src="/icons/github.png" alt="GitHub" />
              <SocialIcon href="https://www.youtube.com/" src="/icons/youtube.png" alt="YouTube" />
              <SocialIcon href="https://www.linkedin.com/" src="/icons/linkedin.png" alt="LinkedIn" />
              <SocialIcon href="https://x.com/" src="/icons/x.png" alt="X (Twitter)" />
            </div>
          </div>
        </div>

        {/* MIDDLE */}
        <div
          className="footer-middle"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <MainLink href="/">Home</MainLink>
          <MainLink href="/pricing">Pricing</MainLink>
          <MainLink href="/about">About</MainLink>

          <div style={{ height: 6 }} />

          <MainLink href="/terms">Terms</MainLink>
          <MainLink href="/privacy">Privacy</MainLink>
          <MainLink href="/dashboard/ai">Try it free</MainLink>

          <div style={{ height: 8 }} />

          <div style={{ fontSize: 15, fontWeight: 900, lineHeight: 1.2 }}>Email</div>
          <a
            href="mailto:support@aicampaign.app"
            style={{
              fontSize: 15,
              fontWeight: 900,
              color: "#2563eb",
              textDecoration: "none",
              marginTop: 2,
              lineHeight: 1.2,
              wordBreak: "break-word",
            }}
          >
            support@aicampaign.app
          </a>

          <div
            className="footer-support"
            style={{
              marginTop: "auto",
              fontSize: 13,
              color: "#475569",
              fontWeight: 800,
            }}
          >
            <strong>Support:</strong> 24/7
          </div>
        </div>

        {/* RIGHT */}
        <div
          className="footer-right"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div
            className="footer-form"
            style={{
              marginTop: "auto",
              width: "100%",
              maxWidth: 520,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {/* Footer form: tighter layout */}
            <ContactForm
              toEmail="support@aicampaign.app"
              title="Quick message"
              compact
              variant="footer"
            />
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div
        className="footer-bottom"
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
          fontSize: 12,
          fontWeight: 800,
          color: "#64748b",
          lineHeight: 1.3,
        }}
      >
        <div>© {new Date().getFullYear()} AI Google Ads</div>
        <div>
          This site is not affiliated with Google LLC. Google trademarks belong to Google LLC.
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1020px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }

          .footer-desc {
            max-width: 100% !important;
          }

          /* Mobile: tighter internal padding */
          footer {
            padding: 12px !important;
            border-radius: 16px !important;
            margin-top: 12px !important;
            margin-bottom: 12px !important;
          }

          /* Keep the form centered and not overly wide */
          .footer-form {
            max-width: 520px !important;
            width: 100% !important;
          }

          /* Bottom row stacks better on small screens */
          .footer-bottom {
            justify-content: flex-start !important;
            gap: 6px !important;
          }
        }

        @media (max-width: 520px) {
          footer {
            padding: 10px !important;
            border-radius: 14px !important;
          }

          .footer-bottom {
            font-size: 11px !important;
            line-height: 1.35 !important;
          }
        }
      `}</style>
    </footer>
  );
}

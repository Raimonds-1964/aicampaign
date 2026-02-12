"use client";

import { useMemo, useState } from "react";

type ContactFormProps = {
  toEmail: string;
  title?: string;
  compact?: boolean;
  variant?: "default" | "footer";
};

export function ContactForm({
  toEmail,
  title = "Ātra ziņa",
  compact = false,
  variant = "default",
}: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent(`Ziņa no ${name || "vietnes"}`);
    const body = encodeURIComponent(
      `Vārds: ${name}\nE-pasts: ${email}\n\nZiņa:\n${message}`
    );
    return `mailto:${toEmail}?subject=${subject}&body=${body}`;
  }, [toEmail, name, email, message]);

  const base = compact
    ? {
        title: 20,
        fieldFont: 16,
        fieldPad: "10px 14px",
        radius: 16,
        gap: 12,
        textareaMinH: 120,
        buttonFont: 20,
        buttonPad: "12px 16px",
        hintFont: 12,
      }
    : {
        title: 24,
        fieldFont: 20,
        fieldPad: "16px 18px",
        radius: 18,
        gap: 16,
        textareaMinH: 170,
        buttonFont: 26,
        buttonPad: "16px 18px",
        hintFont: 16,
      };

  // ✅ Footer variant: vēl ciešāks par compact
const sizes =
  variant === "footer"
      ? {
          ...base,
          title: 15,          // 👈 mazāks “Ātra ziņa”
          fieldFont: 13,      // 👈 mazāki input fonti
          fieldPad: "6px 10px",
          radius: 12,
          gap: 8,
          textareaMinH: 70,   // 👈 zemāka textarea
          buttonFont: 14,
          buttonPad: "8px 12px",
          hintFont: 10,
        }

      : base;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #dbe3ee",
    borderRadius: sizes.radius,
    padding: sizes.fieldPad,
    fontSize: sizes.fieldFont,
    fontWeight: 800,
    outline: "none",
    background: "#ffffff",
    color: "#0f172a",
    boxSizing: "border-box",
    lineHeight: 1.2,
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: sizes.textareaMinH,
    resize: "vertical",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    border: "none",
    borderRadius: sizes.radius,
    padding: sizes.buttonPad,
    fontSize: sizes.buttonFont,
    fontWeight: 900,
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    lineHeight: 1.2,
  };

  return (
    <div>
      <div
        style={{
          fontSize: sizes.title,
          fontWeight: 900,
          marginBottom: variant === "footer" ? 8 : compact ? 10 : 14,
          color: "#0f172a",
          lineHeight: 1.15,
        }}
      >
        {title}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: sizes.gap }}>
        <input
          placeholder="Vārds"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Tavs e-pasts"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <textarea
          placeholder="Ziņa"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={textareaStyle}
        />

        <a href={mailtoHref} style={{ textDecoration: "none" }}>
          <button type="button" style={buttonStyle}>
            Nosūtīt
          </button>
        </a>

        <div
          style={{
            marginTop: variant === "footer" ? -4 : compact ? -2 : 0,
            color: "#64748b",
            fontSize: sizes.hintFont,
            fontWeight: 800,
            lineHeight: 1.35,
          }}
        >
          Nosūtīšana atver tavu e-pasta aplikāciju ar sagatavotu ziņu.
        </div>
      </div>
    </div>
  );
}

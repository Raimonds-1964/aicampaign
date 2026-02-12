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
  title = "Quick message",
  compact = false,
  variant = "default",
}: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent(`Message from ${name || "the website"}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
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

  // Footer variant: even tighter spacing than "compact"
  const sizes =
    variant === "footer"
      ? {
          ...base,
          title: Math.min(base.title, 18),
          fieldFont: Math.min(base.fieldFont, 14),
          fieldPad: "8px 12px",
          radius: Math.min(base.radius, 14),
          gap: 10,
          textareaMinH: 88,
          buttonFont: 16,
          buttonPad: "10px 12px",
          hintFont: 11,
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
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={textareaStyle}
        />

        <a href={mailtoHref} style={{ textDecoration: "none" }}>
          <button type="button" style={buttonStyle}>
            Send message
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
          Sending will open your email app with a pre-filled message.
        </div>
      </div>
    </div>
  );
}

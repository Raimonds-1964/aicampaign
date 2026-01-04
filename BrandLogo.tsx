import Image from "next/image";

export function BrandLogo(props: { size?: "sm" | "md"; withTagline?: boolean }) {
  const size = props.size ?? "md";
  const h = size === "sm" ? 32 : 40;
  const w = size === "sm" ? 180 : 220;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Image
        src="/ai-google-ads-logo.png"
        alt="AI Google Ads"
        width={w}
        height={h}
        priority
        style={{ height: h, width: "auto" }}
      />
      {props.withTagline && (
        <span style={{ fontSize: 12, fontWeight: 800, color: "#64748b" }}>
          Campaign Generator
        </span>
      )}
    </div>
  );
}

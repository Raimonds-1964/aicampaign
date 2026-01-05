import Image from "next/image";

export function BrandLogo(props: { size?: "sm" | "md" }) {
  const size = props.size ?? "md";
  const h = size === "sm" ? 56 : 68;
  const w = size === "sm" ? 340 : 420;

  return (
    <Image
      src="/ai-google-ads-logo.png"
      alt="AI Google Ads"
      width={w}
      height={h}
      priority
      style={{ height: h, width: "auto" }}
    />
  );
}

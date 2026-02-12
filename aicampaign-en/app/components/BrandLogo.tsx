import Image from "next/image";

export function BrandLogo(props: { size?: "sm" | "md" }) {
  const size = props.size ?? "md";
  const height = size === "sm" ? 56 : 68;
  const width = size === "sm" ? 340 : 420;

  return (
    <Image
      src="/ai-google-ads-logo.png"
      alt="AI-powered Google Ads platform logo"
      width={width}
      height={height}
      priority
      style={{ height, width: "auto" }}
    />
  );
}

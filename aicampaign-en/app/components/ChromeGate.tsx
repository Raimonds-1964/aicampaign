"use client";

import { usePathname } from "next/navigation";
import SiteChrome from "./SiteChrome";

export default function ChromeGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/";

  // Panel routes (extend this list as needed)
  const isPanel =
    pathname.startsWith("/agency") ||
    pathname.startsWith("/pro") ||
    pathname.startsWith("/basic") ||
    pathname.startsWith("/easy");

  // App panels do not render the public header/footer
  if (isPanel) return <>{children}</>;

  // Public site keeps the full chrome (header + footer)
  return <SiteChrome>{children}</SiteChrome>;
}

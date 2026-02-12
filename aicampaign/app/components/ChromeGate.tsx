"use client";

import { usePathname } from "next/navigation";
import SiteChrome from "./SiteChrome";

export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";

  // ✅ paneļu maršruti (te vari papildināt sarakstu)
  const isPanel =
    pathname.startsWith("/agency") ||
    pathname.startsWith("/pro") ||
    pathname.startsWith("/basic") ||
    pathname.startsWith("/easy");

  // Panelī nav publiskā header/footer
  if (isPanel) return <>{children}</>;

  // Publiskajā daļā atstājam header/footer
  return <SiteChrome>{children}</SiteChrome>;
}

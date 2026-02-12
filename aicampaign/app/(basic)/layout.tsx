// app/(basic)/layout.tsx
import type { ReactNode } from "react";

export default function ProRootLayout({ children }: { children: ReactNode }) {
  // Šis layout ir tikai /basic/* un NEKAD nerādīs publisko SiteChrome.
  return <>{children}</>;
}

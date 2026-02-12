// app/(agency)/layout.tsx
import type { ReactNode } from "react";

export default function AgencyRootLayout({ children }: { children: ReactNode }) {
  // Šis layout ir tikai /agency/* un NEKAD nerādīs publisko SiteChrome.
  return <>{children}</>;
}

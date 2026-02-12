// app/(pro)/layout.tsx
import type { ReactNode } from "react";

export default function ProRootLayout({ children }: { children: ReactNode }) {
  // Šis layout ir tikai /pro/* un NEKAD nerādīs publisko SiteChrome.
  return <>{children}</>;
}

// app/(agency)/layout.tsx
import type { ReactNode } from "react";

export default function AgencyRootLayout({ children }: { children: ReactNode }) {
  // This layout is only for /agency/* and NEVER renders the public SiteChrome.
  return <>{children}</>;
}

// app/(pro)/layout.tsx
import type { ReactNode } from "react";

export default function ProRootLayout({ children }: { children: ReactNode }) {
  // This layout only applies to /pro/* and will never render the public SiteChrome.
  return <>{children}</>;
}

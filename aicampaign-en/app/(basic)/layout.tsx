// app/(basic)/layout.tsx
import type { ReactNode } from "react";

export default function BasicRootLayout({ children }: { children: ReactNode }) {
  // This layout is only for /basic/* and will NEVER render the public SiteChrome.
  return <>{children}</>;
}

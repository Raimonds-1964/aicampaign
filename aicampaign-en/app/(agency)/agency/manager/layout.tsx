import type { ReactNode } from "react";
import { Suspense } from "react";
import ManagerShell from "./_ui/ManagerShell";

export default function Layout({ children }: { children: ReactNode }) {
  // ✅ Suspense is required because ManagerShell (or its children)
  // uses the useSearchParams() hook
  return (
    <Suspense fallback={null}>
      <ManagerShell>{children}</ManagerShell>
    </Suspense>
  );
}

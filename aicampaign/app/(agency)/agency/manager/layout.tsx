import type { ReactNode } from "react";
import { Suspense } from "react";
import ManagerShell from "./_ui/ManagerShell";

export default function Layout({ children }: { children: ReactNode }) {
  // ✅ Suspense vajag, jo ManagerShell (vai tā bērni) lieto useSearchParams()
  return (
    <Suspense fallback={null}>
      <ManagerShell>{children}</ManagerShell>
    </Suspense>
  );
}

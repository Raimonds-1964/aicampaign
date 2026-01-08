import type { ReactNode } from "react";
import DashboardGate from "./DashboardGate";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardGate>{children}</DashboardGate>;
}

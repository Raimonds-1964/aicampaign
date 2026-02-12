export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { ReactNode } from "react";
import ChromeClient from "./Chrome.client";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <ChromeClient>{children}</ChromeClient>;
}

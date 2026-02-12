import { Suspense } from "react";
import Client from "./Client";

// Prevent Next.js from trying to prerender this route at build time.
// This avoids "Error occurred prerendering page ..." when Client uses
// window/localStorage/useSearchParams/next-auth hooks, etc.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Client />
    </Suspense>
  );
}

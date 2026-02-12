import { Suspense } from "react";
import Client from "./Client";

// Force this route to be dynamic (no static prerender).
// Helps avoid "Error occurred prerendering page ..." when Client uses
// browser-only APIs (window/localStorage) or hooks like useSearchParams.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Client />
    </Suspense>
  );
}

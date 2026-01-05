import { Suspense } from "react";
import PricingSuccessClient from "./PricingSuccessClient";

export default function PricingSuccessPage() {
  return (
    <Suspense fallback={<main style={{ padding: 24 }}>Ielādējas…</main>}>
      <PricingSuccessClient />
    </Suspense>
  );
}

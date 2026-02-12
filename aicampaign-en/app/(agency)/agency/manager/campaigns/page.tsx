import { Suspense } from "react";
import CampaignsClient from "./CampaignsClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CampaignsClient />
    </Suspense>
  );
}

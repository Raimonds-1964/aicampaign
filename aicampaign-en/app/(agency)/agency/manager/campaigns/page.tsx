export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import CampaignsClient from "./CampaignsClient";

export default function Page() {
  return <CampaignsClient />;
}
import CampaignsClient from "./CampaignsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page({ params }: { params: { accountId: string } }) {
  return <CampaignsClient accountId={params.accountId} />;
}

import CampaignsClient from "./CampaignsClient";

export default function Page({ params }: { params: { accountId: string } }) {
  const { accountId } = params;
  return <CampaignsClient accountId={accountId} />;
}

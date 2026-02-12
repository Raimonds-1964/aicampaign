import CampaignsClient from "./CampaignsClient";

export default async function Page({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  return <CampaignsClient accountId={accountId} />;
}

import Client from "./Client";

export default async function Page({
  params,
}: {
  params: Promise<{ accountId: string; campaignId: string }>;
}) {
  const { accountId, campaignId } = await params;
  return <Client accountId={accountId} campaignId={campaignId} />;
}

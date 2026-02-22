import Client from "./Client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({
  params,
}: {
  params: Promise<{ accountId: string; campaignId: string }>;
}) {
  const { accountId, campaignId } = await params;
  return <Client accountId={accountId} campaignId={campaignId} />;
}

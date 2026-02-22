// app/(pro)/pro/administrator/accounts/[accountId]/campaigns/[campaignId]/page.tsx
import { use } from "react";
import Client from "./Client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page({
  params,
}: {
  params: Promise<{ accountId: string; campaignId: string }>;
}) {
  const { accountId, campaignId } = use(params);
  return <Client accountId={accountId} campaignId={campaignId} />;
}

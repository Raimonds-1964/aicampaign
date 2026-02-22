// app/(pro)/pro/administrator/accounts/[accountId]/campaigns/[campaignId]/Client.tsx
"use client";

import CampaignDetails from "@/app/(pro)/pro/shared/ui/CampaignDetails";

export default function Client({
  accountId,
  campaignId,
}: {
  accountId: string;
  campaignId: string;
}) {
  return <CampaignDetails accountId={accountId} campaignId={campaignId} />;
}

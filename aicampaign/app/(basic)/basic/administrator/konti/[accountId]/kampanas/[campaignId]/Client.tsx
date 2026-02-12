"use client";

import CampaignDetails from "@/app/(basic)/basic/shared/ui/CampaignDetails";

export default function Client({
  accountId,
  campaignId,
}: {
  accountId: string;
  campaignId: string;
}) {
  return <CampaignDetails mode="admin" accountId={accountId} campaignId={campaignId} />;
}

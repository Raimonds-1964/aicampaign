"use client";

/**
 * Manager kampaņas detaļas:
 * izmanto shared UI CampaignDetails.
 * “Atpakaļ” ved uz /agency/manager/kampanas?managerId=...
 */

import { useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useManagerStore, managerSelectors } from "@/app/(agency)/agency/manager/_data/store";

// ✅ FIX: pareizais ceļš (CampaignDetails ir `shared/ui/`)
import CampaignDetails from "@/app/(agency)/agency/shared/ui/CampaignDetails";

export default function Client() {
  const params = useParams<{ accountId: string; campaignId: string }>();
  const sp = useSearchParams();

  const accountId = params?.accountId ?? "";
  const campaignId = params?.campaignId ?? "";

  const s = useManagerStore();

  const account = useMemo(
    () => managerSelectors.accountById(s, accountId),
    [s, accountId]
  );

  const campaign = useMemo(
    () => managerSelectors.campaignById(s, campaignId),
    [s, campaignId]
  );

  // managerId avoti: URL -> campaign.ownerId -> localStorage
  const managerId = useMemo(() => {
    const fromUrl = sp?.get("managerId");
    if (fromUrl) return fromUrl;

    const fromCampaign = (campaign as any)?.ownerId as string | undefined;
    if (fromCampaign) return fromCampaign;

    if (typeof window !== "undefined") {
      const fromLs = window.localStorage.getItem("managerId");
      if (fromLs) return fromLs;
    }

    return "";
  }, [sp, campaign]);

  const backHref = managerId
    ? `/agency/manager/kampanas?managerId=${encodeURIComponent(managerId)}`
    : "/agency/manager/kampanas";

  const googleAdsHref = (campaign as any)?.googleAdsUrl ?? null;

  return (
    <CampaignDetails
      titlePrefix="Manager / Kampaņas detaļas"
      campaign={campaign ?? null}
      accountName={account?.name ?? accountId}
      backHref={backHref}
      googleAdsHref={googleAdsHref}
    />
  );
}

"use client";

/**
 * Manager campaign details:
 * uses the shared CampaignDetails UI component.
 * “Back” navigates to /agency/manager/campaigns?managerId=...
 */

import { useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useManagerStore, managerSelectors } from "@/app/(agency)/agency/manager/_data/store";

// ✅ FIX: correct path (CampaignDetails lives in `shared/ui/`)
import CampaignDetails from "@/app/(agency)/agency/shared/ui/CampaignDetails";

export default function Client() {
  const params = useParams<{ accountId: string; campaignId: string }>();
  const sp = useSearchParams();

  const accountId = params?.accountId ?? "";
  const campaignId = params?.campaignId ?? "";

  const s = useManagerStore();

  const account = useMemo(() => managerSelectors.accountById(s, accountId), [s, accountId]);

  const campaign = useMemo(() => managerSelectors.campaignById(s, campaignId), [s, campaignId]);

  // managerId sources: URL -> campaign.ownerId -> localStorage (demo fallback)
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
    ? `/agency/manager/campaigns?managerId=${encodeURIComponent(managerId)}`
    : "/agency/manager/campaigns";

  const googleAdsHref = (campaign as any)?.googleAdsUrl ?? null;

  return (
    <CampaignDetails
      titlePrefix="Manager / Campaign details"
      campaign={campaign ?? null}
      accountName={account?.name ?? accountId}
      backHref={backHref}
      googleAdsHref={googleAdsHref}
    />
  );
}

"use client";

/**
 * Admin campaign details:
 * uses the shared CampaignDetails UI component.
 */

import { useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useAdminStore,
  adminSelectors,
  ADMIN_OWNER_ID,
} from "@/app/(agency)/agency/administrator/_data/store";

// ✅ FIX: correct path (CampaignDetails lives in `shared/ui/`)
import CampaignDetails from "@/app/(agency)/agency/shared/ui/CampaignDetails";

export default function Client() {
  const params = useParams<{ accountId: string; campaignId: string }>();
  const accountId = params?.accountId ?? "";
  const campaignId = params?.campaignId ?? "";

  const router = useRouter();
  const s = useAdminStore();

  const account = useMemo(() => adminSelectors.accountById(s, accountId), [s, accountId]);

  const campaign = useMemo(() => adminSelectors.campaignById(s, campaignId), [s, campaignId]);

  const ownerId = (campaign as any)?.ownerId as string | undefined;
  const googleAdsHref = (campaign as any)?.googleAdsUrl ?? null;

  /**
   * Browser-friendly back behavior with a safe fallback:
   * - if there's history: router.back()
   * - if opened directly: fall back to the account's campaign list
   */
  const fallbackHref = `/agency/administrator/accounts/${encodeURIComponent(accountId)}/campaigns`;

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }, [router, fallbackHref]);

  // In Admin, show "View as manager" only if the owner is not the Administrator
  const topRightLabel =
    ownerId && ownerId !== ADMIN_OWNER_ID ? (
      <a
        className="text-sm font-semibold text-white/80 underline decoration-white/20 underline-offset-4 hover:decoration-white/50"
        href={`/agency/manager/campaigns?managerId=${encodeURIComponent(ownerId)}`}
        target="_blank"
        rel="noreferrer noopener"
      >
        View as manager ↗
      </a>
    ) : null;

  return (
    <CampaignDetails
      titlePrefix="Campaign details"
      campaign={campaign ?? null}
      accountName={account?.name ?? accountId}
      // CampaignDetails expects backHref, but we want back() behavior.
      // Use "#" and intercept via onBack.
      backHref="#"
      onBack={handleBack as any}
      googleAdsHref={googleAdsHref}
      topRightLabel={topRightLabel}
    />
  );
}

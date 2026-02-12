"use client";

/**
 * Admin kampaņas detaļas:
 * izmanto shared UI komponenti CampaignDetails.
 */

import { useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useAdminStore,
  adminSelectors,
  ADMIN_OWNER_ID,
} from "@/app/(agency)/agency/administrator/_data/store";

// ✅ FIX: pareizais ceļš (CampaignDetails ir `shared/ui/`)
import CampaignDetails from "@/app/(agency)/agency/shared/ui/CampaignDetails";

export default function Client() {
  const params = useParams<{ accountId: string; campaignId: string }>();
  const accountId = params?.accountId ?? "";
  const campaignId = params?.campaignId ?? "";

  const router = useRouter();
  const s = useAdminStore();

  const account = useMemo(
    () => adminSelectors.accountById(s, accountId),
    [s, accountId]
  );

  const campaign = useMemo(
    () => adminSelectors.campaignById(s, campaignId),
    [s, campaignId]
  );

  const ownerId = (campaign as any)?.ownerId as string | undefined;
  const googleAdsHref = (campaign as any)?.googleAdsUrl ?? null;

  // ✅ “Pārlūkprogrammas princips” ar drošu fallback:
  // - ja ir history: router.back()
  // - ja nav (atvērts tieši): fallback uz konta kampaņu sarakstu
  const fallbackHref = `/agency/administrator/konti/${encodeURIComponent(
    accountId
  )}/kampanas`;

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }, [router, fallbackHref]);

  // Adminā rādam “Skatīt kā manager” tikai tad, ja ownerId nav admin
  const topRightLabel =
    ownerId && ownerId !== ADMIN_OWNER_ID ? (
      <a
        className="text-sm font-semibold text-white/80 underline decoration-white/20 underline-offset-4 hover:decoration-white/50"
        href={`/agency/manager/kampanas?managerId=${encodeURIComponent(ownerId)}`}
        target="_blank"
        rel="noreferrer noopener"
      >
        Skatīt kā manager ↗
      </a>
    ) : null;

  return (
    <CampaignDetails
      titlePrefix="Kampaņas detaļas"
      campaign={campaign ?? null}
      accountName={account?.name ?? accountId}
      // CampaignDetails gaida backHref, bet mēs gribam back() → izmantojam "#" un pārtveram klikšķi
      backHref="#"
      onBack={handleBack as any}
      googleAdsHref={googleAdsHref}
      topRightLabel={topRightLabel}
    />
  );
}

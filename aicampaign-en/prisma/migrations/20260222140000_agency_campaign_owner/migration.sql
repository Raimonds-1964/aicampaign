CREATE TABLE IF NOT EXISTS "AgencyCampaignOwner" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "ownerMemberId" TEXT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgencyCampaignOwner_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AgencyCampaignOwner_workspaceId_campaignId_key"
ON "AgencyCampaignOwner" ("workspaceId","campaignId");

CREATE INDEX IF NOT EXISTS "AgencyCampaignOwner_workspaceId_ownerMemberId_idx"
ON "AgencyCampaignOwner" ("workspaceId","ownerMemberId");

ALTER TABLE "AgencyCampaignOwner"
ADD CONSTRAINT "AgencyCampaignOwner_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "AgencyWorkspace"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AgencyCampaignOwner"
ADD CONSTRAINT "AgencyCampaignOwner_ownerMemberId_fkey"
FOREIGN KEY ("ownerMemberId") REFERENCES "AgencyMember"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GoogleAdsConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userEmail" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "selectedCustomerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_GoogleAdsConnection" ("createdAt", "id", "refreshToken", "selectedCustomerId", "userEmail") SELECT "createdAt", "id", "refreshToken", "selectedCustomerId", "userEmail" FROM "GoogleAdsConnection";
DROP TABLE "GoogleAdsConnection";
ALTER TABLE "new_GoogleAdsConnection" RENAME TO "GoogleAdsConnection";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

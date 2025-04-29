-- AlterTable
ALTER TABLE "AuthAttempt" ADD COLUMN     "userAgent" TEXT;

-- CreateIndex
CREATE INDEX "AuthAttempt_ipAddress_userAgent_type_createdAt_idx" ON "AuthAttempt"("ipAddress", "userAgent", "type", "createdAt");

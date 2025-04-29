-- CreateEnum
CREATE TYPE "AuthAttemptType" AS ENUM ('LOGIN', 'OTP');

-- CreateTable
CREATE TABLE "AuthAttempt" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "ipAddress" TEXT NOT NULL,
    "type" "AuthAttemptType" NOT NULL,
    "success" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuthAttempt_email_idx" ON "AuthAttempt"("email");

-- CreateIndex
CREATE INDEX "AuthAttempt_ipAddress_idx" ON "AuthAttempt"("ipAddress");

-- CreateIndex
CREATE INDEX "AuthAttempt_type_createdAt_idx" ON "AuthAttempt"("type", "createdAt");

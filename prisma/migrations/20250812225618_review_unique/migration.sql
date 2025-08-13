/*
  Warnings:

  - A unique constraint covering the columns `[applicationId,reviewerId]` on the table `ApplicationReview` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ApplicationReview_applicationId_key";

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationReview_applicationId_reviewerId_key" ON "ApplicationReview"("applicationId", "reviewerId");

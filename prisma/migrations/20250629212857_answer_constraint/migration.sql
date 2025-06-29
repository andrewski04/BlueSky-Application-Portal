/*
  Warnings:

  - A unique constraint covering the columns `[applicationId,questionVersionId]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Answer_applicationId_questionVersionId_key" ON "Answer"("applicationId", "questionVersionId");

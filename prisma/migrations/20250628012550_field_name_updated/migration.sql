/*
  Warnings:

  - You are about to drop the column `currentVerId` on the `QuestionTemplate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[currentVersionId]` on the table `QuestionTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "QuestionTemplate" DROP CONSTRAINT "QuestionTemplate_currentVerId_fkey";

-- DropIndex
DROP INDEX "QuestionTemplate_currentVerId_key";

-- AlterTable
ALTER TABLE "QuestionTemplate" DROP COLUMN "currentVerId",
ADD COLUMN     "currentVersionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "QuestionTemplate_currentVersionId_key" ON "QuestionTemplate"("currentVersionId");

-- AddForeignKey
ALTER TABLE "QuestionTemplate" ADD CONSTRAINT "QuestionTemplate_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "QuestionVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

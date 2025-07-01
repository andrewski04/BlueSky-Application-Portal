/*
  Warnings:

  - A unique constraint covering the columns `[questionDraftId]` on the table `QuestionLinkDraft` will be added. If there are existing duplicate values, this will fail.
  - Made the column `questionDraftId` on table `QuestionLinkDraft` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "QuestionOptionDraft" DROP CONSTRAINT "QuestionOptionDraft_questionId_fkey";

-- AlterTable
ALTER TABLE "QuestionLinkDraft" ALTER COLUMN "questionDraftId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "QuestionLinkDraft_questionDraftId_key" ON "QuestionLinkDraft"("questionDraftId");

-- AddForeignKey
ALTER TABLE "QuestionOptionDraft" ADD CONSTRAINT "QuestionOptionDraft_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

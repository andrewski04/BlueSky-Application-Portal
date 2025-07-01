-- DropForeignKey
ALTER TABLE "QuestionOptionDraft" DROP CONSTRAINT "QuestionOptionDraft_questionId_fkey";

-- AddForeignKey
ALTER TABLE "QuestionOptionDraft" ADD CONSTRAINT "QuestionOptionDraft_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionDraft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

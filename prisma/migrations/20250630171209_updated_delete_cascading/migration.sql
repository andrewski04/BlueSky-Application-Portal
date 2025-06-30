-- DropForeignKey
ALTER TABLE "FormSectionDraft" DROP CONSTRAINT "FormSectionDraft_formId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionLinkDraft" DROP CONSTRAINT "QuestionLinkDraft_questionDraftId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionLinkDraft" DROP CONSTRAINT "QuestionLinkDraft_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionOptionDraft" DROP CONSTRAINT "QuestionOptionDraft_questionId_fkey";

-- AddForeignKey
ALTER TABLE "FormSectionDraft" ADD CONSTRAINT "FormSectionDraft_formId_fkey" FOREIGN KEY ("formId") REFERENCES "ApplicationFormDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOptionDraft" ADD CONSTRAINT "QuestionOptionDraft_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionLinkDraft" ADD CONSTRAINT "QuestionLinkDraft_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "FormSectionDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionLinkDraft" ADD CONSTRAINT "QuestionLinkDraft_questionDraftId_fkey" FOREIGN KEY ("questionDraftId") REFERENCES "QuestionDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

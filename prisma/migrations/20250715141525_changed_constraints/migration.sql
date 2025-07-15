/*
  Warnings:

  - A unique constraint covering the columns `[formId,slug]` on the table `FormSectionDraft` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[formId,slug]` on the table `FormSectionPublished` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "QuestionTemplate_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "FormSectionDraft_formId_slug_key" ON "FormSectionDraft"("formId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "FormSectionPublished_formId_slug_key" ON "FormSectionPublished"("formId", "slug");

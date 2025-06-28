/*
  Warnings:

  - You are about to drop the column `questionId` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the `ApplicationForm` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FormQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FormQuestionOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FormSection` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `publishedDisplayOrder` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publishedSectionId` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionVersionId` to the `Answer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "AnswerOptionSelection" DROP CONSTRAINT "AnswerOptionSelection_optionId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationResponse" DROP CONSTRAINT "ApplicationResponse_formId_fkey";

-- DropForeignKey
ALTER TABLE "FormQuestion" DROP CONSTRAINT "FormQuestion_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "FormQuestionOption" DROP CONSTRAINT "FormQuestionOption_questionId_fkey";

-- DropForeignKey
ALTER TABLE "FormSection" DROP CONSTRAINT "FormSection_formId_fkey";

-- DropIndex
DROP INDEX "Answer_applicationId_questionId_idx";

-- DropIndex
DROP INDEX "Answer_questionId_idx";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "questionId",
ADD COLUMN     "publishedDisplayOrder" INTEGER NOT NULL,
ADD COLUMN     "publishedSectionId" TEXT NOT NULL,
ADD COLUMN     "questionVersionId" TEXT NOT NULL;

-- DropTable
DROP TABLE "ApplicationForm";

-- DropTable
DROP TABLE "FormQuestion";

-- DropTable
DROP TABLE "FormQuestionOption";

-- DropTable
DROP TABLE "FormSection";

-- CreateTable
CREATE TABLE "QuestionTemplate" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "inLibrary" BOOLEAN NOT NULL DEFAULT false,
    "currentVerId" TEXT,

    CONSTRAINT "QuestionTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionVersion" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT NOT NULL,
    "minLength" INTEGER,
    "maxLength" INTEGER,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "minDate" TIMESTAMP(3),
    "maxDate" TIMESTAMP(3),
    "acceptedTypes" TEXT,
    "maxFileSizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationFormDraft" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationFormDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSectionDraft" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "FormSectionDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionDraft" (
    "id" TEXT NOT NULL,
    "templateId" TEXT,
    "prompt" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT NOT NULL,
    "minLength" INTEGER,
    "maxLength" INTEGER,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "minDate" TIMESTAMP(3),
    "maxDate" TIMESTAMP(3),
    "acceptedTypes" TEXT,
    "maxFileSizeBytes" INTEGER,

    CONSTRAINT "QuestionDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOptionDraft" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "QuestionOptionDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionLinkDraft" (
    "sectionId" TEXT NOT NULL,
    "questionDraftId" TEXT,
    "questionVersionId" TEXT,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "QuestionLinkDraft_pkey" PRIMARY KEY ("sectionId","displayOrder")
);

-- CreateTable
CREATE TABLE "ApplicationFormPublished" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationFormPublished_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSectionPublished" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "FormSectionPublished_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionLinkPublished" (
    "sectionId" TEXT NOT NULL,
    "questionVersionId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "QuestionLinkPublished_pkey" PRIMARY KEY ("sectionId","displayOrder")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionTemplate_slug_key" ON "QuestionTemplate"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionTemplate_currentVerId_key" ON "QuestionTemplate"("currentVerId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionVersion_templateId_version_key" ON "QuestionVersion"("templateId", "version");

-- CreateIndex
CREATE INDEX "Answer_applicationId_publishedSectionId_publishedDisplayOrd_idx" ON "Answer"("applicationId", "publishedSectionId", "publishedDisplayOrder");

-- CreateIndex
CREATE INDEX "Answer_questionVersionId_idx" ON "Answer"("questionVersionId");

-- AddForeignKey
ALTER TABLE "QuestionTemplate" ADD CONSTRAINT "QuestionTemplate_currentVerId_fkey" FOREIGN KEY ("currentVerId") REFERENCES "QuestionVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionVersion" ADD CONSTRAINT "QuestionVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "QuestionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSectionDraft" ADD CONSTRAINT "FormSectionDraft_formId_fkey" FOREIGN KEY ("formId") REFERENCES "ApplicationFormDraft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOptionDraft" ADD CONSTRAINT "QuestionOptionDraft_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionDraft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionLinkDraft" ADD CONSTRAINT "QuestionLinkDraft_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "FormSectionDraft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionLinkDraft" ADD CONSTRAINT "QuestionLinkDraft_questionDraftId_fkey" FOREIGN KEY ("questionDraftId") REFERENCES "QuestionDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionLinkDraft" ADD CONSTRAINT "QuestionLinkDraft_questionVersionId_fkey" FOREIGN KEY ("questionVersionId") REFERENCES "QuestionVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSectionPublished" ADD CONSTRAINT "FormSectionPublished_formId_fkey" FOREIGN KEY ("formId") REFERENCES "ApplicationFormPublished"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionLinkPublished" ADD CONSTRAINT "QuestionLinkPublished_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "FormSectionPublished"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionLinkPublished" ADD CONSTRAINT "QuestionLinkPublished_questionVersionId_fkey" FOREIGN KEY ("questionVersionId") REFERENCES "QuestionVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationResponse" ADD CONSTRAINT "ApplicationResponse_formId_fkey" FOREIGN KEY ("formId") REFERENCES "ApplicationFormPublished"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_publishedSectionId_publishedDisplayOrder_fkey" FOREIGN KEY ("publishedSectionId", "publishedDisplayOrder") REFERENCES "QuestionLinkPublished"("sectionId", "displayOrder") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionVersionId_fkey" FOREIGN KEY ("questionVersionId") REFERENCES "QuestionVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerOptionSelection" ADD CONSTRAINT "AnswerOptionSelection_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "QuestionOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

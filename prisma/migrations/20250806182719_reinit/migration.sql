-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('TEXT', 'PARAGRAPH', 'MULTIPLE_CHOICE', 'DROPDOWN', 'CHECKBOX', 'FILE_UPLOAD', 'DATE', 'NUMBER');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ColorScheme" AS ENUM ('BLUE', 'GREEN', 'PURPLE', 'RED', 'TEAL', 'ORANGE', 'PINK', 'INDIGO', 'CYAN', 'EMERALD', 'AMBER', 'ROSE', 'VIOLET', 'SLATE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "QuestionTemplate" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "inLibrary" BOOLEAN NOT NULL DEFAULT false,
    "currentVersionId" TEXT,

    CONSTRAINT "QuestionTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionVersion" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
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
    "colorScheme" "ColorScheme",

    CONSTRAINT "FormSectionDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionDraft" (
    "id" TEXT NOT NULL,
    "templateId" TEXT,
    "prompt" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
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
    "questionDraftId" TEXT NOT NULL,
    "questionVersionId" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "QuestionLinkDraft_pkey" PRIMARY KEY ("sectionId","displayOrder")
);

-- CreateTable
CREATE TABLE "ApplicationFormGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ApplicationFormGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationFormPublished" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "groupId" TEXT,
    "openDate" TIMESTAMP(3),
    "closeDate" TIMESTAMP(3),
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
    "colorScheme" "ColorScheme",
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "FormSectionPublished_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionLinkPublished" (
    "sectionId" TEXT NOT NULL,
    "questionVersionId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "QuestionLinkPublished_pkey" PRIMARY KEY ("sectionId","displayOrder")
);

-- CreateTable
CREATE TABLE "ApplicationResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "formGroupId" TEXT,

    CONSTRAINT "ApplicationResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "publishedSectionId" TEXT NOT NULL,
    "publishedDisplayOrder" INTEGER NOT NULL,
    "questionVersionId" TEXT NOT NULL,
    "valueText" TEXT,
    "valueNumber" DOUBLE PRECISION,
    "valueBool" BOOLEAN,
    "valueDate" TIMESTAMP(3),
    "fileUploadId" TEXT,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerOptionSelection" (
    "answerId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "AnswerOptionSelection_pkey" PRIMARY KEY ("answerId","optionId")
);

-- CreateTable
CREATE TABLE "FileUpload" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "etsuApplicationComplete" BOOLEAN NOT NULL DEFAULT false,
    "etsuENumber" TEXT,
    "etsuEmail" TEXT,
    "phoneNumber" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isSetup" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "hashedToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("hashedToken")
);

-- CreateTable
CREATE TABLE "MagicToken" (
    "hashedToken" TEXT NOT NULL,
    "hashedOtp" TEXT,
    "deviceId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MagicToken_pkey" PRIMARY KEY ("hashedToken")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionTemplate_currentVersionId_key" ON "QuestionTemplate"("currentVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionVersion_templateId_version_key" ON "QuestionVersion"("templateId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "FormSectionDraft_formId_slug_key" ON "FormSectionDraft"("formId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionLinkDraft_questionDraftId_key" ON "QuestionLinkDraft"("questionDraftId");

-- CreateIndex
CREATE UNIQUE INDEX "FormSectionPublished_formId_slug_key" ON "FormSectionPublished"("formId", "slug");

-- CreateIndex
CREATE INDEX "ApplicationResponse_formId_idx" ON "ApplicationResponse"("formId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationResponse_userId_formId_key" ON "ApplicationResponse"("userId", "formId");

-- CreateIndex
CREATE INDEX "Answer_applicationId_publishedSectionId_publishedDisplayOrd_idx" ON "Answer"("applicationId", "publishedSectionId", "publishedDisplayOrder");

-- CreateIndex
CREATE INDEX "Answer_questionVersionId_idx" ON "Answer"("questionVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_applicationId_questionVersionId_key" ON "Answer"("applicationId", "questionVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "QuestionTemplate" ADD CONSTRAINT "QuestionTemplate_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "QuestionVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionVersion" ADD CONSTRAINT "QuestionVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "QuestionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSectionDraft" ADD CONSTRAINT "FormSectionDraft_formId_fkey" FOREIGN KEY ("formId") REFERENCES "ApplicationFormDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOptionDraft" ADD CONSTRAINT "QuestionOptionDraft_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionLinkDraft" ADD CONSTRAINT "QuestionLinkDraft_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "FormSectionDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionLinkDraft" ADD CONSTRAINT "QuestionLinkDraft_questionDraftId_fkey" FOREIGN KEY ("questionDraftId") REFERENCES "QuestionDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionLinkDraft" ADD CONSTRAINT "QuestionLinkDraft_questionVersionId_fkey" FOREIGN KEY ("questionVersionId") REFERENCES "QuestionVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationFormPublished" ADD CONSTRAINT "ApplicationFormPublished_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ApplicationFormGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSectionPublished" ADD CONSTRAINT "FormSectionPublished_formId_fkey" FOREIGN KEY ("formId") REFERENCES "ApplicationFormPublished"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionLinkPublished" ADD CONSTRAINT "QuestionLinkPublished_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "FormSectionPublished"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionLinkPublished" ADD CONSTRAINT "QuestionLinkPublished_questionVersionId_fkey" FOREIGN KEY ("questionVersionId") REFERENCES "QuestionVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationResponse" ADD CONSTRAINT "ApplicationResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationResponse" ADD CONSTRAINT "ApplicationResponse_formId_fkey" FOREIGN KEY ("formId") REFERENCES "ApplicationFormPublished"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationResponse" ADD CONSTRAINT "ApplicationResponse_formGroupId_fkey" FOREIGN KEY ("formGroupId") REFERENCES "ApplicationFormGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ApplicationResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_publishedSectionId_publishedDisplayOrder_fkey" FOREIGN KEY ("publishedSectionId", "publishedDisplayOrder") REFERENCES "QuestionLinkPublished"("sectionId", "displayOrder") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionVersionId_fkey" FOREIGN KEY ("questionVersionId") REFERENCES "QuestionVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_fileUploadId_fkey" FOREIGN KEY ("fileUploadId") REFERENCES "FileUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerOptionSelection" ADD CONSTRAINT "AnswerOptionSelection_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerOptionSelection" ADD CONSTRAINT "AnswerOptionSelection_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "QuestionOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

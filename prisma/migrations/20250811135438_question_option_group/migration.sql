-- AlterTable
ALTER TABLE "QuestionOption" ADD COLUMN     "questionOptionGroupId" TEXT;

-- AlterTable
ALTER TABLE "QuestionOptionDraft" ADD COLUMN     "questionOptionGroupId" TEXT;

-- CreateTable
CREATE TABLE "QuestionOptionGroup" (
    "id" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "QuestionOptionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOptionGroupDraft" (
    "id" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "QuestionOptionGroupDraft_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionOptionGroupId_fkey" FOREIGN KEY ("questionOptionGroupId") REFERENCES "QuestionOptionGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOptionDraft" ADD CONSTRAINT "QuestionOptionDraft_questionOptionGroupId_fkey" FOREIGN KEY ("questionOptionGroupId") REFERENCES "QuestionOptionGroupDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

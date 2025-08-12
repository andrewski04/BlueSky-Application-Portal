/*
  Warnings:

  - Added the required column `text` to the `QuestionOptionGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `QuestionOptionGroupDraft` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuestionOptionGroup" ADD COLUMN     "text" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QuestionOptionGroupDraft" ADD COLUMN     "text" TEXT NOT NULL;

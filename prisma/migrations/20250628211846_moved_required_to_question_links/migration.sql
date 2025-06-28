/*
  Warnings:

  - You are about to drop the column `required` on the `QuestionDraft` table. All the data in the column will be lost.
  - You are about to drop the column `required` on the `QuestionVersion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QuestionDraft" DROP COLUMN "required";

-- AlterTable
ALTER TABLE "QuestionLinkDraft" ADD COLUMN     "required" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "QuestionLinkPublished" ADD COLUMN     "required" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "QuestionVersion" DROP COLUMN "required";

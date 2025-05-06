/*
  Warnings:

  - Added the required column `slug` to the `FormQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `FormQuestionOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FormQuestion" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FormQuestionOption" ADD COLUMN     "slug" TEXT NOT NULL;

/*
  Warnings:

  - Made the column `colorScheme` on table `FormSectionDraft` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FormSectionDraft" ALTER COLUMN "colorScheme" SET NOT NULL;

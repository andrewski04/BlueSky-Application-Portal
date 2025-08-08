/*
  Warnings:

  - Made the column `colorScheme` on table `FormSectionPublished` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FormSectionPublished" ALTER COLUMN "colorScheme" SET NOT NULL;

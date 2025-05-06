/*
  Warnings:

  - Added the required column `slug` to the `FormSection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FormSection" ADD COLUMN     "slug" TEXT NOT NULL;

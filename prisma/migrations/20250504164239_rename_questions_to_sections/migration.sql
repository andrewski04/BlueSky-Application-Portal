/*
  Warnings:

  - You are about to drop the column `questions` on the `ApplicationForm` table. All the data in the column will be lost.
  - Added the required column `sections` to the `ApplicationForm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApplicationForm" DROP COLUMN "questions",
ADD COLUMN     "sections" JSONB NOT NULL;

/*
  Warnings:

  - You are about to drop the column `group` on the `ApplicationFormPublished` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ApplicationFormPublished" DROP COLUMN "group",
ADD COLUMN     "groupId" TEXT;

-- CreateTable
CREATE TABLE "ApplicationFormGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ApplicationFormGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ApplicationFormPublished" ADD CONSTRAINT "ApplicationFormPublished_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ApplicationFormGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

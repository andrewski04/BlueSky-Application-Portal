/*
  Warnings:

  - You are about to drop the column `order` on the `FormQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `FormQuestionOption` table. All the data in the column will be lost.
  - Added the required column `displayOrder` to the `FormQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayOrder` to the `FormQuestionOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FormQuestion" DROP COLUMN "order",
ADD COLUMN     "displayOrder" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "FormQuestionOption" DROP COLUMN "order",
ADD COLUMN     "displayOrder" INTEGER NOT NULL;

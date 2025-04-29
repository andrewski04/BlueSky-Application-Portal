/*
  Warnings:

  - You are about to drop the column `otp` on the `MagicToken` table. All the data in the column will be lost.
  - Added the required column `hashedOtp` to the `MagicToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MagicToken" DROP COLUMN "otp",
ADD COLUMN     "hashedOtp" TEXT NOT NULL;

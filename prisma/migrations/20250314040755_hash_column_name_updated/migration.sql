/*
  Warnings:

  - The primary key for the `MagicToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `token` on the `MagicToken` table. All the data in the column will be lost.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Session` table. All the data in the column will be lost.
  - Added the required column `hashedToken` to the `MagicToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hashedToken` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MagicToken" DROP CONSTRAINT "MagicToken_pkey",
DROP COLUMN "token",
ADD COLUMN     "hashedToken" TEXT NOT NULL,
ADD CONSTRAINT "MagicToken_pkey" PRIMARY KEY ("hashedToken");

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
DROP COLUMN "id",
ADD COLUMN     "hashedToken" TEXT NOT NULL,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("hashedToken");

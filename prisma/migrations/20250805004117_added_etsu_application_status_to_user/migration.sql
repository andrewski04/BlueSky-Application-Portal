-- AlterTable
ALTER TABLE "User" ADD COLUMN     "etsuApplicationComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "etsuENumber" TEXT,
ADD COLUMN     "etsuEmail" TEXT;

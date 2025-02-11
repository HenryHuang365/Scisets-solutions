/*
  Warnings:

  - You are about to drop the column `timesSend` on the `Otp` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Otp" DROP COLUMN "timesSend",
ADD COLUMN     "used" BOOLEAN NOT NULL DEFAULT false;

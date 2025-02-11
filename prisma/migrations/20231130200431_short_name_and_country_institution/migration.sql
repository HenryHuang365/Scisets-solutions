/*
  Warnings:

  - You are about to drop the column `info` on the `Institution` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Institution" DROP COLUMN "info",
ADD COLUMN     "country" TEXT,
ADD COLUMN     "shortName" TEXT;

-- AddForeignKey
ALTER TABLE "Institution" ADD CONSTRAINT "Institution_country_fkey" FOREIGN KEY ("country") REFERENCES "Country"("alpha2") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - Made the column `area` on table `AnalyticQuery` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AnalyticQuery" ALTER COLUMN "area" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "AnalyticQuery" ADD CONSTRAINT "AnalyticQuery_area_fkey" FOREIGN KEY ("area") REFERENCES "Area"("area") ON DELETE RESTRICT ON UPDATE CASCADE;

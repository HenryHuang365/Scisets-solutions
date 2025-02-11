/*
  Warnings:

  - The `vote` column on the `AnalyticQuery` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "AnalyticQuery" DROP COLUMN "vote",
ADD COLUMN     "vote" JSONB[] DEFAULT ARRAY[]::JSONB[];

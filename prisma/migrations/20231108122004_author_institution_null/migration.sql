-- DropForeignKey
ALTER TABLE "Authors" DROP CONSTRAINT "Authors_institution_fkey";

-- AlterTable
ALTER TABLE "Authors" ALTER COLUMN "institution" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Authors" ADD CONSTRAINT "Authors_institution_fkey" FOREIGN KEY ("institution") REFERENCES "Institution"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "LoggingType" AS ENUM ('CHATS', 'FILE', 'PAGE');

-- AlterTable
ALTER TABLE "Logging" ADD COLUMN     "type" "LoggingType";

-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('AI_CHAT', 'ANALYTICS');

-- AlterTable
ALTER TABLE "Chats" ADD COLUMN     "title" TEXT,
ADD COLUMN     "type" "ChatType" NOT NULL DEFAULT 'AI_CHAT';

-- CreateTable
CREATE TABLE "WriteHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "request" JSONB,
    "response" TEXT,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WriteHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WriteHistory" ADD CONSTRAINT "WriteHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

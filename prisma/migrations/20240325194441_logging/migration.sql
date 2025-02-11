-- CreateTable
CREATE TABLE "Logging" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "request" TEXT,
    "response" TEXT,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Logging_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Logging" ADD CONSTRAINT "Logging_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

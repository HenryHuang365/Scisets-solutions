-- CreateTable
CREATE TABLE "AnalyticQuery" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "query" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticQuery_pkey" PRIMARY KEY ("id")
);

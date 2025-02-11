-- CreateTable
CREATE TABLE "Area" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "area" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "F3Data" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "area" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "F3Data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "F7Data" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "area" TEXT NOT NULL,
    "news" TEXT,
    "twitter" TEXT,
    "facebook" TEXT,
    "reddit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "F7Data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Area_area_key" ON "Area"("area");

-- AddForeignKey
ALTER TABLE "ImageAI" ADD CONSTRAINT "ImageAI_tag_fkey" FOREIGN KEY ("tag") REFERENCES "Area"("area") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "F3Data" ADD CONSTRAINT "F3Data_area_fkey" FOREIGN KEY ("area") REFERENCES "Area"("area") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "F7Data" ADD CONSTRAINT "F7Data_area_fkey" FOREIGN KEY ("area") REFERENCES "Area"("area") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "F4Data" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "area" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "data" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "F4Data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" INTEGER NOT NULL,
    "alpha2" TEXT NOT NULL,
    "alpha3" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_alpha2_key" ON "Country"("alpha2");

-- CreateIndex
CREATE UNIQUE INDEX "Country_alpha3_key" ON "Country"("alpha3");

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- AddForeignKey
ALTER TABLE "F4Data" ADD CONSTRAINT "F4Data_area_fkey" FOREIGN KEY ("area") REFERENCES "Area"("area") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "F4Data" ADD CONSTRAINT "F4Data_country_fkey" FOREIGN KEY ("country") REFERENCES "Country"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

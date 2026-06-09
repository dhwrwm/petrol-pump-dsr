-- CreateTable
CREATE TABLE "FuelRate" (
    "id" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "productType" "ProductType" NOT NULL,
    "rate" DECIMAL(12,2) NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FuelRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FuelRate_stationId_productType_effectiveDate_key" ON "FuelRate"("stationId", "productType", "effectiveDate");

-- AddForeignKey
ALTER TABLE "FuelRate" ADD CONSTRAINT "FuelRate_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

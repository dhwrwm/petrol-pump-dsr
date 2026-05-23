-- CreateTable
CREATE TABLE "PumpBoy" (
    "id" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PumpBoy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NozzleAssignment" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "nozzleId" TEXT NOT NULL,
    "pumpBoyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NozzleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NozzleAssignment_shiftId_nozzleId_pumpBoyId_key" ON "NozzleAssignment"("shiftId", "nozzleId", "pumpBoyId");

-- AddForeignKey
ALTER TABLE "PumpBoy" ADD CONSTRAINT "PumpBoy_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NozzleAssignment" ADD CONSTRAINT "NozzleAssignment_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NozzleAssignment" ADD CONSTRAINT "NozzleAssignment_nozzleId_fkey" FOREIGN KEY ("nozzleId") REFERENCES "Nozzle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NozzleAssignment" ADD CONSTRAINT "NozzleAssignment_pumpBoyId_fkey" FOREIGN KEY ("pumpBoyId") REFERENCES "PumpBoy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

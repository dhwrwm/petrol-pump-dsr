-- DropForeignKey
ALTER TABLE "InventoryMovement" DROP CONSTRAINT "InventoryMovement_productId_fkey";

-- DropForeignKey
ALTER TABLE "Price" DROP CONSTRAINT "Price_productId_fkey";

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_productId_fkey";

-- DropForeignKey
ALTER TABLE "_DispenserToNozzle" DROP CONSTRAINT "_DispenserToNozzle_A_fkey";

-- DropForeignKey
ALTER TABLE "_DispenserToNozzle" DROP CONSTRAINT "_DispenserToNozzle_B_fkey";

-- DropForeignKey
ALTER TABLE "_DispenserToTank" DROP CONSTRAINT "_DispenserToTank_A_fkey";

-- DropForeignKey
ALTER TABLE "_DispenserToTank" DROP CONSTRAINT "_DispenserToTank_B_fkey";

-- AlterTable
ALTER TABLE "Nozzle" DROP COLUMN "closingMeterReading",
DROP COLUMN "date",
DROP COLUMN "nozzleTestingLiters",
DROP COLUMN "openingMeterReading",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "nozzleNumber" INTEGER NOT NULL,
ADD COLUMN     "tankId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "productId",
ADD COLUMN     "meterReadingId" TEXT NOT NULL,
ADD COLUMN     "productType" "ProductType" NOT NULL DEFAULT 'MS',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Station" ADD COLUMN     "shiftsPerDay" INTEGER NOT NULL DEFAULT 2;

-- DropTable
DROP TABLE "InventoryMovement";

-- DropTable
DROP TABLE "Price";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "_DispenserToNozzle";

-- DropTable
DROP TABLE "_DispenserToTank";

-- DropEnum
DROP TYPE "InventoryMovementType";

-- CreateIndex
CREATE UNIQUE INDEX "Nozzle_dispenserId_nozzleNumber_key" ON "Nozzle"("dispenserId", "nozzleNumber");

-- AddForeignKey
ALTER TABLE "Nozzle" ADD CONSTRAINT "Nozzle_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "Tank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nozzle" ADD CONSTRAINT "Nozzle_dispenserId_fkey" FOREIGN KEY ("dispenserId") REFERENCES "Dispenser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeterReading" ADD CONSTRAINT "MeterReading_nozzleId_fkey" FOREIGN KEY ("nozzleId") REFERENCES "Nozzle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_nozzleId_fkey" FOREIGN KEY ("nozzleId") REFERENCES "Nozzle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_meterReadingId_fkey" FOREIGN KEY ("meterReadingId") REFERENCES "MeterReading"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

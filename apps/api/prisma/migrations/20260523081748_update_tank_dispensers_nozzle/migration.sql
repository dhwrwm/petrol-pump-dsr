/*
  Warnings:

  - You are about to drop the column `name` on the `Dispenser` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `Nozzle` table. All the data in the column will be lost.
  - You are about to drop the column `openingMeter` on the `Nozzle` table. All the data in the column will be lost.
  - You are about to drop the column `tankId` on the `Nozzle` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Tank` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `Tank` table. All the data in the column will be lost.
  - Added the required column `companyName` to the `Dispenser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openingMeterReading` to the `Nozzle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productType` to the `Nozzle` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('MS', 'HSD', 'XP95', 'OTHERS');

-- DropForeignKey
ALTER TABLE "InventoryMovement" DROP CONSTRAINT "InventoryMovement_tankId_fkey";

-- DropForeignKey
ALTER TABLE "MeterReading" DROP CONSTRAINT "MeterReading_nozzleId_fkey";

-- DropForeignKey
ALTER TABLE "Nozzle" DROP CONSTRAINT "Nozzle_dispenserId_fkey";

-- DropForeignKey
ALTER TABLE "Nozzle" DROP CONSTRAINT "Nozzle_tankId_fkey";

-- DropForeignKey
ALTER TABLE "NozzleAssignment" DROP CONSTRAINT "NozzleAssignment_nozzleId_fkey";

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_nozzleId_fkey";

-- DropForeignKey
ALTER TABLE "Tank" DROP CONSTRAINT "Tank_productId_fkey";

-- AlterTable
ALTER TABLE "Dispenser" DROP COLUMN "name",
ADD COLUMN     "companyName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Nozzle" DROP COLUMN "label",
DROP COLUMN "openingMeter",
DROP COLUMN "tankId",
ADD COLUMN     "closingMeterReading" DECIMAL(14,3),
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nozzleTestingLiters" DECIMAL(12,3) NOT NULL DEFAULT 0,
ADD COLUMN     "openingMeterReading" DECIMAL(14,3) NOT NULL,
ADD COLUMN     "productType" "ProductType" NOT NULL;

-- AlterTable
ALTER TABLE "Tank" DROP COLUMN "name",
DROP COLUMN "productId",
ADD COLUMN     "productType" "ProductType" NOT NULL DEFAULT 'MS';

-- CreateTable
CREATE TABLE "CalibrationRenewal" (
    "id" TEXT NOT NULL,
    "nozzleId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "supportingDocuments" TEXT[],

    CONSTRAINT "CalibrationRenewal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DispenserToNozzle" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DispenserToNozzle_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DispenserToTank" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DispenserToTank_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DispenserToNozzle_B_index" ON "_DispenserToNozzle"("B");

-- CreateIndex
CREATE INDEX "_DispenserToTank_B_index" ON "_DispenserToTank"("B");

-- AddForeignKey
ALTER TABLE "CalibrationRenewal" ADD CONSTRAINT "CalibrationRenewal_nozzleId_fkey" FOREIGN KEY ("nozzleId") REFERENCES "Nozzle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DispenserToNozzle" ADD CONSTRAINT "_DispenserToNozzle_A_fkey" FOREIGN KEY ("A") REFERENCES "Dispenser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DispenserToNozzle" ADD CONSTRAINT "_DispenserToNozzle_B_fkey" FOREIGN KEY ("B") REFERENCES "Nozzle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DispenserToTank" ADD CONSTRAINT "_DispenserToTank_A_fkey" FOREIGN KEY ("A") REFERENCES "Dispenser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DispenserToTank" ADD CONSTRAINT "_DispenserToTank_B_fkey" FOREIGN KEY ("B") REFERENCES "Tank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

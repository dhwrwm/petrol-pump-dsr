/*
  Warnings:

  - You are about to drop the column `pumpBoyId` on the `NozzleAssignment` table. All the data in the column will be lost.
  - You are about to drop the `PumpBoy` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[shiftId,nozzleId,employeeId]` on the table `NozzleAssignment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `employeeId` to the `NozzleAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('AADHAR', 'PAN', 'DRIVING_LICENSE', 'OTHER');

-- DropForeignKey
ALTER TABLE "NozzleAssignment" DROP CONSTRAINT "NozzleAssignment_pumpBoyId_fkey";

-- DropForeignKey
ALTER TABLE "PumpBoy" DROP CONSTRAINT "PumpBoy_stationId_fkey";

-- DropIndex
DROP INDEX "NozzleAssignment_shiftId_nozzleId_pumpBoyId_key";

-- AlterTable
ALTER TABLE "NozzleAssignment" DROP COLUMN "pumpBoyId",
ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "shortageDeduction" DECIMAL(10,2),
ADD COLUMN     "shortageReason" TEXT;

-- DropTable
DROP TABLE "PumpBoy";

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "designation" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL,
    "resignedAt" TIMESTAMP(3),
    "salary" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeDocument" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryRecord" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "paid" DECIMAL(10,2) NOT NULL,
    "advance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deductions" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalaryRecord_employeeId_month_key" ON "SalaryRecord"("employeeId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "NozzleAssignment_shiftId_nozzleId_employeeId_key" ON "NozzleAssignment"("shiftId", "nozzleId", "employeeId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDocument" ADD CONSTRAINT "EmployeeDocument_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryRecord" ADD CONSTRAINT "SalaryRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NozzleAssignment" ADD CONSTRAINT "NozzleAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

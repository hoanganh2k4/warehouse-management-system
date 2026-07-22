/*
  Warnings:

  - A unique constraint covering the columns `[orderCode]` on the table `schedules` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AllocationKind" AS ENUM ('SUGGESTED', 'ACTUAL');

-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "orderCode" TEXT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "dailySeq" INTEGER,
ADD COLUMN     "quantityAfter" INTEGER,
ADD COLUMN     "quantityBefore" INTEGER;

-- CreateTable
CREATE TABLE "schedule_allocations" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "kind" "AllocationKind" NOT NULL,
    "slotId" TEXT NOT NULL,
    "batchId" TEXT,
    "quantity" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "schedule_allocations_scheduleId_kind_idx" ON "schedule_allocations"("scheduleId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "schedules_orderCode_key" ON "schedules"("orderCode");

-- CreateIndex
CREATE INDEX "transactions_createdAt_dailySeq_idx" ON "transactions"("createdAt", "dailySeq");

-- AddForeignKey
ALTER TABLE "schedule_allocations" ADD CONSTRAINT "schedule_allocations_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_allocations" ADD CONSTRAINT "schedule_allocations_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_allocations" ADD CONSTRAINT "schedule_allocations_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

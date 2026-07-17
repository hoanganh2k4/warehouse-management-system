-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AllocationMethod" AS ENUM ('SMART_ALLOCATION', 'MANUAL_OVERRIDE');

-- CreateEnum
CREATE TYPE "SelectionMethod" AS ENUM ('FEFO', 'MANUAL_OVERRIDE');

-- CreateEnum
CREATE TYPE "ScheduleOverrideReason" AS ENUM ('SLOT_MAINTENANCE', 'SLOT_FULL', 'FORKLIFT_UNAVAILABLE', 'MANAGEMENT_REQUEST', 'OTHER');

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "type" "ScheduleType" NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "batchCode" TEXT,
    "supplierId" TEXT,
    "customerId" TEXT,
    "note" TEXT,
    "suggestedSlotId" TEXT,
    "suggestedBatchId" TEXT,
    "suggestionScore" DOUBLE PRECISION,
    "suggestionReasons" TEXT[],
    "suggestedAt" TIMESTAMP(3),
    "actualSlotId" TEXT,
    "actualBatchId" TEXT,
    "allocationMethod" "AllocationMethod",
    "selectionMethod" "SelectionMethod",
    "overrideReason" "ScheduleOverrideReason",
    "overrideReasonNote" TEXT,
    "executedById" TEXT,
    "executedAt" TIMESTAMP(3),
    "transactionId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schedules_transactionId_key" ON "schedules"("transactionId");

-- CreateIndex
CREATE INDEX "schedules_type_idx" ON "schedules"("type");

-- CreateIndex
CREATE INDEX "schedules_status_idx" ON "schedules"("status");

-- CreateIndex
CREATE INDEX "schedules_scheduledAt_idx" ON "schedules"("scheduledAt");

-- CreateIndex
CREATE INDEX "schedules_productId_idx" ON "schedules"("productId");

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_suggestedSlotId_fkey" FOREIGN KEY ("suggestedSlotId") REFERENCES "slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_suggestedBatchId_fkey" FOREIGN KEY ("suggestedBatchId") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_actualSlotId_fkey" FOREIGN KEY ("actualSlotId") REFERENCES "slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_actualBatchId_fkey" FOREIGN KEY ("actualBatchId") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_executedById_fkey" FOREIGN KEY ("executedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

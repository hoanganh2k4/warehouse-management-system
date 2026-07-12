-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- Seed categories from the old ProductCategory enum values so existing
-- products can be backfilled without losing data.
INSERT INTO "categories" ("id", "name", "description", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'MILK', 'Sữa', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'CRACKER', 'Bánh quy', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- AlterTable: add nullable categoryId first, backfill, then enforce NOT NULL
ALTER TABLE "products" ADD COLUMN "categoryId" TEXT;

UPDATE "products" p
SET "categoryId" = c."id"
FROM "categories" c
WHERE c."name" = p."category"::text;

ALTER TABLE "products" ALTER COLUMN "categoryId" SET NOT NULL;

-- DropIndex (old enum-based index)
DROP INDEX IF EXISTS "products_category_idx";

-- AlterTable: drop the old enum column now that data has moved
ALTER TABLE "products" DROP COLUMN "category";

-- DropEnum
DROP TYPE "ProductCategory";

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

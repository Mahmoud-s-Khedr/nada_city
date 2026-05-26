-- AlterTable
ALTER TABLE "Unit" ALTER COLUMN "price" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SellUnitRequest" ALTER COLUMN "price" DROP NOT NULL;

-- AlterTable
ALTER TABLE "FurnitureItem" ALTER COLUMN "price" DROP NOT NULL;

-- DropIndex
DROP INDEX "groups_visibility_idx";

-- AlterTable
ALTER TABLE "groups" DROP COLUMN "visibility";

-- DropEnum
DROP TYPE "GroupVisibility";

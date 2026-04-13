/*
  Warnings:

  - You are about to drop the column `districtId` on the `Person` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_districtId_fkey";

-- DropIndex
DROP INDEX "Person_firstName_lastName_districtId_userId_idx";

-- AlterTable
ALTER TABLE "Person" DROP COLUMN "districtId";

-- CreateIndex
CREATE INDEX "Person_firstName_lastName_userId_idx" ON "Person"("firstName", "lastName", "userId");

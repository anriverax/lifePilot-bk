/*
  Warnings:

  - You are about to drop the column `personId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Person` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Person` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_personId_fkey";

-- DropIndex
DROP INDEX "Person_firstName_lastName_districtId_idx";

-- DropIndex
DROP INDEX "User_email_roleId_personId_idx";

-- DropIndex
DROP INDEX "User_personId_key";

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "personId",
ALTER COLUMN "roleId" SET DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "Person_userId_key" ON "Person"("userId");

-- CreateIndex
CREATE INDEX "Person_firstName_lastName_districtId_userId_idx" ON "Person"("firstName", "lastName", "districtId", "userId");

-- CreateIndex
CREATE INDEX "User_email_roleId_idx" ON "User"("email", "roleId");

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

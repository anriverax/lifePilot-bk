/*
  Warnings:

  - You are about to drop the column `address` on the `Person` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Person" DROP COLUMN "address",
ADD COLUMN     "countryCode" TEXT NOT NULL DEFAULT 'SV';

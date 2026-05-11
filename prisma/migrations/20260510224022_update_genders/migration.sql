/*
  Warnings:

  - The values [H] on the enum `TypeGender` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TypeGender_new" AS ENUM ('M', 'F');
ALTER TABLE "Person" ALTER COLUMN "gender" TYPE "TypeGender_new" USING ("gender"::text::"TypeGender_new");
ALTER TYPE "TypeGender" RENAME TO "TypeGender_old";
ALTER TYPE "TypeGender_new" RENAME TO "TypeGender";
DROP TYPE "public"."TypeGender_old";
COMMIT;

/*
  Warnings:

  - You are about to drop the column `password` on the `organizations` table. All the data in the column will be lost.
  - Added the required column `password_hash` to the `organizations` table without a default value. This is not possible if the table is not empty.

*/
-- Add the new column with a default value first
ALTER TABLE "public"."organizations" ADD COLUMN "password_hash" TEXT;

-- Copy data from password to password_hash (assuming they are already hashed)
UPDATE "public"."organizations" SET "password_hash" = "password";

-- Make the column required
ALTER TABLE "public"."organizations" ALTER COLUMN "password_hash" SET NOT NULL;

-- Drop the old column
ALTER TABLE "public"."organizations" DROP COLUMN "password";

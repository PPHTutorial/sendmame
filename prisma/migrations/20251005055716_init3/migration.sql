/*
  Warnings:

  - The `attachments` column on the `messages` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."messages" DROP COLUMN "attachments",
ADD COLUMN     "attachments" JSONB[] DEFAULT ARRAY[]::JSONB[];

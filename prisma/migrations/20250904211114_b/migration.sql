/*
  Warnings:

  - You are about to drop the column `metadata` on the `verification_documents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."verification_documents" DROP COLUMN "metadata";

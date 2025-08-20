-- AlterTable
ALTER TABLE "public"."trips" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

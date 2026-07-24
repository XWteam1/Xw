/*
  Warnings:

  - You are about to drop the column `caption` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `copyBody` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `ctaNote` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `slides` on the `Asset` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "caption",
DROP COLUMN "copyBody",
DROP COLUMN "ctaNote",
DROP COLUMN "slides";

-- AlterTable
ALTER TABLE "ChannelKit" ADD COLUMN     "docUrl" TEXT;

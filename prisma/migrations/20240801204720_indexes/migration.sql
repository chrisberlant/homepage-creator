/*
  Warnings:

  - Added the required column `index` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `index` to the `Link` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "index" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "index" INTEGER NOT NULL;

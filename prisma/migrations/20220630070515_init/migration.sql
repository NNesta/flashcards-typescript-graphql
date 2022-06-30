/*
  Warnings:

  - You are about to drop the `DoneFlashcard` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DoneFlashcard" DROP CONSTRAINT "DoneFlashcard_flashcardId_fkey";

-- DropForeignKey
ALTER TABLE "DoneFlashcard" DROP CONSTRAINT "DoneFlashcard_userId_fkey";

-- DropTable
DROP TABLE "DoneFlashcard";

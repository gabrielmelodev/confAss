/*
  Warnings:

  - A unique constraint covering the columns `[numeroInscricao]` on the table `Inscricao` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `numeroInscricao` to the `Inscricao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Inscricao" ADD COLUMN     "numeroInscricao" INTEGER NOT NULL,
ADD COLUMN     "presencaConfirmada" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Inscricao_numeroInscricao_key" ON "Inscricao"("numeroInscricao");

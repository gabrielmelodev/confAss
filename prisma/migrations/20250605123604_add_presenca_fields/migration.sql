-- AlterTable
ALTER TABLE "Inscricao" ADD COLUMN     "dataPresenca" TIMESTAMP(3),
ADD COLUMN     "organizacaoId" TEXT,
ADD COLUMN     "presente" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Organizacao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Organizacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Inscricao" ADD CONSTRAINT "Inscricao_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "Organizacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

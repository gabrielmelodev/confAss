-- CreateTable
CREATE TABLE "Inscricao" (
    "id" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "nomeSocial" TEXT,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "idade" INTEGER NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT NOT NULL,
    "enderecoRua" TEXT NOT NULL,
    "enderecoBairro" TEXT NOT NULL,
    "enderecoCidadeUF" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "racaCor" TEXT NOT NULL,
    "pessoaComDeficiencia" BOOLEAN NOT NULL,
    "tipoDeficiencia" TEXT,
    "recursoAcessibilidade" BOOLEAN NOT NULL,
    "qualAcessibilidade" TEXT,
    "orientacaoSexual" TEXT NOT NULL,
    "tipoParticipante" TEXT NOT NULL,
    "representaOrganizacao" BOOLEAN NOT NULL,
    "organizacaoNome" TEXT,
    "jaParticipouConferencias" BOOLEAN NOT NULL,
    "eixoTematico" TEXT NOT NULL,
    "autorizacaoImagem" BOOLEAN NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inscricao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Inscricao_cpf_key" ON "Inscricao"("cpf");

-- CreateEnum
CREATE TYPE "UsuarioRole" AS ENUM ('ADMINISTRADOR', 'ANALISTA', 'VISUALIZADOR');

-- CreateEnum
CREATE TYPE "ConvenioStatus" AS ENUM ('RASCUNHO', 'EM_ANALISE', 'APROVADO', 'EM_EXECUCAO', 'CONCLUIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoComunicado" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('REUNIAO', 'PRESTACAO_CONTAS', 'ENTREGA_DOCUMENTOS', 'VENCIMENTO_ETAPA', 'OUTROS');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "UsuarioRole" NOT NULL DEFAULT 'ANALISTA',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Secretaria" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "sigla" TEXT,
    "responsavel" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Secretaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgaoConcedente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "esfera" TEXT,
    "contato" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgaoConcedente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Programa" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT,
    "descricao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Programa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FonteRecurso" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FonteRecurso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Convenio" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "objeto" TEXT NOT NULL,
    "status" "ConvenioStatus" NOT NULL DEFAULT 'RASCUNHO',
    "descricao" TEXT,
    "observacoes" TEXT,
    "valorGlobal" DECIMAL(14,2) NOT NULL,
    "valorRepasse" DECIMAL(14,2),
    "valorContrapartida" DECIMAL(14,2),
    "dataAssinatura" TIMESTAMP(3),
    "dataInicioVigencia" TIMESTAMP(3),
    "dataFimVigencia" TIMESTAMP(3),
    "dataPrestacaoContas" TIMESTAMP(3),
    "secretariaId" INTEGER NOT NULL,
    "orgaoId" INTEGER,
    "programaId" INTEGER,
    "fonteId" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Convenio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConvenioAnexo" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT,
    "convenioId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConvenioAnexo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EtapaConvenio" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "dataPrevista" TIMESTAMP(3),
    "dataRealizada" TIMESTAMP(3),
    "responsavel" TEXT,
    "situacao" TEXT,
    "convenioId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EtapaConvenio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comunicado" (
    "id" SERIAL NOT NULL,
    "protocolo" TEXT NOT NULL,
    "assunto" TEXT NOT NULL,
    "conteudo" TEXT,
    "tipo" "TipoComunicado" NOT NULL,
    "status" TEXT,
    "dataRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origem" TEXT,
    "destino" TEXT,
    "responsavel" TEXT,
    "arquivoUrl" TEXT,
    "convenioId" INTEGER,
    "criadoPorId" INTEGER,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comunicado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoAgenda" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "TipoEvento" NOT NULL DEFAULT 'OUTROS',
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "local" TEXT,
    "responsavel" TEXT,
    "convenioId" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventoAgenda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Secretaria_nome_key" ON "Secretaria"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Secretaria_sigla_key" ON "Secretaria"("sigla");

-- CreateIndex
CREATE UNIQUE INDEX "OrgaoConcedente_nome_key" ON "OrgaoConcedente"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Programa_nome_key" ON "Programa"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Programa_codigo_key" ON "Programa"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "FonteRecurso_nome_key" ON "FonteRecurso"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Convenio_codigo_key" ON "Convenio"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Comunicado_protocolo_key" ON "Comunicado"("protocolo");

-- AddForeignKey
ALTER TABLE "Convenio" ADD CONSTRAINT "Convenio_secretariaId_fkey" FOREIGN KEY ("secretariaId") REFERENCES "Secretaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convenio" ADD CONSTRAINT "Convenio_orgaoId_fkey" FOREIGN KEY ("orgaoId") REFERENCES "OrgaoConcedente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convenio" ADD CONSTRAINT "Convenio_programaId_fkey" FOREIGN KEY ("programaId") REFERENCES "Programa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convenio" ADD CONSTRAINT "Convenio_fonteId_fkey" FOREIGN KEY ("fonteId") REFERENCES "FonteRecurso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConvenioAnexo" ADD CONSTRAINT "ConvenioAnexo_convenioId_fkey" FOREIGN KEY ("convenioId") REFERENCES "Convenio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EtapaConvenio" ADD CONSTRAINT "EtapaConvenio_convenioId_fkey" FOREIGN KEY ("convenioId") REFERENCES "Convenio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comunicado" ADD CONSTRAINT "Comunicado_convenioId_fkey" FOREIGN KEY ("convenioId") REFERENCES "Convenio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comunicado" ADD CONSTRAINT "Comunicado_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoAgenda" ADD CONSTRAINT "EventoAgenda_convenioId_fkey" FOREIGN KEY ("convenioId") REFERENCES "Convenio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

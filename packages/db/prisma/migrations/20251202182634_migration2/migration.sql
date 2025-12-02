-- CreateEnum
CREATE TYPE "ModalidadeRepasse" AS ENUM ('CONVENIO', 'CONTRATO_REPASSE', 'TERMO_FOMENTO', 'TERMO_COLABORACAO');

-- CreateEnum
CREATE TYPE "EsferaGoverno" AS ENUM ('FEDERAL', 'ESTADUAL');

-- CreateEnum
CREATE TYPE "ModalidadeLicitacao" AS ENUM ('PREGAO', 'TOMADA_PRECOS', 'CONCORRENCIA', 'DISPENSA', 'INEXIGIBILIDADE');

-- CreateEnum
CREATE TYPE "StatusPendencia" AS ENUM ('ABERTA', 'EM_ANDAMENTO', 'RESOLVIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoAditivo" AS ENUM ('PRAZO', 'VALOR', 'PRAZO_E_VALOR', 'SUPRESSAO', 'ACRESCIMO');

-- AlterTable
ALTER TABLE "Convenio" ADD COLUMN     "clausulaSuspensiva" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dataInicioProcesso" TIMESTAMP(3),
ADD COLUMN     "esfera" "EsferaGoverno",
ADD COLUMN     "ministerioOrgao" TEXT,
ADD COLUMN     "modalidadeRepasse" "ModalidadeRepasse",
ADD COLUMN     "numeroProposta" TEXT,
ADD COLUMN     "numeroTermo" TEXT,
ADD COLUMN     "objetoDescricao" TEXT,
ADD COLUMN     "termoFormalizacao" TEXT;

-- CreateTable
CREATE TABLE "EmendaParlamentar" (
    "id" SERIAL NOT NULL,
    "nomeParlamentar" TEXT NOT NULL,
    "partido" TEXT,
    "codigoEmenda" TEXT,
    "funcao" TEXT,
    "subfuncao" TEXT,
    "programa" TEXT,
    "valorIndicado" DECIMAL(14,2),
    "anoEmenda" INTEGER,
    "convenioId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmendaParlamentar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceiroContas" (
    "id" SERIAL NOT NULL,
    "banco" TEXT,
    "agencia" TEXT,
    "contaBancaria" TEXT,
    "valorLiberadoTotal" DECIMAL(14,2),
    "saldoRendimentos" DECIMAL(14,2),
    "fichasOrcamentarias" TEXT,
    "observacoes" TEXT,
    "convenioId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceiroContas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoExecucao" (
    "id" SERIAL NOT NULL,
    "numProcessoLicitatorio" TEXT,
    "modalidadeLicitacao" "ModalidadeLicitacao",
    "numeroContrato" TEXT,
    "contratadaCnpj" TEXT,
    "contratadaNome" TEXT,
    "dataAssinatura" TIMESTAMP(3),
    "dataVigenciaInicio" TIMESTAMP(3),
    "dataVigenciaFim" TIMESTAMP(3),
    "dataOIS" TIMESTAMP(3),
    "valorContrato" DECIMAL(14,2),
    "valorExecutado" DECIMAL(14,2),
    "engenheiroResponsavel" TEXT,
    "creaEngenheiro" TEXT,
    "artRrt" TEXT,
    "situacao" TEXT,
    "observacoes" TEXT,
    "convenioId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContratoExecucao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medicao" (
    "id" SERIAL NOT NULL,
    "numeroMedicao" INTEGER NOT NULL,
    "dataMedicao" TIMESTAMP(3) NOT NULL,
    "percentualFisico" DECIMAL(5,2),
    "valorMedido" DECIMAL(14,2) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "valorPago" DECIMAL(14,2),
    "observacoes" TEXT,
    "situacao" TEXT,
    "contratoId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pendencia" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "responsavel" TEXT,
    "prazo" TIMESTAMP(3),
    "status" "StatusPendencia" NOT NULL DEFAULT 'ABERTA',
    "prioridade" INTEGER DEFAULT 2,
    "resolucao" TEXT,
    "dataResolucao" TIMESTAMP(3),
    "convenioId" INTEGER NOT NULL,
    "criadoPorId" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pendencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aditivo" (
    "id" SERIAL NOT NULL,
    "numeroAditivo" INTEGER NOT NULL,
    "tipoAditivo" "TipoAditivo" NOT NULL,
    "dataAssinatura" TIMESTAMP(3),
    "novaVigencia" TIMESTAMP(3),
    "valorAcrescimo" DECIMAL(14,2),
    "valorSupressao" DECIMAL(14,2),
    "motivo" TEXT,
    "justificativa" TEXT,
    "observacoes" TEXT,
    "convenioId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aditivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinanceiroContas_convenioId_key" ON "FinanceiroContas"("convenioId");

-- CreateIndex
CREATE UNIQUE INDEX "Medicao_contratoId_numeroMedicao_key" ON "Medicao"("contratoId", "numeroMedicao");

-- CreateIndex
CREATE UNIQUE INDEX "Aditivo_convenioId_numeroAditivo_key" ON "Aditivo"("convenioId", "numeroAditivo");

-- AddForeignKey
ALTER TABLE "EmendaParlamentar" ADD CONSTRAINT "EmendaParlamentar_convenioId_fkey" FOREIGN KEY ("convenioId") REFERENCES "Convenio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceiroContas" ADD CONSTRAINT "FinanceiroContas_convenioId_fkey" FOREIGN KEY ("convenioId") REFERENCES "Convenio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoExecucao" ADD CONSTRAINT "ContratoExecucao_convenioId_fkey" FOREIGN KEY ("convenioId") REFERENCES "Convenio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medicao" ADD CONSTRAINT "Medicao_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "ContratoExecucao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pendencia" ADD CONSTRAINT "Pendencia_convenioId_fkey" FOREIGN KEY ("convenioId") REFERENCES "Convenio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pendencia" ADD CONSTRAINT "Pendencia_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aditivo" ADD CONSTRAINT "Aditivo_convenioId_fkey" FOREIGN KEY ("convenioId") REFERENCES "Convenio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

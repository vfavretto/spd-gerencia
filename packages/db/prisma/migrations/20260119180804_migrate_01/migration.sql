-- CreateTable
CREATE TABLE `Usuario` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMINISTRADOR', 'ANALISTA', 'VISUALIZADOR') NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Secretaria` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `sigla` VARCHAR(191) NULL,
    `responsavel` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrgaoConcedente` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `esfera` VARCHAR(191) NULL,
    `contato` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Programa` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NULL,
    `descricao` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FonteRecurso` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Convenio` (
    `id` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `objeto` VARCHAR(191) NOT NULL,
    `status` ENUM('RASCUNHO', 'EM_ANALISE', 'APROVADO', 'EM_EXECUCAO', 'CONCLUIDO', 'CANCELADO') NOT NULL DEFAULT 'RASCUNHO',
    `descricao` VARCHAR(191) NULL,
    `observacoes` VARCHAR(191) NULL,
    `numeroProposta` VARCHAR(191) NULL,
    `dataInicioProcesso` DATETIME(3) NULL,
    `modalidadeRepasse` ENUM('CONVENIO', 'CONTRATO_REPASSE', 'TERMO_FOMENTO', 'TERMO_COLABORACAO') NULL,
    `termoFormalizacao` VARCHAR(191) NULL,
    `numeroTermo` VARCHAR(191) NULL,
    `clausulaSuspensiva` BOOLEAN NOT NULL DEFAULT false,
    `esfera` ENUM('FEDERAL', 'ESTADUAL') NULL,
    `ministerioOrgao` VARCHAR(191) NULL,
    `objetoDescricao` VARCHAR(191) NULL,
    `valorGlobal` DECIMAL(15, 2) NOT NULL,
    `valorRepasse` DECIMAL(15, 2) NULL,
    `valorContrapartida` DECIMAL(15, 2) NULL,
    `dataAssinatura` DATETIME(3) NULL,
    `dataInicioVigencia` DATETIME(3) NULL,
    `dataFimVigencia` DATETIME(3) NULL,
    `dataPrestacaoContas` DATETIME(3) NULL,
    `processoSPD` VARCHAR(191) NULL,
    `processoCreditoAdicional` VARCHAR(191) NULL,
    `area` VARCHAR(191) NULL,
    `secretariaId` VARCHAR(191) NOT NULL,
    `orgaoId` VARCHAR(191) NULL,
    `programaId` VARCHAR(191) NULL,
    `fonteId` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Convenio_codigo_key`(`codigo`),
    INDEX `Convenio_status_idx`(`status`),
    INDEX `Convenio_secretariaId_idx`(`secretariaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConvenioAnexo` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `convenioId` VARCHAR(191) NOT NULL,

    INDEX `ConvenioAnexo_convenioId_idx`(`convenioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EtapaConvenio` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `dataPrevista` DATETIME(3) NULL,
    `dataRealizada` DATETIME(3) NULL,
    `responsavel` VARCHAR(191) NULL,
    `situacao` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `convenioId` VARCHAR(191) NOT NULL,

    INDEX `EtapaConvenio_convenioId_idx`(`convenioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmendaParlamentar` (
    `id` VARCHAR(191) NOT NULL,
    `nomeParlamentar` VARCHAR(191) NOT NULL,
    `partido` VARCHAR(191) NULL,
    `codigoEmenda` VARCHAR(191) NULL,
    `funcao` VARCHAR(191) NULL,
    `subfuncao` VARCHAR(191) NULL,
    `programa` VARCHAR(191) NULL,
    `valorIndicado` DECIMAL(15, 2) NULL,
    `anoEmenda` INTEGER NULL,
    `convenioId` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `EmendaParlamentar_convenioId_idx`(`convenioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FinanceiroContas` (
    `id` VARCHAR(191) NOT NULL,
    `banco` VARCHAR(191) NULL,
    `agencia` VARCHAR(191) NULL,
    `contaBancaria` VARCHAR(191) NULL,
    `valorLiberadoTotal` DECIMAL(15, 2) NULL,
    `saldoRendimentos` DECIMAL(15, 2) NULL,
    `fichasOrcamentarias` VARCHAR(191) NULL,
    `observacoes` VARCHAR(191) NULL,
    `codigoReceita` VARCHAR(191) NULL,
    `dataDeposito` DATETIME(3) NULL,
    `valorCPExclusiva` DECIMAL(15, 2) NULL,
    `convenioId` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `FinanceiroContas_convenioId_key`(`convenioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FichaOrcamentaria` (
    `id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `tipo` ENUM('REPASSE', 'CONTRAPARTIDA', 'EXCLUSIVO') NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `valor` DECIMAL(15, 2) NULL,
    `convenioId` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `FichaOrcamentaria_convenioId_idx`(`convenioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotaEmpenho` (
    `id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `tipo` ENUM('REPASSE', 'CONTRAPARTIDA', 'EXCLUSIVO') NOT NULL,
    `valor` DECIMAL(15, 2) NOT NULL,
    `dataEmissao` DATETIME(3) NOT NULL,
    `observacoes` VARCHAR(191) NULL,
    `convenioId` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `NotaEmpenho_convenioId_idx`(`convenioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContratoExecucao` (
    `id` VARCHAR(191) NOT NULL,
    `numProcessoLicitatorio` VARCHAR(191) NULL,
    `modalidadeLicitacao` ENUM('PREGAO', 'TOMADA_PRECOS', 'CONCORRENCIA', 'DISPENSA', 'INEXIGIBILIDADE') NULL,
    `numeroContrato` VARCHAR(191) NULL,
    `contratadaCnpj` VARCHAR(191) NULL,
    `contratadaNome` VARCHAR(191) NULL,
    `dataAssinatura` DATETIME(3) NULL,
    `dataVigenciaInicio` DATETIME(3) NULL,
    `dataVigenciaFim` DATETIME(3) NULL,
    `dataOIS` DATETIME(3) NULL,
    `valorContrato` DECIMAL(15, 2) NULL,
    `valorExecutado` DECIMAL(15, 2) NULL,
    `engenheiroResponsavel` VARCHAR(191) NULL,
    `creaEngenheiro` VARCHAR(191) NULL,
    `artRrt` VARCHAR(191) NULL,
    `situacao` VARCHAR(191) NULL,
    `observacoes` VARCHAR(191) NULL,
    `cno` VARCHAR(191) NULL,
    `prazoExecucaoDias` INTEGER NULL,
    `dataTerminoExecucao` DATETIME(3) NULL,
    `convenioId` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `ContratoExecucao_convenioId_idx`(`convenioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Medicao` (
    `id` VARCHAR(191) NOT NULL,
    `numeroMedicao` INTEGER NOT NULL,
    `dataMedicao` DATETIME(3) NOT NULL,
    `percentualFisico` DECIMAL(5, 2) NULL,
    `valorMedido` DECIMAL(15, 2) NOT NULL,
    `dataPagamento` DATETIME(3) NULL,
    `valorPago` DECIMAL(15, 2) NULL,
    `observacoes` VARCHAR(191) NULL,
    `situacao` VARCHAR(191) NULL,
    `processoMedicao` VARCHAR(191) NULL,
    `contratoId` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `Medicao_contratoId_idx`(`contratoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Aditivo` (
    `id` VARCHAR(191) NOT NULL,
    `numeroAditivo` INTEGER NOT NULL,
    `tipoAditivo` ENUM('PRAZO', 'VALOR', 'PRAZO_E_VALOR', 'SUPRESSAO', 'ACRESCIMO') NOT NULL,
    `dataAssinatura` DATETIME(3) NULL,
    `novaVigencia` DATETIME(3) NULL,
    `valorAcrescimo` DECIMAL(15, 2) NULL,
    `valorSupressao` DECIMAL(15, 2) NULL,
    `motivo` VARCHAR(191) NULL,
    `justificativa` VARCHAR(191) NULL,
    `observacoes` VARCHAR(191) NULL,
    `convenioId` VARCHAR(191) NULL,
    `contratoId` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `Aditivo_convenioId_idx`(`convenioId`),
    INDEX `Aditivo_contratoId_idx`(`contratoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pendencia` (
    `id` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `responsavel` VARCHAR(191) NULL,
    `prazo` DATETIME(3) NULL,
    `status` ENUM('ABERTA', 'EM_ANDAMENTO', 'RESOLVIDA', 'CANCELADA') NOT NULL,
    `prioridade` INTEGER NULL,
    `resolucao` VARCHAR(191) NULL,
    `dataResolucao` DATETIME(3) NULL,
    `orgaoResponsavel` VARCHAR(191) NULL,
    `convenioId` VARCHAR(191) NOT NULL,
    `criadoPorId` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `Pendencia_convenioId_idx`(`convenioId`),
    INDEX `Pendencia_criadoPorId_idx`(`criadoPorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comunicado` (
    `id` VARCHAR(191) NOT NULL,
    `protocolo` VARCHAR(191) NOT NULL,
    `assunto` VARCHAR(191) NOT NULL,
    `conteudo` VARCHAR(191) NULL,
    `tipo` ENUM('ENTRADA', 'SAIDA') NOT NULL,
    `status` VARCHAR(191) NULL,
    `dataRegistro` DATETIME(3) NOT NULL,
    `origem` VARCHAR(191) NULL,
    `destino` VARCHAR(191) NULL,
    `responsavel` VARCHAR(191) NULL,
    `arquivoUrl` VARCHAR(191) NULL,
    `convenioId` VARCHAR(191) NULL,
    `criadoPorId` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `Comunicado_convenioId_idx`(`convenioId`),
    INDEX `Comunicado_criadoPorId_idx`(`criadoPorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventoAgenda` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `tipo` ENUM('REUNIAO', 'PRESTACAO_CONTAS', 'ENTREGA_DOCUMENTOS', 'VENCIMENTO_ETAPA', 'OUTROS') NOT NULL,
    `dataInicio` DATETIME(3) NOT NULL,
    `dataFim` DATETIME(3) NULL,
    `local` VARCHAR(191) NULL,
    `responsavel` VARCHAR(191) NULL,
    `convenioId` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `EventoAgenda_convenioId_idx`(`convenioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Convenio` ADD CONSTRAINT `Convenio_secretariaId_fkey` FOREIGN KEY (`secretariaId`) REFERENCES `Secretaria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Convenio` ADD CONSTRAINT `Convenio_orgaoId_fkey` FOREIGN KEY (`orgaoId`) REFERENCES `OrgaoConcedente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Convenio` ADD CONSTRAINT `Convenio_programaId_fkey` FOREIGN KEY (`programaId`) REFERENCES `Programa`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Convenio` ADD CONSTRAINT `Convenio_fonteId_fkey` FOREIGN KEY (`fonteId`) REFERENCES `FonteRecurso`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConvenioAnexo` ADD CONSTRAINT `ConvenioAnexo_convenioId_fkey` FOREIGN KEY (`convenioId`) REFERENCES `Convenio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EtapaConvenio` ADD CONSTRAINT `EtapaConvenio_convenioId_fkey` FOREIGN KEY (`convenioId`) REFERENCES `Convenio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmendaParlamentar` ADD CONSTRAINT `EmendaParlamentar_convenioId_fkey` FOREIGN KEY (`convenioId`) REFERENCES `Convenio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinanceiroContas` ADD CONSTRAINT `FinanceiroContas_convenioId_fkey` FOREIGN KEY (`convenioId`) REFERENCES `Convenio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FichaOrcamentaria` ADD CONSTRAINT `FichaOrcamentaria_convenioId_fkey` FOREIGN KEY (`convenioId`) REFERENCES `Convenio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotaEmpenho` ADD CONSTRAINT `NotaEmpenho_convenioId_fkey` FOREIGN KEY (`convenioId`) REFERENCES `Convenio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContratoExecucao` ADD CONSTRAINT `ContratoExecucao_convenioId_fkey` FOREIGN KEY (`convenioId`) REFERENCES `Convenio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Medicao` ADD CONSTRAINT `Medicao_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `ContratoExecucao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Aditivo` ADD CONSTRAINT `Aditivo_convenioId_fkey` FOREIGN KEY (`convenioId`) REFERENCES `Convenio`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Aditivo` ADD CONSTRAINT `Aditivo_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `ContratoExecucao`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pendencia` ADD CONSTRAINT `Pendencia_convenioId_fkey` FOREIGN KEY (`convenioId`) REFERENCES `Convenio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pendencia` ADD CONSTRAINT `Pendencia_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comunicado` ADD CONSTRAINT `Comunicado_convenioId_fkey` FOREIGN KEY (`convenioId`) REFERENCES `Convenio`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comunicado` ADD CONSTRAINT `Comunicado_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventoAgenda` ADD CONSTRAINT `EventoAgenda_convenioId_fkey` FOREIGN KEY (`convenioId`) REFERENCES `Convenio`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

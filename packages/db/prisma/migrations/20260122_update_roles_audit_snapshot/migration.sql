-- AlterEnum: Atualizar UsuarioRole de ADMINISTRADOR->ADMIN, adicionar ESTAGIARIO e OBSERVADOR
ALTER TABLE `Usuario` MODIFY `role` ENUM('ADMIN', 'ANALISTA', 'ESTAGIARIO', 'OBSERVADOR') NOT NULL;

-- Atualizar usuários existentes com as novas roles
UPDATE `Usuario` SET `role` = 'ADMIN' WHERE `role` = 'ADMINISTRADOR';
UPDATE `Usuario` SET `role` = 'OBSERVADOR' WHERE `role` = 'VISUALIZADOR';

-- CreateEnum: AcaoAuditoria
-- Não precisa criar ENUM separadamente no MySQL, ele será criado com a tabela

-- CreateTable: AuditLog
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `usuarioNome` VARCHAR(191) NOT NULL,
    `usuarioEmail` VARCHAR(191) NOT NULL,
    `acao` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    `entidade` VARCHAR(191) NOT NULL,
    `entidadeId` VARCHAR(191) NOT NULL,
    `dadosAntigos` JSON NULL,
    `dadosNovos` JSON NULL,
    `ip` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_usuarioId_idx`(`usuarioId`),
    INDEX `AuditLog_entidade_entidadeId_idx`(`entidade`, `entidadeId`),
    INDEX `AuditLog_criadoEm_idx`(`criadoEm`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: ConvenioSnapshot
CREATE TABLE `ConvenioSnapshot` (
    `id` VARCHAR(191) NOT NULL,
    `convenioId` VARCHAR(191) NOT NULL,
    `versao` INTEGER NOT NULL,
    `dados` JSON NOT NULL,
    `criadoPorId` VARCHAR(191) NULL,
    `criadoPorNome` VARCHAR(191) NULL,
    `motivoSnapshot` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ConvenioSnapshot_convenioId_idx`(`convenioId`),
    INDEX `ConvenioSnapshot_criadoEm_idx`(`criadoEm`),
    UNIQUE INDEX `ConvenioSnapshot_convenioId_versao_key`(`convenioId`, `versao`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ConvenioSnapshot` ADD CONSTRAINT `ConvenioSnapshot_convenioId_fkey` FOREIGN KEY (`convenioId`) REFERENCES `Convenio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

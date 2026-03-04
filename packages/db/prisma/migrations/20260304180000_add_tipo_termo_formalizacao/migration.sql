-- 1) Novo catálogo de tipos de termo de formalização
CREATE TABLE `TipoTermoFormalizacaoCatalogo` (
  `id` VARCHAR(191) NOT NULL,
  `nome` VARCHAR(191) NOT NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2) Nova coluna de referência no convênio
ALTER TABLE `Convenio`
  ADD COLUMN `tipoTermoFormalizacaoId` VARCHAR(191) NULL;

-- 3) FK + índice
ALTER TABLE `Convenio`
  ADD CONSTRAINT `Convenio_tipoTermoFormalizacaoId_fkey`
  FOREIGN KEY (`tipoTermoFormalizacaoId`) REFERENCES `TipoTermoFormalizacaoCatalogo`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX `Convenio_tipoTermoFormalizacaoId_idx` ON `Convenio`(`tipoTermoFormalizacaoId`);

-- 1) Novo catálogo de modalidades de repasse
CREATE TABLE `ModalidadeRepasseCatalogo` (
  `id` VARCHAR(191) NOT NULL,
  `nome` VARCHAR(191) NOT NULL,
  `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2) Carga inicial das modalidades existentes
INSERT INTO `ModalidadeRepasseCatalogo` (`id`, `nome`)
VALUES
  ('modalidade-convenio', 'Convênio'),
  ('modalidade-contrato-repasse', 'Contrato de Repasse'),
  ('modalidade-termo-fomento', 'Termo de Fomento'),
  ('modalidade-termo-colaboracao', 'Termo de Colaboração');

-- 3) Nova coluna de referência no convênio
ALTER TABLE `Convenio`
  ADD COLUMN `modalidadeRepasseId` VARCHAR(191) NULL;

-- 4) Migração de dados do enum antigo para catálogo
UPDATE `Convenio`
SET `modalidadeRepasseId` = 'modalidade-convenio'
WHERE `modalidadeRepasse` = 'CONVENIO';

UPDATE `Convenio`
SET `modalidadeRepasseId` = 'modalidade-contrato-repasse'
WHERE `modalidadeRepasse` = 'CONTRATO_REPASSE';

UPDATE `Convenio`
SET `modalidadeRepasseId` = 'modalidade-termo-fomento'
WHERE `modalidadeRepasse` = 'TERMO_FOMENTO';

UPDATE `Convenio`
SET `modalidadeRepasseId` = 'modalidade-termo-colaboracao'
WHERE `modalidadeRepasse` = 'TERMO_COLABORACAO';

-- 5) Remoção de Fonte de Recurso e coluna enum antiga
ALTER TABLE `Convenio`
  DROP FOREIGN KEY `Convenio_fonteId_fkey`;

ALTER TABLE `Convenio`
  DROP COLUMN `fonteId`,
  DROP COLUMN `modalidadeRepasse`;

-- 6) FK + índice para modalidade em convênio
ALTER TABLE `Convenio`
  ADD CONSTRAINT `Convenio_modalidadeRepasseId_fkey`
  FOREIGN KEY (`modalidadeRepasseId`) REFERENCES `ModalidadeRepasseCatalogo`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX `Convenio_modalidadeRepasseId_idx` ON `Convenio`(`modalidadeRepasseId`);

-- 7) Tabela antiga obsoleta
DROP TABLE `FonteRecurso`;

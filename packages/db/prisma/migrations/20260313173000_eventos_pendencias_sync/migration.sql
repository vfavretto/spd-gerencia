-- Add enum-like behavior via VARCHAR columns and relations for agenda synchronization
ALTER TABLE `EventoAgenda`
  ADD COLUMN `descricaoComplementar` VARCHAR(191) NULL,
  ADD COLUMN `origem` ENUM('MANUAL', 'PENDENCIA') NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN `concluidoEm` DATETIME(3) NULL,
  ADD COLUMN `pendenciaId` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `EventoAgenda_pendenciaId_key` ON `EventoAgenda`(`pendenciaId`);
CREATE INDEX `EventoAgenda_origem_idx` ON `EventoAgenda`(`origem`);
CREATE INDEX `EventoAgenda_concluidoEm_idx` ON `EventoAgenda`(`concluidoEm`);

ALTER TABLE `EventoAgenda`
  ADD CONSTRAINT `EventoAgenda_pendenciaId_fkey`
  FOREIGN KEY (`pendenciaId`) REFERENCES `Pendencia`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

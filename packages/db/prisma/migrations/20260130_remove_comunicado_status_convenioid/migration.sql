-- AlterTable: Remove status and convenioId from Comunicado
ALTER TABLE `Comunicado` DROP FOREIGN KEY IF EXISTS `Comunicado_convenioId_fkey`;

DROP INDEX IF EXISTS `Comunicado_convenioId_idx` ON `Comunicado`;

ALTER TABLE `Comunicado` DROP COLUMN IF EXISTS `status`;
ALTER TABLE `Comunicado` DROP COLUMN IF EXISTS `convenioId`;

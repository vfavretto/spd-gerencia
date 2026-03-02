-- AlterTable
ALTER TABLE `ContratoExecucao` ADD COLUMN `valorCPExclusiva` DECIMAL(15, 2) NULL;

-- AlterTable
ALTER TABLE `FinanceiroContas` DROP COLUMN `valorCPExclusiva`;

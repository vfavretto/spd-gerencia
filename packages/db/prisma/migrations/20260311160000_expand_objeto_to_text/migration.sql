-- AlterTable: expand "objeto" column from VARCHAR(191) to TEXT
ALTER TABLE `Convenio` MODIFY `objeto` TEXT NOT NULL;

-- AlterTable: Adicionar campo matricula ao Usuario
ALTER TABLE `Usuario` ADD COLUMN `matricula` VARCHAR(191) NOT NULL DEFAULT '';

-- Atualizar registros existentes com matricula baseada no id (temporário)
UPDATE `Usuario` SET `matricula` = CONCAT('MAT-', LEFT(id, 8)) WHERE `matricula` = '';

-- CreateIndex
CREATE UNIQUE INDEX `Usuario_matricula_key` ON `Usuario`(`matricula`);

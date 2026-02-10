
SET @constraint_name = (
    SELECT CONSTRAINT_NAME 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Comunicado' 
    AND COLUMN_NAME = 'convenioId' 
    AND CONSTRAINT_NAME != 'PRIMARY'
    LIMIT 1
);
SET @sql = IF(@constraint_name IS NOT NULL, 
    CONCAT('ALTER TABLE `Comunicado` DROP FOREIGN KEY `', @constraint_name, '`'), 
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Dropar index (se existir)
SET @index_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Comunicado' 
    AND INDEX_NAME = 'Comunicado_convenioId_idx'
);
SET @sql = IF(@index_exists > 0, 
    'DROP INDEX `Comunicado_convenioId_idx` ON `Comunicado`', 
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Dropar colunas (se existirem)
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Comunicado' 
    AND COLUMN_NAME = 'status'
);
SET @sql = IF(@column_exists > 0, 
    'ALTER TABLE `Comunicado` DROP COLUMN `status`', 
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Comunicado' 
    AND COLUMN_NAME = 'convenioId'
);
SET @sql = IF(@column_exists > 0, 
    'ALTER TABLE `Comunicado` DROP COLUMN `convenioId`', 
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Crear el catálogo de ciudades.
CREATE TABLE `Ciudad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Conservar las ciudades si la tarea 1 ya se aplicó y se introdujeron datos.
INSERT INTO `Ciudad` (`nombre`)
SELECT DISTINCT `ciudad` FROM `Experiencia`;

-- Permitir NULL solo durante la conversión de los registros existentes.
ALTER TABLE `Experiencia` ADD COLUMN `ciudadId` INTEGER NULL;

UPDATE `Experiencia` AS e
INNER JOIN `Ciudad` AS c ON c.`nombre` = e.`ciudad`
SET e.`ciudadId` = c.`id`;

ALTER TABLE `Experiencia` MODIFY COLUMN `ciudadId` INTEGER NOT NULL;

CREATE INDEX `Experiencia_ciudadId_idx` ON `Experiencia` (`ciudadId`);

ALTER TABLE `Experiencia` ADD CONSTRAINT `Experiencia_ciudadId_fkey`
FOREIGN KEY (`ciudadId`) REFERENCES `Ciudad` (`id`)
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Los nombres quedan conservados en Ciudad; se elimina el texto duplicado.
ALTER TABLE `Experiencia` DROP COLUMN `ciudad`;

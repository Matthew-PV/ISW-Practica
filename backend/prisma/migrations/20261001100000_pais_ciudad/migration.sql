-- No se asigna un país arbitrario a las ciudades que ya existen.
ALTER TABLE `Ciudad`
ADD COLUMN `pais` VARCHAR(191) NULL,
ADD COLUMN `codigoPais` CHAR(2) NULL;

CREATE UNIQUE INDEX `Ciudad_codigoPais_nombre_key` ON `Ciudad` (`codigoPais`, `nombre`);

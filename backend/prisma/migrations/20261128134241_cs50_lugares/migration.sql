-- CreateTable
CREATE TABLE `LugarExperiencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `experienciaId` INTEGER NOT NULL,
    `proveedorId` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `direccion` VARCHAR(512) NOT NULL,
    `lat` DOUBLE NOT NULL,
    `lon` DOUBLE NOT NULL,
    `imagen` VARCHAR(2048) NULL,
    `web` VARCHAR(2048) NULL,
    `nota` VARCHAR(300) NULL,
    `orden` INTEGER NOT NULL,

    UNIQUE INDEX `LugarExperiencia_experienciaId_proveedorId_key`(`experienciaId`, `proveedorId`),
    UNIQUE INDEX `LugarExperiencia_experienciaId_orden_key`(`experienciaId`, `orden`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LugarExperiencia` ADD CONSTRAINT `LugarExperiencia_experienciaId_fkey` FOREIGN KEY (`experienciaId`) REFERENCES `Experiencia`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

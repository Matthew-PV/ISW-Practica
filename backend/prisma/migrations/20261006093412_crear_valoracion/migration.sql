-- CreateTable
CREATE TABLE `Valoracion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `experienciaId` INTEGER NOT NULL,
    `puntuacion` INTEGER NOT NULL,
    `comentario` TEXT NULL,
    `creadaEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadaEn` DATETIME(3) NOT NULL,

    INDEX `Valoracion_experienciaId_idx`(`experienciaId`),
    UNIQUE INDEX `Valoracion_usuarioId_experienciaId_key`(`usuarioId`, `experienciaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Valoracion` ADD CONSTRAINT `Valoracion_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Valoracion` ADD CONSTRAINT `Valoracion_experienciaId_fkey` FOREIGN KEY (`experienciaId`) REFERENCES `Experiencia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

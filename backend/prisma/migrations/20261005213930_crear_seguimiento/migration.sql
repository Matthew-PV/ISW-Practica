-- CreateTable
CREATE TABLE `Seguimiento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `seguidorId` INTEGER NOT NULL,
    `seguidoId` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Seguimiento_seguidoId_idx`(`seguidoId`),
    UNIQUE INDEX `Seguimiento_seguidorId_seguidoId_key`(`seguidorId`, `seguidoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Seguimiento` ADD CONSTRAINT `Seguimiento_seguidorId_fkey` FOREIGN KEY (`seguidorId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Seguimiento` ADD CONSTRAINT `Seguimiento_seguidoId_fkey` FOREIGN KEY (`seguidoId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

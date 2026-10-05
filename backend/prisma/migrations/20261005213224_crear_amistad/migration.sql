-- CreateTable
CREATE TABLE `Amistad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `solicitanteId` INTEGER NOT NULL,
    `destinatarioId` INTEGER NOT NULL,
    `estado` ENUM('PENDIENTE', 'ACEPTADA') NOT NULL DEFAULT 'PENDIENTE',
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Amistad_destinatarioId_idx`(`destinatarioId`),
    UNIQUE INDEX `Amistad_solicitanteId_destinatarioId_key`(`solicitanteId`, `destinatarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Amistad` ADD CONSTRAINT `Amistad_solicitanteId_fkey` FOREIGN KEY (`solicitanteId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Amistad` ADD CONSTRAINT `Amistad_destinatarioId_fkey` FOREIGN KEY (`destinatarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

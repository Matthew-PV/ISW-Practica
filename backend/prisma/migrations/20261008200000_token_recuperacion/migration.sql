-- CS-64: enlaces de un solo uso para restablecer la contraseña (solo se guarda su hash).
-- CreateTable
CREATE TABLE `TokenRecuperacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `tokenHash` CHAR(64) NOT NULL,
    `caducaEn` DATETIME(3) NOT NULL,
    `usadoEn` DATETIME(3) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TokenRecuperacion_tokenHash_key`(`tokenHash`),
    INDEX `TokenRecuperacion_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TokenRecuperacion` ADD CONSTRAINT `TokenRecuperacion_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;


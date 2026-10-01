-- CreateTable
CREATE TABLE `Experiencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `ciudad` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NULL,
    `momentoAdecuado` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

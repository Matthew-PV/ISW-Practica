-- Conservar registros anteriores sin asignarles un autor inventado.
ALTER TABLE `Experiencia` ADD COLUMN `autorId` INTEGER NULL;

CREATE INDEX `Experiencia_autorId_idx` ON `Experiencia` (`autorId`);

ALTER TABLE `Experiencia` ADD CONSTRAINT `Experiencia_autorId_fkey`
FOREIGN KEY (`autorId`) REFERENCES `Usuario` (`id`)
ON DELETE RESTRICT ON UPDATE CASCADE;

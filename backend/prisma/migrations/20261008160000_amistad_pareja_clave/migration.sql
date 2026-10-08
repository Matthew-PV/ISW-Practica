-- CS-61: una sola relación de amistad por pareja de usuarios, sea quien sea quien la envió.
-- parejaClave guarda la pareja sin orden ("<menorId>-<mayorId>") y es única, así que MySQL
-- rechaza una segunda solicitud entre los mismos usuarios aunque lleguen dos a la vez.

-- 1. Columna nueva, de momento opcional para poder rellenar las filas que ya existen.
ALTER TABLE `Amistad` ADD COLUMN `parejaClave` VARCHAR(21) NULL;

-- 2. Si alguna base de datos tiene ya dos relaciones cruzadas entre la misma pareja
--    (A→B y B→A), se conserva una: la aceptada o, si están en el mismo estado, la más antigua.
DELETE a FROM `Amistad` a
JOIN `Amistad` b
  ON a.`solicitanteId` = b.`destinatarioId` AND a.`destinatarioId` = b.`solicitanteId`
WHERE (a.`estado` = 'PENDIENTE' AND b.`estado` = 'ACEPTADA')
   OR (a.`estado` = b.`estado` AND a.`id` > b.`id`);

-- 3. Se calcula la clave de cada relación.
UPDATE `Amistad`
SET `parejaClave` = CONCAT(LEAST(`solicitanteId`, `destinatarioId`), '-', GREATEST(`solicitanteId`, `destinatarioId`));

-- 4. Pasa a ser obligatoria y única.
ALTER TABLE `Amistad` MODIFY `parejaClave` VARCHAR(21) NOT NULL;
CREATE UNIQUE INDEX `Amistad_parejaClave_key` ON `Amistad`(`parejaClave`);

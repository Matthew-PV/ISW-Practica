# Prompts de Jorge Delgado Castellanos

Identificador habitual: JOR / jorjonudo.

## 2026-10-06 — CS-48: valoraciones de amigos y seguidores en una experiencia

- **Historia u objetivo:** CS-48, objetivos 1 a 10. Criterio principal: en el detalle de una experiencia visible para el usuario, mostrar en una sección propia las valoraciones de sus amigos o seguidores, excluir las de personas no relacionadas, respetar la visibilidad, paginar y reflejar nuevas valoraciones al recargar.
- **Agente/herramienta:** ChatGPT (GPT-5.6 Sol), con apoyo de GitHub Desktop para Git, Visual Studio Code para editar y PowerShell para comandos y pruebas.
- **Entorno:** Windows, Visual Studio Code, PowerShell, GitHub Desktop y Docker Desktop. Para la comprobación manual se utilizó Chrome y su vista adaptable de dispositivos.
- **Contexto aportado:** copia actual de la hoja CS-48 del Excel compartido, repositorio `ISW-Practica` actualizado en `main`, código existente de valoraciones, amistades, seguimientos y visibilidad, y resultados de las pruebas del proyecto.
- **Prompt inicial (extracto):**

  > Me ocupo de CS-48, pero empezamos con el objetivo 1, olvídate de lo anterior.

- **Correcciones relevantes:**

  > A partir de ahora, los commits tenemos que poner la sección y el objetivo, y en cuanto a los dos objetivos que acabamos de hacer, tenemos que poner el tiempo que hemos tardado.

  > ¿Hace falta cambiar los puertos? ¿No voy a joder a los demás?

  Estas correcciones hicieron que los commits posteriores incluyeran `CS-48 - Objetivo X` y que la configuración local de MySQL se resolviera sin modificar `docker-compose.yml` ni afectar al equipo.

- **Resultado propuesto por la IA:** se completó la funcionalidad de CS-48 en backend, API, frontend y pruebas:
  1. Se añadió en `valoracionRepository` una consulta paginada por experiencia y conjunto de usuarios, con datos públicos del autor, total de resultados y orden estable por `actualizadaEn` e `id`.
  2. `amistadRepository` obtiene los identificadores de amistades aceptadas en cualquiera de los dos sentidos y `seguimientoRepository` obtiene los identificadores de quienes siguen al solicitante.
  3. `valoracionService` valida sesión, experiencia y paginación, comprueba `puedeVerExperiencia`, combina amigos y seguidores sin duplicados y consulta únicamente sus valoraciones.
  4. Se añadió `GET /api/experiencias/:id/valoracion?pagina=&limite=`, protegido por sesión, que devuelve `valoraciones`, `total`, `pagina` y `limite`.
  5. La bienvenida incorpora un detalle de experiencia con una sección independiente «Valoraciones de amigos y seguidores», estado vacío, errores y paginación Anterior/Siguiente.
  6. Se añadieron pruebas de repositorio, servicio, API, pantalla con jsdom y una prueba de aceptación completa que cubre amigo, seguidor, tercero no relacionado, ausencia de resultados, permisos, sesión y aparición de una valoración nueva en una consulta posterior.
  7. La comprobación manual final se realizó en escritorio y en vista móvil de 375 px. Durante esta revisión se detectó un cliente Prisma local desactualizado; `npx prisma generate` corrigió el 500 sin requerir cambios de código.
- **TDD:** no se siguió TDD estricto en todos los objetivos. En varios casos el código se añadió antes que su prueba, por lo que no se conserva evidencia del fallo rojo inicial exigido por los objetivos que indicaban «crear primero las pruebas». Los objetivos 7, 8 y 9 fueron principalmente pruebas de caracterización o aceptación de comportamiento ya implementado. El objetivo 10 fue validación automática y manual. Esta desviación se registra expresamente en lugar de reconstruir un ciclo rojo que no ocurrió.
- **Comprensión humana de las pruebas:** Jorge revisó con el agente qué preparaba cada prueba (usuarios, amistades, seguimientos, experiencias y valoraciones simuladas), qué acción ejecutaba (repositorio, servicio, petición HTTP o interacción con el detalle) y qué resultado se esperaba: incluir solo amigos/seguidores, eliminar duplicados, respetar 403 de visibilidad, devolver vacío sin error, paginar de forma estable y mostrar una valoración nueva al volver a consultar.
- **Intervención humana:** Jorge ejecutó personalmente los cambios propuestos, las pruebas específicas y la batería completa; revisó los archivos en GitHub Desktop antes de cada commit; resolvió con ayuda del agente dos conflictos de merge conservando tanto su trabajo como el remoto; pidió no modificar la configuración compartida de Docker al detectar un conflicto local de puertos; y realizó la comprobación visual final en escritorio y móvil.
- **Comprobación final:** las pruebas específicas de CS-48 y la batería completa de Jest quedaron en verde. En navegador, el detalle mostró correctamente el estado vacío en escritorio y móvil; la sección se adaptó a 375 px sin desbordamiento. El fallo 500 encontrado durante la primera prueba manual se debía al cliente Prisma local sin regenerar y desapareció tras ejecutar `npx prisma generate`.
- **Resultado en Git:** commits principales de CS-48: `8822291` (consulta paginada de valoraciones), `1d3f216` (amigos y seguidores), `e4db6d7` (integración en servicio), `d715051` (endpoint GET), `699f011` (detalle y sección de valoraciones), `73313fd` (paginación en pantalla), `90d93aa` (recarga), `667ef6c` (exclusión de no relacionados) y `9f4fb51` (prueba de aceptación). El objetivo 10 no necesitó un commit de código.

### Trazabilidad con la hoja oficial de CS-48

La hoja oficial terminó con diez objetivos. La numeración usada en algunos commits se decidió durante el trabajo antes de revisar la versión final de esa tabla, por lo que no coincide uno a uno con las descripciones definitivas del Excel. La trazabilidad debe hacerse por el comportamiento implementado y los commits anteriores, no solo por el número escrito en el mensaje del commit.

En particular, los objetivos 1 y 7 de la hoja piden escribir primero pruebas que fallen. El resultado funcional y las pruebas existen, pero ese orden TDD no se siguió de forma estricta y no se debe presentar como si se hubiera observado un rojo inicial.

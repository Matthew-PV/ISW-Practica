# CS-37 — Compartir una experiencia mediante un enlace

## Objetivo

Permitir copiar el enlace de una experiencia y compartirlo con
otras personas, respetando los permisos de acceso existentes.

## Diseño

- El botón «Copiar enlace» aparecerá en el detalle del plan.
- Se utilizará la URL absoluta de la experiencia.
- La copia se realizará mediante la API Clipboard del navegador.
- Se mostrará una confirmación o un mensaje de error.
- No será necesario modificar Prisma ni crear endpoints nuevos.
- Los permisos seguirán comprobándose en el backend.

## Casos de prueba

### Prueba 1 — Botón disponible

Dado que un usuario puede consultar una experiencia,
cuando abre su detalle,
entonces encuentra el botón «Copiar enlace».

### Prueba 2 — Copia correcta

Dado que el usuario está consultando una experiencia,
cuando pulsa «Copiar enlace»,
entonces se copia su dirección completa al portapapeles
y se muestra una confirmación.

### Prueba 3 — Fallo al copiar

Dado que el navegador no permite acceder al portapapeles,
cuando el usuario pulsa «Copiar enlace»,
entonces se muestra un mensaje de error
y no se indica que la copia se haya realizado.

### Prueba 4 — Experiencia pública

Dado que un usuario recibe el enlace de una experiencia pública,
cuando abre el enlace con una sesión válida,
entonces puede consultar la experiencia.

### Prueba 5 — Experiencia privada

Dado que un usuario recibe el enlace de una experiencia privada ajena,
cuando intenta abrirla,
entonces no puede consultar sus datos.

### Prueba 6 — Experiencia para amigos

Dado que una experiencia está limitada a amigos,
cuando una persona sin esa relación abre el enlace,
entonces el acceso se rechaza.

### Prueba 7 — Usuario sin sesión

Dado que una persona no ha iniciado sesión,
cuando abre un enlace compartido,
entonces se le solicita iniciar sesión.

## Estrategia de validación

Se utilizará Jest con jsdom para probar el botón, la copia
del enlace y los mensajes de confirmación y error.

Se aprovecharán las pruebas existentes de visibilidad
y acceso para comprobar que compartir una URL no permite
eludir las restricciones del backend.

Las pruebas automatizadas nuevas se implementarán durante
el objetivo 2, comenzando por comprobar que fallan antes
de desarrollar la funcionalidad.

## Criterio de finalización

La funcionalidad estará completa cuando se pueda copiar
un enlace válido, se informe correctamente del resultado
y se mantengan las restricciones de visibilidad existentes.

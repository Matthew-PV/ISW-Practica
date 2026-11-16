
# CS-37 — Compartir una experiencia mediante un enlace

## Objetivo

Permitir copiar el enlace de una experiencia para compartirlo
con otras personas, manteniendo los permisos de acceso existentes.

## Implementación

La funcionalidad se incorpora a la página de detalle de experiencia.

Archivos utilizados:

- `frontend/paginas/experiencias/experiencia.html`
- `frontend/js/experiencias/compartir-enlace.js`
- `backend/tests/frontend/cs37CompartirEnlace.test.js`

El sistema:

1. Muestra un botón «Copiar enlace» en la ficha del plan.
2. Construye una URL absoluta con el identificador de la experiencia.
3. Utiliza la API Clipboard del navegador para copiarla.
4. Muestra una confirmación cuando la operación funciona.
5. Muestra un error si el navegador no permite copiar.

No se han añadido tablas, migraciones ni endpoints nuevos.

La visibilidad sigue controlándose desde el backend mediante
el sistema de permisos existente en PlanB.

## Criterios de aceptación

### Caso 1 — Botón disponible

Al abrir una experiencia visible, aparece el botón
«Copiar enlace».

### Caso 2 — Copia correcta

Al pulsar el botón, la URL completa se copia al
portapapeles y aparece un mensaje de confirmación.

### Caso 3 — Error del portapapeles

Si el navegador rechaza la copia, aparece un mensaje
de error sin indicar que la operación haya tenido éxito.

### Caso 4 — Experiencia pública

Un usuario autenticado puede abrir una experiencia pública
mediante su enlace.

### Caso 5 — Experiencia privada

Un usuario no puede acceder a una experiencia privada
ajena aunque conozca su URL.

### Caso 6 — Experiencia para amigos

Solo el autor y los usuarios con amistad aceptada
pueden consultar una experiencia con visibilidad AMIGOS.

### Caso 7 — Usuario sin sesión

Si una persona abre un enlace sin iniciar sesión,
la aplicación la redirige a la pantalla de acceso.

## Pruebas realizadas

### 1. Pruebas Jest de CS-37

Archivo:

`backend/tests/frontend/cs37CompartirEnlace.test.js`

Comando:

```powershell
npm.cmd test -- --runInBand tests/frontend/cs37CompartirEnlace.test.js
```

Resultado:

- 3 pruebas ejecutadas.
- 3 pruebas superadas.
- 0 pruebas fallidas.

Se comprobó el ciclo TDD:

- ROJO: las tres pruebas fallaron porque no existían
  el botón y el JavaScript de copia.
- VERDE: las tres pruebas pasaron después de implementar
  la funcionalidad.

### 2. Pruebas BDD de permisos

Se reutilizaron los escenarios existentes de Cucumber
en `documentacion/aceptacion/experiencias.feature`.

Escenarios ejecutados:

1. Consultar una experiencia pública.
2. Proteger una experiencia privada.
3. Consultar una experiencia solo para amigos.
4. Impedir el acceso con una amistad pendiente.
5. Revocar acceso al cambiar la visibilidad.

Resultado:

- 5 escenarios ejecutados.
- 5 escenarios superados.
- 0 escenarios fallidos.

Las pruebas se ejecutaron utilizando MySQL local de
pruebas en el puerto 3308.

### 3. Regresión Jest

Comando:

```powershell
npm.cmd test -- --runInBand
```

Resultado:

- Regresión general superada.
- No se detectaron fallos en la batería ejecutada.

### 4. Validación manual en navegador

Se verificó que:

- El botón aparece en el detalle de una experiencia.
- Al pulsarlo, se muestra «¡Enlace copiado!».
- La URL copiada abre la experiencia correspondiente.
- Al abrir el enlace en una ventana de incógnito,
  sin sesión iniciada, se solicita iniciar sesión.

Todas estas comprobaciones fueron satisfactorias.

## Consideraciones de seguridad

Compartir una dirección no modifica la visibilidad
de una experiencia.

El backend sigue comprobando la sesión y los permisos
en `GET /api/experiencias/:id`.

Una experiencia no autorizada devuelve un error 404,
sin revelar su contenido.

La funcionalidad no crea enlaces especiales ni
concede permisos adicionales.

## Limitaciones

Los enlaces generados en `localhost` funcionan únicamente
en el ordenador donde se ejecuta PlanB.

Cuando la aplicación esté desplegada en un dominio público,
los enlaces utilizarán automáticamente ese dominio.

## Resultado final

La funcionalidad de CS-37 se ha implementado y validado.

- Objetivo 1: análisis y diseño completados.
- Objetivo 2: implementación y pruebas Jest completadas.
- Objetivo 3: permisos, regresión y validación manual completados.

Estado: FINALIZADA.

Fecha de validación: 16/11/2026.

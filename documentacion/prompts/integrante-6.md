# Prompts Jose Fernando Nevarez 

## CS-63 

### Reporte de Implementación: Historia de Usuario CS-63 (Detalles de Experiencia y Valoraciones)

Este documento resume todos los cambios, correcciones y nuevas implementaciones realizadas para completar los 9 objetivos de la historia de usuario correspondiente a la visualización de experiencias y la gestión de sus valoraciones.

#### 1. Cambios en el Backend (Repositorio de Datos)

Se solucionó un error de validación estricta del ORM Prisma que bloqueaba la consulta de valoraciones previas.

* **Archivo modificado:** `backend/src/repositories/valoracionRepository.js`
* **Corrección en `obtenerPorUsuarioYExperiencia`:** Se ajustó la sintaxis del método `findUnique` para que el nombre de la clave compuesta (`usuarioId_experienciaId`) coincidiera exactamente con el orden generado por Prisma en el archivo `schema.prisma`.

#### 2. Cambios Compartidos del Frontend (API)

Se limpió el archivo de conexión base para evitar errores de sintaxis y ejecución.

* **Archivo modificado:** `frontend/js/shared/api.js`
* **Limpieza de código:** Se eliminó un bloque de código inalcanzable (la función `obtenerExperiencia` declarada erróneamente con sintaxis de objeto) que causaba un error `unreachable code after return statement`, dejando la función genérica `api(ruta, opciones)` limpia y operativa para todo el frontend.

#### 3. Modificaciones en la Estructura HTML

Se preparó la vista para soportar la lógica condicional y los diálogos modales.

* **Archivo modificado:** `frontend/experiencia.html`
* **Ocultación preventiva:** Se añadió el `id="caja-formulario-valoracion"` y la clase `d-none` al contenedor del formulario de valoración para ocultarlo por defecto y evitar parpadeos visuales al cargar la página.
* **Inyección de Modal (Objetivo 8):** Se construyó e insertó la estructura HTML nativa de un Modal de Bootstrap al final del `<body>` para gestionar el sistema de reportes con opciones (Spam, Ofensivo, Inapropiado).
* **Carga de Bootstrap:** Se reubicó la carga del script `bootstrap.bundle.min.js` a la etiqueta `<head>` para priorizar su descarga.

#### 4. Implementación Lógica Frontend (`experiencia.js`)

El archivo principal de la vista sufrió una reestructuración completa para cumplir los objetivos de negocio y seguridad.

### Gestión de Usuario y Vista Principal (Objetivos 1, 2, 3)

* **Función `cargarPaginaExperiencia()`:**
* Implementa `Promise.all()` para descargar simultáneamente los datos de la experiencia y el perfil del usuario actual (`/auth/yo`).
* Introduce lógica condicional de negocio: compara el `autorId` de la experiencia con el ID del usuario actual. Si coinciden, mantiene oculto el formulario de valoración (el autor no puede valorar su propio post).



### Comentarios y Paginación (Objetivo 4)

* **Función `cargarComentarios()`:**
* Construye la ruta al backend aplicando parámetros de paginación (`?pagina=1&limite=10`).
* Evalúa el total de comentarios devuelto por el servidor frente a los renderizados en el DOM para mostrar u ocultar dinámicamente el botón "Cargar más".


* **Función `crearElementoComentario(valoracion)`:**
* Genera las tarjetas de los comentarios utilizando métodos nativos del DOM (`document.createElement` y `textContent`). Esto previene ataques de inyección XSS (Objetivo 1 / Criterio de validación).
* Enlaza dinámicamente el nombre del autor hacia su perfil público (`perfil.html?id=...`).



### Formulario de Valoración (Objetivos 5 y 6)

* **Evento `input` (Contador de caracteres):** Evalúa la longitud del comentario en tiempo real. Al superar los 235 caracteres (de 255), cambia visualmente las clases CSS (texto rojo y negrita) para alertar al usuario.
* **Función `cargarMiValoracion()`:** Realiza un GET a `/mia`. Si existe una valoración previa, rellena los inputs automáticamente y cambia el texto del botón de "Guardar" a "Actualizar valoración".
* **Evento `submit` (`formValoracion`):**
* Bloquea el botón para prevenir envíos duplicados.
* Realiza una petición `PUT` al backend (que maneja tanto la creación como la actualización de forma segura).
* Limpia la lista de comentarios en el DOM, resetea la paginación a 1 y vuelve a cargar todos los comentarios para reflejar el cambio al instante.



### Sistema de Interacciones: "Útil" y "Reportar" (Objetivos 7 y 8)

*(Nota: Lógica de red simulada a la espera de la API de interacciones CS-04)*

* **Botón "Útil":** Creado en `crearElementoComentario()`. Se desactiva automáticamente (`disabled = true`) si el comentario pertenece al usuario logueado. Su evento `click` simula visualmente la actualización del contador y el cambio de color del botón.
* **Sistema de Reporte (Modal Vanilla JS):**
* Se ignoró la API de JavaScript de Bootstrap para evitar problemas de dependencias o bloqueadores de anuncios locales.
* Se abordan las acciones del modal (apertura) manipulando directamente `modal.style.display` y las clases `.show` para garantizar el despliegue.
* **Función `cerrarModalManual()`:** Gestiona el cierre suave (desvanecimiento CSS) del modal.
* **Evento `submit` (`formReporte`):** Muestra el estado de la acción ("Comentario reportado") en verde, se cierra automáticamente a los 2 segundos, y detecta si ya había sido reportado mostrando una alerta amarilla.



### Manejo de Errores Generales (Objetivo 9)

* **Bloques `try...catch` implementados globalmente:**
* Si la carga inicial falla (ID inválido o falta de permisos), borra el contenedor principal y muestra un `alert-danger`.
* Si falla la paginación de comentarios (caída de red), inyecta dinámicamente una alerta al final de la lista sin romper la interfaz.
* Si falla el botón "Útil", deshace los cambios visuales del contador y emite una alerta nativa al usuario informando del problema de conexión.

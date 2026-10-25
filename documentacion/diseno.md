# Diseño de PlanB: estructura de las pantallas

> Qué elementos tiene cada pantalla y cómo se colocan, en móvil y en escritorio. Es solo estructura: sin colores, sin imágenes y sin código. Cómo se ve cada cosa (colores, bordes, tipografía) está en [arte.md](arte.md).
> Documentos relacionados: [sitemap.mmd](sitemap.mmd), [frontend.md](frontend.md) (cómo está hecho hoy) y [flujos.md](flujos.md).

## Cómo se lee un esquema

Los esquemas son en blanco y negro y se guardan como SVG en la carpeta [`diseno/`](diseno/), junto a este documento. Se dibujan primero a mano, en papel; después se pasan a SVG (vectorial, sin medir píxel a píxel).

| Dibujo | Significa |
|---|---|
| Recuadro | Contenedor, tarjeta o campo |
| Círculo | Foto de perfil |
| Línea | Texto |
| Recuadro con X | Imagen |
| Recuadro con el texto dentro | Botón |

Cada esquema se dibuja en **móvil (375 px)** y en **escritorio (1280 px)**. Un esquema de tablet (768 px) es opcional.

## Reglas que condicionan el diseño

- **No se usa el JavaScript de Bootstrap** (lo bloquea la política de seguridad). Los desplegables se hacen con `<details>` y las ventanas con `<dialog>`.
- Todo lo que se pueda pulsar corresponde a una flecha del sitemap.
- Cada pantalla con datos tiene los estados de [frontend.md](frontend.md): cargando, vacío, error y «Contenido no disponible».

## Elementos comunes

| Elemento | Dónde aparece | Estado |
|---|---|---|
| Barra superior (PlanB, Inicio, Buscar personas, Mi perfil) | Las 5 pantallas con sesión | Por dibujar |
| Avisos (error, éxito, información) | Todas | Por dibujar |
| Lista con «Cargar más» | Bienvenida, perfil, usuario, experiencia | Por dibujar |
| Diálogo | Bienvenida (crear y editar), experiencia (reportar) | Por dibujar |

## Pantallas

Una sección por pantalla, con el mismo formato.

### index.html: iniciar sesión
- **Responsable del esquema:** _por asignar_
- **Esquema móvil:** _pendiente_
- **Esquema escritorio:** _pendiente_
- **Estados:** normal, error
- **Enlaces (sitemap):** registro, recuperar, bienvenida
- **Decisiones:** _ninguna todavía_

### registro.html · recuperar.html · restablecer.html
_Mismo formato._

### bienvenida.html: mis experiencias
_Mismo formato._ Responsable: Matthew (según el reparto del equipo).

### perfil.html: mi perfil
- **Responsable del esquema:** Flavia
- **Esquema (móvil y escritorio):** [diseno/perfil.svg](diseno/perfil.svg)
- **Idea:** bloques con título. Las solicitudes recibidas van arriba y destacadas; «Cambiar contraseña» queda plegado con `<details>`.
- **Estados:** datos, foto subiéndose, listas vacías o con «Cargar más».
- **Enlaces (sitemap):** perfil de otra persona (amigos, seguidores y solicitudes) y detalle de una experiencia.

### personas.html: buscar personas
- **Responsable del esquema:** Flavia
- **Esquema (móvil y escritorio):** [diseno/personas.svg](diseno/personas.svg)
- **Estados:** antes de buscar, con resultados (como mucho 20), sin resultados.
- **Enlaces (sitemap):** perfil de otra persona.

### usuario.html: perfil de otra persona
- **Responsable del esquema:** Flavia
- **Esquemas (móvil y escritorio), dos variantes para elegir:**
  - [diseno/usuario-a.svg](diseno/usuario-a.svg): cabecera centrada, como una red social.
  - [diseno/usuario-b.svg](diseno/usuario-b.svg): la persona en una tarjeta lateral fija en escritorio.
- **Estados:** perfil, «Usuario no encontrado», cuatro versiones del botón de amistad (ninguna, enviada, recibida, amigos), «Seguir» o «Dejar de seguir», y «No hay experiencias que puedas ver».
- **Enlaces (sitemap):** detalle de una experiencia; si es el propio usuario, `perfil.html`.
- **Decisión pendiente:** variante A o B (el equipo la elige en la revisión conjunta).

### experiencia.html: una experiencia
_Mismo formato._

## Decisiones pendientes

| Pregunta | Quién decide | Estado |
|---|---|---|
| ¿Hay una landing page antes del inicio de sesión? Hoy `index.html` es el login | Equipo | Abierta |
| ¿Barra inferior en móvil o menú superior? | Equipo | Abierta |
| ¿`diseno.md` y `arte.md` separados o un solo archivo? | Equipo | Abierta |

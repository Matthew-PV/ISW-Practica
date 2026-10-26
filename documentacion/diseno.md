# Diseño de PlanB: estructura de las pantallas

> Qué elementos tiene cada pantalla y cómo se colocan, en móvil y en escritorio. Es solo estructura: sin colores, sin imágenes y sin código. Cómo se ve cada cosa (colores, bordes, tipografía) está en [arte.md](arte.md).
> Documentos relacionados: [sitemap.mmd](sitemap.mmd), [frontend.md](frontend.md) (cómo está hecho hoy) y [flujos.md](flujos.md).
> Inventario de las nueve pantallas con sus estados y flujos: [inventario-pantallas.md](inventario-pantallas.md).
> Estado: el equipo ha dado por buenos los esquemas (indicado por Flavia el 26/10/2026). La guía de estilo, en [arte.md](arte.md), es una propuesta para aprobar.

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
- **Navegación en móvil:** barra fija abajo con Inicio, Buscar y Perfil; desde 768 px, barra superior. Ver [diseno/navegacion-movil.svg](diseno/navegacion-movil.svg).
- Todo lo que se pueda pulsar corresponde a una flecha del sitemap.
- Cada pantalla con datos tiene los estados de [frontend.md](frontend.md): cargando, vacío, error y «Contenido no disponible».

## Elementos comunes

| Elemento | Dónde aparece | Estado |
|---|---|---|
| Navegación (Inicio, Buscar personas, Mi perfil) | Las 5 pantallas con sesión | **Aprobada (Flavia, 26/10/2026):** barra inferior en móvil y superior desde 768 px. Medidas y reglas en [diseno/navegacion-movil.svg](diseno/navegacion-movil.svg). Los esquemas de las pantallas con sesión ya la llevan |
| Avisos (error, éxito, información) | Todas | Dibujados como recuadro de línea discontinua en cada esquema |
| Lista con «Cargar más» | Bienvenida, perfil, usuario, experiencia | Dibujada en cada esquema |
| Diálogo | Bienvenida (crear y editar), experiencia (reportar) | Crear y editar: en [diseno/bienvenida.svg](diseno/bienvenida.svg). El de reportar, por dibujar |

## Pantallas

Una sección por pantalla, con el mismo formato.

### index.html: iniciar sesión
- **Responsable del esquema:** Flavia (propuesta)
- **Esquema (móvil y escritorio):** [diseno/index.svg](diseno/index.svg)
- **Idea:** formulario centrado en una tarjeta, con la barra reducida al nombre PlanB porque aún no hay sesión. Sobre el título lleva una frase de presentación (texto de ejemplo: «Comparte y descubre planes por tu ciudad»), de modo que quien llega sepa qué es PlanB sin una página aparte. «Crear cuenta» es un **botón secundario visible**, no un enlace de texto, porque para quien llega a registrarse es la segunda acción más importante de la pantalla.
- **Estados:** normal, error con el mensaje del servidor.
- **Enlaces (sitemap):** registro, recuperar contraseña, bienvenida.
- **Decisión:** no hay landing page; la frase de presentación hace su papel. Aprobada (Flavia, 26/10/2026); el texto exacto de la frase lo valida el equipo.

### registro.html: crear una cuenta
- **Responsable del esquema:** Flavia (propuesta)
- **Esquema (móvil y escritorio):** [diseno/registro.svg](diseno/registro.svg)
- **Idea:** tres campos, la lista de requisitos de la contraseña que se marca al escribir y el CAPTCHA antes del botón.
- **Estados:** error de validación o de duplicado, CAPTCHA no disponible y «Creando cuenta…» mientras se envía.
- **Enlaces (sitemap):** iniciar sesión, bienvenida (cuenta creada).

### recuperar.html: pedir el enlace
- **Responsable del esquema:** Flavia (propuesta)
- **Esquema (móvil y escritorio):** [diseno/recuperar.svg](diseno/recuperar.svg)
- **Estados:** formulario y mensaje de éxito, que es siempre el mismo exista o no la cuenta.
- **Enlaces (sitemap):** iniciar sesión.

### restablecer.html: elegir una contraseña nueva
- **Responsable del esquema:** Flavia (propuesta)
- **Esquema (móvil y escritorio):** [diseno/restablecer.svg](diseno/restablecer.svg)
- **Estados:** formulario, contraseñas que no coinciden, enlace no válido (solo un aviso) y éxito con enlace a iniciar sesión.
- **Enlaces (sitemap):** iniciar sesión.

### bienvenida.html: mis experiencias
- **Responsable del esquema:** Matthew, según el reparto del equipo. Hay una **propuesta de Flavia** que él puede sustituir.
- **Esquema (móvil, escritorio y diálogo):** [diseno/bienvenida.svg](diseno/bienvenida.svg)
- **Idea:** rejilla de tarjetas, con la primera («+») para crear una experiencia. Dos columnas en móvil y cuatro en escritorio. El diálogo sirve para crear y para editar.
- **Estados:** lista con «Cargar más», error de lista y diálogo con aviso.
- **Enlaces (sitemap):** detalle de una experiencia.

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
- **Esquema aprobado (móvil y escritorio):** [diseno/usuario.svg](diseno/usuario.svg). Combina las dos variantes: en móvil, cabecera centrada y experiencias apiladas (A); en escritorio, la persona en una tarjeta lateral fija y las experiencias a la derecha (B).
- **Variantes originales, como alternativa:** [diseno/usuario-a.svg](diseno/usuario-a.svg) (cabecera centrada también en escritorio) y [diseno/usuario-b.svg](diseno/usuario-b.svg) (tarjeta lateral también en móvil).
- **Estados:** perfil, «Usuario no encontrado», cuatro versiones del botón de amistad (ninguna, enviada, recibida, amigos), «Seguir» o «Dejar de seguir», y «No hay experiencias que puedas ver».
- **Enlaces (sitemap):** detalle de una experiencia; si es el propio usuario, `perfil.html`.
- **Decisión:** aprobada la combinación de `usuario.svg` (Flavia, 26/10/2026).

### experiencia.html: una experiencia
- **Responsable del esquema:** Flavia (propuesta)
- **Esquema (móvil y escritorio):** [diseno/experiencia.svg](diseno/experiencia.svg)
- **Idea:** en móvil, todo apilado; en escritorio, dos columnas: la experiencia y el formulario a la izquierda, y las dos listas de valoraciones a la derecha.
- **Estados:** cargando, sin id, 401 (al login), «Contenido no disponible» (404), error y mostrando. El autor de la experiencia no ve el formulario de valorar.
- **Nota:** «Útil» y «Reportar» solo funcionan en la pantalla hasta que se implementen CS-02 y CS-04.
- **Enlaces (sitemap):** perfil o usuario del autor (y de cada valoración).

## Requisitos mínimos de un buen diseño de frontend

Lista con la que se revisa cada esquema y, después, cada pantalla. Parte de las pautas de accesibilidad WCAG 2.2 de nivel AA y de buenas prácticas habituales. La última columna es el **estado del código el 26/10/2026**, para saber qué corregir al aplicar el diseño.

| # | Requisito | Cómo se comprueba | Cómo lo cumple el diseño | Estado del código hoy |
|---|---|---|---|---|
| 1 | **Adaptable** | Se usa bien en 375, 768 y 1280 px, sin desplazamiento horizontal | Cada esquema se dibuja en móvil y escritorio; en móvil todo va apilado | Las 9 páginas llevan `viewport`. El CSS propio no tiene `@media`: depende de la cuadrícula de Bootstrap. Solo `usuario.html` se ha comprobado en los tres tamaños |
| 2 | **Navegación clara** | Se llega a los tres destinos principales en un toque, y se sabe dónde se está | Barra inferior en móvil; la sección activa se marca con línea gruesa y negrita | Barra superior con tres enlaces. **Sin `aria-current`** ni `aria-label` en ningún `nav` |
| 3 | **Zonas pulsables suficientes** | Al menos 24 × 24 px (mínimo AA) y, mejor, 44 × 44 px | La barra inferior mide 56 px; los botones de formulario ocupan el ancho en móvil | Calculado con los valores por defecto de Bootstrap: `btn` unos 38 px de alto y `btn-sm` unos 31 px. Cumplen el mínimo AA, **no los 44 px recomendados** (no medido en pantalla) |
| 4 | **Contraste suficiente** | Texto 4,5:1; texto grande y componentes de interfaz 3:1 | Los esquemas son en blanco y negro; `arte.md` debe fijar la paleta con estos mínimos | Calculado: todos los textos y botones cumplen, algunos **justo** (4,50 y 4,53). **El borde de los campos de formulario (`#ced4da`) da 1,49:1 y no llega a 3:1** |
| 5 | **Uso con teclado y foco visible** | Todo se alcanza con Tab y el foco se ve | Elementos nativos (`button`, `a`, `details`, `dialog`) | **Sin enlace «Saltar al contenido»**; el foco depende del estilo por defecto de Bootstrap, sin revisar a mano |
| 6 | **Estructura semántica** | `lang`, un solo `h1`, `main`, `nav` con nombre y etiquetas en los campos | Cada pantalla tiene un título principal y campos con etiqueta | Las 9 páginas cumplen `lang="es"`, un `h1`, `main` e imágenes con `alt`. Falta el nombre de los `nav` |
| 7 | **No depender solo del color** | La información sigue clara en blanco y negro | Activo = línea + negrita; errores = texto, no solo color; lo desactivado se indica con texto | «Solicitud enviada» ya se distingue por el texto |
| 8 | **Estados y avisos** | Cada pantalla resuelve cargando, vacío, error y «Contenido no disponible», y los errores se anuncian a lectores de pantalla | Cada esquema dibuja sus avisos; los estados están en [frontend.md](frontend.md) | Corregido el 26/10/2026: todos los avisos de error llevan `role="alert"` (lo comprueba una prueba) y las pantallas con datos tienen estado «Cargando…» |
| 9 | **Jerarquía clara** | Un solo botón principal por pantalla | Botón principal relleno en negro; el resto, con contorno | Hoy se mezclan colores de Bootstrap (primario, éxito, peligro) sin una regla común |
| 10 | **Legible y estable** | Cuerpo de texto de 16 px, columnas de texto estrechas y sin saltos al cargar las imágenes | Formularios en una columna estrecha | Las imágenes de perfil llevan `width` y `height`; el cuerpo usa los 16 px de Bootstrap |
| 11 | **Sin JavaScript de Bootstrap** | Nada del diseño depende de sus componentes | Diálogos con `<dialog>` y plegables con `<details>`; la barra son enlaces normales | Cumple |

**Cómo se midió el contraste:** fórmula de luminancia relativa de WCAG con los colores por defecto de Bootstrap 5.3. No se ha medido sobre capturas de pantalla.

**Qué hay que corregir al aplicar el diseño** (entra en la historia de implementación, no en esta): nombre y `aria-current` en la barra, enlace «Saltar al contenido», borde de campos con contraste 3:1, y botones de 44 px en móvil. Los `role="alert"` en los avisos ya están hechos.

## Decisiones pendientes

| Pregunta | Quién decide | Estado |
|---|---|---|
| ¿Hay una landing page antes del inicio de sesión? | Equipo | **Aprobado (Flavia, 26/10/2026):** no crear una página nueva y presentar PlanB con una frase en `index.html`. Encaja con las nueve pantallas del libro y del sitemap |
| Navegación en móvil: barra inferior fija (recomendada) o menú ≡ desplegable. Ver [diseno/navegacion-movil.svg](diseno/navegacion-movil.svg) | Equipo | **Aprobada (Flavia, 26/10/2026):** la barra inferior, ya reflejada en los esquemas que el equipo dio por buenos |
| `usuario.html`: combinación de `usuario.svg` (móvil A, escritorio B) o una de las variantes originales | Equipo | **Aprobada (Flavia, 26/10/2026):** la combinación, reflejada en los mismos esquemas |
| ¿`diseno.md` y `arte.md` separados o un solo archivo? | Equipo | Recomendado **dos archivos**: `diseno.md` (estructura) y `arte.md` (guía de estilo). Hay que cambiar la ruta de la guía en la tarjeta del objetivo 3 del libro, que dice `diseno.md`; falta confirmarlo |

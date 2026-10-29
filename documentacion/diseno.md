# Diseño de PlanB: estructura de las pantallas

> Qué elementos tiene cada pantalla y cómo se colocan, en escritorio (1280 px). Los esquemas SVG van en color (paleta Verbena) y con contenido de ejemplo, pero no son el diseño final: el código es la referencia visual. Cómo se ve cada cosa (colores, bordes, tipografía) está en [arte.md](arte.md).
> Documentos relacionados: [sitemap.mmd](sitemap.mmd), [frontend.md](frontend.md) (cómo está hecho hoy) y [flujos.md](flujos.md).
> Inventario de las páginas con sus estados y flujos: [inventario-pantallas.md](inventario-pantallas.md).
> Estado: el equipo dio por buenos los esquemas (Flavia, 26/10/2026) y el diseño se rehizo para escritorio el 26/10/2026. La guía de estilo, en [arte.md](arte.md), es una propuesta para aprobar.

## Cómo se lee un esquema

Los esquemas son en blanco y negro y se guardan como SVG en la carpeta [`diseno/`](diseno/), junto a este documento. Son conceptos, no se miden píxel a píxel.

| Dibujo | Significa |
|---|---|
| Recuadro | Contenedor, tarjeta o campo |
| Círculo (foto) | Foto de perfil |
| Línea (texto) | Texto |
| Recuadro con X (imagen) | Imagen |
| Botón | Recuadro con el texto dentro |
| Trazo discontinuo (dinámico) | Contenido que aparece o cambia: avisos, estados, paneles abiertos |

Cada esquema se dibuja en **escritorio (1280 px)**, a escala 0,5. El contenido va centrado, con un máximo de unos 960 px, salvo la landing y las pantallas divididas.

## Reglas que condicionan el diseño

- **No se usa el JavaScript de Bootstrap** (lo bloquea la política de seguridad). Los desplegables se hacen con `<details>` y las ventanas con `<dialog>`.
- Sin scripts ni manejadores en línea; el texto aportado por usuarios se inserta con `textContent`.
- Cada página `x.html` tiene su `js/x.js`; lo compartido va en `js/shared/`.
- **Cabecera común:** las pantallas con sesión comparten el mismo marcado. Ver [diseno/cabecera.svg](diseno/cabecera.svg) y la sección siguiente.
- Todo lo que se pueda pulsar corresponde a una flecha del sitemap.
- Cada pantalla con datos tiene los estados de [frontend.md](frontend.md): cargando, vacío, error y «Contenido no disponible».
- No cambian los `id` ni los `data-*` que usan los scripts y las pruebas.

## Cabecera (pantallas con sesión)

Esquema: [diseno/cabecera.svg](diseno/cabecera.svg) (con el menú de cuenta abierto; descrita aquí y en [arte.md](arte.md)).

- **Fila superior (64 px):** logo a la izquierda (enlaza a Inicio); buscador en píldora al centro («Buscar personas y planes», con botón «Buscar»; formulario GET a `/paginas/social/personas.html?q=`); a la derecha, «Crear plan» (único botón principal de la cabecera), la campana de notificaciones y el menú de cuenta.
- **Barra de pestañas de sección (debajo):** Inicio, Explorar, Mis planes y Amigos. La activa lleva línea naranja de 3 px, negrita y `aria-current="page"`.
- **Menú de cuenta** (`<details>`): Mi perfil, Guardados, Ajustes, Ayuda y Cerrar sesión (`POST /api/auth/logout` y va a `/paginas/acceso/iniciar-sesion.html`; si falla, aviso con `role="alert"`).
- **En `/paginas/social/personas.html`** el campo de la cabecera se oculta porque la página lleva el suyo.
- **Sin sesión:** páginas públicas con logo, «Iniciar sesión» (secundario) y «Crear cuenta» (principal), y **pie** con Ayuda y Términos y privacidad. Las pantallas de acceso van divididas, sin cabecera.
- Enlace «Saltar al contenido» y `nav` con `aria-label="Principal"`.
- **Estado:** Explorar, Amigos, la campana y Guardados aún no existen; sus entradas se muestran como en la maqueta.

## Interacciones

Iguales en todas las pantallas. Nada más se anima: sin carruseles, sin desplazamientos animados y sin esqueletos de carga.

- **Acción con espera** (buscar, cerrar sesión, guardar, entrar): al enviarse, el botón pasa a su gerundio («Buscando…», «Cerrando sesión…», «Guardando…», «Entrando…») y queda desactivado; al terminar recupera su texto. Si falla, aparece el aviso con `role="alert"`.
- **Buscar:** al enviar, el texto de ayuda desaparece, se vacían los resultados anteriores, aparece «Cargando…» y los resultados entran con un fundido de 150 ms. El campo conserva lo escrito.
- **Pestañas** (Buscar y Experiencia): botones con `role="tab"` y `aria-selected`, y paneles con `role="tabpanel"`. La activa lleva línea gruesa y negrita; se mueven con las flechas izquierda y derecha, y cada panel tiene su texto de ayuda.
- **Menú de cuenta:** se abre con un fundido de 150 ms y se cierra al pulsar fuera, con Escape o al elegir una opción; el foco vuelve al botón.
- **Botones y enlaces:** estados de ratón, pulsado y foco visible, con transición de 120 ms. Todo se desactiva con `prefers-reduced-motion`.

## Elementos comunes

| Elemento | Dónde aparece | Esquema |
|---|---|---|
| Cabecera con buscador y menú de cuenta | Todas las pantallas con sesión | [diseno/cabecera.svg](diseno/cabecera.svg) |
| Pantalla dividida, sin barra de cabecera (marca y tres frases a la izquierda, formulario a la derecha) | Iniciar sesión, registro, recuperar y restablecer | Cada esquema de acceso |
| Avisos (error, éxito, información) | Todas | Recuadro de línea discontinua en cada esquema |
| Pestañas | Buscar y Experiencia | [diseno/personas.svg](diseno/personas.svg), [diseno/experiencia.svg](diseno/experiencia.svg) |
| Lista con «Cargar más» | Bienvenida, perfil, usuario, experiencia | Dibujada en cada esquema |
| Diálogo | Bienvenida (crear y editar), experiencia (reportar) | Crear y editar: en [diseno/bienvenida.svg](diseno/bienvenida.svg). El de reportar, por dibujar |

## Pantallas

Una sección por pantalla, con el mismo formato. Son diez.

### index.html: landing
- **Responsable del esquema:** Flavia (propuesta)
- **Esquema:** [diseno/index.svg](diseno/index.svg)
- **Idea:** página pública y estática, sin JavaScript y sin comprobar sesión. Cabecera con la marca a la izquierda y «Iniciar sesión» (secundario) y «Crear cuenta» (ambos secundarios) a la derecha; el único botón principal de la página es el «Crear cuenta» de la portada (el del cierre también es secundario). Portada con titular, subtítulo, «Crear cuenta» y, al lado, un marco de captura con el rótulo «Captura de PlanB». Tres bloques con icono («Comparte», «Descubre», «Confía en tus amigos»), «Cómo funciona» en tres pasos, llamamiento final con los dos botones y pie. Sin cifras, testimonios ni capturas inventadas; es un concepto que se completará con capturas reales.
- **Estados:** uno solo (estática).
- **Enlaces (sitemap):** iniciar sesión, registro.

### /paginas/acceso/iniciar-sesion.html: iniciar sesión
- **Responsable del esquema:** Flavia (propuesta)
- **Esquema:** [diseno/iniciar-sesion.svg](diseno/iniciar-sesion.svg)
- **Idea:** pantalla dividida, sin barra de cabecera: a la izquierda, la marca (enlace a `index.html`) y tres frases; a la derecha, el formulario. «Crear cuenta» es un botón secundario visible y «¿Has olvidado tu contraseña?» un enlace.
- **Estados:** normal, «Entrando…» mientras se envía y error con el mensaje del servidor.
- **Enlaces (sitemap):** registro, recuperar contraseña, bienvenida (acceso correcto).

### /paginas/acceso/registro.html: crear una cuenta
- **Responsable del esquema:** Flavia (propuesta)
- **Esquema:** [diseno/registro.svg](diseno/registro.svg)
- **Idea:** misma pantalla dividida. Tres campos, la lista de requisitos de la contraseña que se marca al escribir y el CAPTCHA, que cabe en la columna, antes del botón.
- **Estados:** error de validación o de duplicado, CAPTCHA no disponible y «Creando cuenta…» mientras se envía.
- **Enlaces (sitemap):** iniciar sesión, bienvenida (cuenta creada).

### /paginas/acceso/recuperar.html: pedir el enlace
- **Responsable del esquema:** Flavia (propuesta)
- **Esquema:** [diseno/recuperar.svg](diseno/recuperar.svg)
- **Idea:** misma pantalla dividida, con el formulario a la derecha.
- **Estados:** formulario y mensaje de éxito, que es siempre el mismo exista o no la cuenta.
- **Enlaces (sitemap):** iniciar sesión.

### /paginas/acceso/restablecer.html: elegir una contraseña nueva
- **Responsable del esquema:** Flavia (propuesta)
- **Esquema:** [diseno/restablecer.svg](diseno/restablecer.svg)
- **Idea:** misma pantalla dividida, con el formulario a la derecha.
- **Estados:** formulario, contraseñas que no coinciden, enlace no válido (solo un aviso) y éxito con enlace a iniciar sesión.
- **Enlaces (sitemap):** iniciar sesión.

### /paginas/cuenta/bienvenida.html: mis experiencias
- **Responsable del esquema:** Matthew, según el reparto del equipo. Hay una **propuesta de Flavia** que él puede sustituir.
- **Esquema (pantalla y diálogo):** [diseno/bienvenida.svg](diseno/bienvenida.svg)
- **Idea:** «Tus experiencias» en rejilla de cuatro columnas, con la tarjeta «+» primera para crear una experiencia. Cada tarjeta lleva título, ciudad, etiqueta de visibilidad y «Ver detalle». El diálogo sirve para crear y para editar.
- **Estados:** cargando, vacío, lista con «Cargar más», error de lista y diálogo con aviso.
- **Enlaces (sitemap):** detalle de una experiencia.

### /paginas/cuenta/perfil.html: mi perfil
- **Responsable del esquema:** Flavia
- **Esquema:** [diseno/perfil.svg](diseno/perfil.svg)
- **Idea:** cabecera con foto grande, nombre y contadores (experiencias, amigos y seguidores; son texto, no enlaces), y el aviso de solicitudes recibidas en una banda destacada, con las solicitudes y sus botones secundarios «Aceptar» y «Rechazar». Ningún botón principal; en «Ajustes», «Guardar cambios» y «Cambiar contraseña» son secundarios. Sin pestañas: debajo, las secciones apiladas Mis experiencias, Amigos y Seguidores. «Ajustes» queda plegado con `<details>` y contiene los datos, la contraseña y «Cerrar sesión».
- **Estados:** datos, foto subiéndose, listas vacías o con «Cargar más».
- **Enlaces (sitemap):** perfil de otra persona (amigos, seguidores y solicitudes) y detalle de una experiencia.

### /paginas/social/personas.html: buscar
- **Responsable del esquema:** Flavia
- **Esquema:** [diseno/personas.svg](diseno/personas.svg)
- **Idea:** título «Buscar», campo grande con el texto de la cabecera, pestañas «Personas» y «Experiencias», y filas con foto, nombre y ciudad. «Experiencias» está vacía por diseño y muestra «Todavía no hay experiencias que mostrar».
- **Estados:** antes de buscar, «Buscando…» y «Cargando…», con resultados (como mucho 20) y sin resultados («No se han encontrado personas.»).
- **Enlaces (sitemap):** perfil de otra persona.

### /paginas/social/usuario.html: perfil de otra persona
- **Responsable del esquema:** Flavia
- **Esquema:** [diseno/usuario.svg](diseno/usuario.svg)
- **Idea:** cabecera centrada con foto, nombre, contadores, botón de amistad y «Seguir»; debajo, sus experiencias en rejilla.
- **Estados:** perfil, «Usuario no encontrado», cuatro versiones del botón de amistad (ninguna, enviada, recibida, amigos), «Seguir» o «Dejar de seguir», y «No hay experiencias que puedas ver».
- **Enlaces (sitemap):** detalle de una experiencia; si es el propio usuario, `/paginas/cuenta/perfil.html`.

### /paginas/experiencias/experiencia.html: una experiencia
- **Responsable del esquema:** Flavia (propuesta)
- **Esquema:** [diseno/experiencia.svg](diseno/experiencia.svg)
- **Idea:** una sola columna: «← Volver», título, línea de metadatos (autor, ciudad, visibilidad y puntuación media, solo si el dato ya existe: hoy el backend no la ofrece), descripción, formulario de valoración compacto (el autor no lo ve) y pestañas «De amigos y seguidores» y «Todas» con filas de valoración y «Cargar más».
- **Estados:** cargando, sin id, 401 (a `/paginas/acceso/iniciar-sesion.html`), «Contenido no disponible» (404), error y mostrando.
- **Nota:** «Útil» y «Reportar» solo funcionan en la pantalla hasta que se implementen CS-02 y CS-04.
- **Enlaces (sitemap):** perfil o usuario del autor (y de cada valoración).


### Páginas del rediseño

Maquetas de escritorio en color, con contenido de ejemplo y estado vacío. Las de «diseño futuro» no tienen backend; las «a reorganizar» ya existen con otra forma. Estado y flujos de cada una: [inventario-pantallas.md](inventario-pantallas.md).

| Página | Grupo | Estado | Estructura | Esquema |
|---|---|---|---|---|
| `ayuda.html` | Público | diseño futuro | Buscador de ayuda; Preguntas frecuentes (lista plegable); Contacto. Sin artículos todavía | [ayuda.svg](diseno/ayuda.svg) |
| `terminos.html` | Público | diseño futuro | Pestañas: Términos | Privacidad; Texto legal en una columna. Texto legal pendiente | [terminos.svg](diseno/terminos.svg) |
| `no-encontrada.html` | Público | diseño futuro | Icono y «No encontramos esta página»; Botón «Ir al inicio». Estado vacío | [no-encontrada.svg](diseno/no-encontrada.svg) |
| `explorar.html` | Inicio y descubrir | diseño futuro | Chips de categoría; Rejilla de tarjetas con bloque de color; Ciudades destacadas. Aún no hay planes que explorar | [explorar.svg](diseno/explorar.svg) |
| `ciudad.html?id=` | Inicio y descubrir | diseño futuro | Cabecera de ciudad (nombre y nº de planes); Chips de categoría; Rejilla de planes de la ciudad. Aún no hay planes en esta ciudad | [ciudad.svg](diseno/ciudad.svg) |
| `crear-plan.html` | Planes | a reorganizar | Título, ciudad, categoría, descripción; Visibilidad (pública, amigos, privada); Botón principal «Publicar». Hoy es un diálogo en Inicio | [crear-plan.svg](diseno/crear-plan.svg) |
| `editar-plan.html?id=` | Planes | a reorganizar | Mismo formulario que Crear plan, relleno; Botón principal «Guardar cambios»; Eliminar plan (peligro). Hoy es un diálogo en Inicio | [editar-plan.svg](diseno/editar-plan.svg) |
| `guardados.html` | Planes | diseño futuro | Rejilla de planes guardados. Aún no has guardado planes | [guardados.svg](diseno/guardados.svg) |
| `mis-planes.html` | Planes | a reorganizar | Pestañas: Publicados | Borradores; Rejilla con tarjeta «+». Aún no has publicado planes | [mis-planes.svg](diseno/mis-planes.svg) |
| `amigos.html` | Personas y social | diseño futuro | Buscador de amigos; Filas de persona. Aún no tienes amigos | [amigos.svg](diseno/amigos.svg) |
| `seguidores.html` | Personas y social | diseño futuro | Pestañas: Seguidores | Seguidos; Filas de persona. Aún no tienes seguidores | [seguidores.svg](diseno/seguidores.svg) |
| `/paginas/social/solicitudes.html` | Personas y social | implementada | Solicitudes | [solicitudes.svg](diseno/solicitudes.svg) |
| `/paginas/cuenta/ajustes.html` | Cuenta | a reorganizar | Pestañas: Datos | Foto | Contraseña | Privacidad | Notificaciones; Formulario de la pestaña activa; Botón secundario «Guardar cambios» | [ajustes.svg](diseno/ajustes.svg) |
| `notificaciones.html` | Sistema | diseño futuro | Filas de actividad (nuevo seguidor, solicitud, valoración); «Marcar todo como leído». No tienes notificaciones | [notificaciones.svg](diseno/notificaciones.svg) |
| `error.html` | Sistema | diseño futuro | Icono y «Algo ha fallado»; Botón «Reintentar». Estado de error | [error.svg](diseno/error.svg) |
| `sin-permiso.html` | Sistema | diseño futuro | Icono y «Contenido no disponible»; Botón «Ir al inicio». Mismo texto que el 404 de plan | [sin-permiso.svg](diseno/sin-permiso.svg) |

## Requisitos mínimos de un buen diseño de frontend

Lista con la que se revisa cada esquema y, después, cada pantalla. Parte de las pautas de accesibilidad WCAG 2.2 de nivel AA y de buenas prácticas habituales. La última columna describe **el estado del código hoy**, con el diseño aplicado.

| # | Requisito | Cómo se comprueba | Cómo lo cumple el diseño | Estado del código hoy |
|---|---|---|---|---|
| 1 | **Adaptable** | Sin desplazamiento horizontal a 1024, 1280 y 1440 px | Contenido centrado de hasta unos 960 px | Las 10 páginas llevan `viewport`. El diseño se comprueba en escritorio |
| 2 | **Navegación clara** | Se llega a los destinos principales en un clic y se sabe dónde se está | Cabecera común; la sección activa se marca con línea gruesa y negrita | Cabecera común en las 5 páginas con sesión: `nav` con `aria-label="Principal"` y `aria-current="page"` en la página actual |
| 3 | **Zonas pulsables suficientes** | Al menos 24 × 24 px (mínimo AA) y, mejor, 44 × 44 px | Alto mínimo de 44 px en botones y campos | Botones y campos de al menos 44 px de alto |
| 4 | **Contraste suficiente** | Texto 4,5:1; texto grande y componentes de interfaz 3:1 | Paleta de `arte.md` con estos mínimos | Los colores salen de las variables `--color-*` de `tokens.css`, con el contraste calculado en `arte.md`; el borde de los campos cumple 3:1 |
| 5 | **Uso con teclado y foco visible** | Todo se alcanza con Tab y el foco se ve | Elementos nativos (`button`, `a`, `details`, `dialog`) | Enlace «Saltar al contenido» en la landing y en las páginas con sesión; elementos nativos (`button`, `a`, `details`, `dialog`) y foco visible propio |
| 6 | **Estructura semántica** | `lang`, un solo `h1`, `main`, `nav` con nombre y etiquetas en los campos | Cada pantalla tiene un título principal y campos con etiqueta | Las 10 páginas cumplen `lang="es"`, un `h1`, `main` e imágenes con `alt`; los `nav` tienen nombre |
| 7 | **No depender solo del color** | La información sigue clara en blanco y negro | Activo = línea + negrita; errores = texto, no solo color | «Solicitud enviada» y los errores se distinguen por el texto, no solo por el color |
| 8 | **Estados y avisos** | Cada pantalla resuelve cargando, vacío, error y «Contenido no disponible», y los errores se anuncian a lectores de pantalla | Cada esquema dibuja sus avisos; los estados están en [frontend.md](frontend.md) | Todos los avisos de error llevan `role="alert"` (lo comprueba una prueba) y las pantallas con datos tienen estado «Cargando…» |
| 9 | **Jerarquía clara** | Un solo botón principal por pantalla | Un botón principal relleno; el resto, con contorno o de texto | Un botón principal relleno por pantalla; el resto, con contorno o de texto |
| 10 | **Legible y estable** | Cuerpo de texto de 16 px, columnas de texto estrechas y sin saltos al cargar las imágenes | Formularios en una columna estrecha | Las imágenes de perfil llevan `width` y `height`; el cuerpo usa 16 px y los formularios van en una columna estrecha |
| 11 | **Sin JavaScript de Bootstrap** | Nada del diseño depende de sus componentes | Diálogos con `<dialog>` y plegables con `<details>` | Cumple: diálogos con `<dialog>` y plegables con `<details>`, sin JavaScript de Bootstrap |

**Cómo se midió el contraste:** fórmula de luminancia relativa de WCAG con los colores por defecto de Bootstrap 5.3. No se ha medido sobre capturas de pantalla.

**Cómo se aplicó:** cabecera nueva con nombre y `aria-current`, enlace «Saltar al contenido», borde de campos con contraste 3:1 y botones de 44 px. La landing es `index.html` y el inicio de sesión está en `/paginas/acceso/iniciar-sesion.html`.

## Decisiones

| Pregunta | Quién decide | Estado |
|---|---|---|
| ¿Hay una landing page antes del inicio de sesión? | Equipo | **Cerrada (cambio de decisión, 26/10/2026):** sí, `index.html` pasa a ser una landing estática. Sustituye a la decisión del 26/10/2026 de no crear una página nueva |
| ¿Dónde está el inicio de sesión? | Equipo | **Cerrada (26/10/2026):** en `/paginas/acceso/iniciar-sesion.html`, en pantalla dividida |
| ¿Y las pantallas pequeñas? | Equipo | **Cerrada (26/10/2026):** aparcadas; los esquemas son solo de escritorio. Ver registro |
| Cabecera | Equipo | **Cerrada (26/10/2026):** variante B, con buscador central y menú de cuenta |
| Experiencia | Equipo | **Cerrada (26/10/2026):** variante A, una columna con valoraciones en pestañas |
| Búsqueda | Equipo | **Cerrada (26/10/2026):** unificada, con pestañas «Personas» y «Experiencias» |
| Perfil propio | Equipo | **Cerrada (26/10/2026):** sin pestañas; secciones apiladas y «Ajustes» plegado |
| `/paginas/social/usuario.html` | Equipo | **Cerrada (26/10/2026):** cabecera centrada y experiencias en rejilla |
| ¿`diseno.md` y `arte.md` separados o un solo archivo? | Equipo | **Cerrada (26/10/2026):** dos archivos: `diseno.md` (estructura) y `arte.md` (guía de estilo) |

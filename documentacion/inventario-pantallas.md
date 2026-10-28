# Inventario de pantallas de PlanB

> Las pantallas con sus estados (cargando, vacío, error y «Contenido no disponible») y sus flujos. Es el objetivo 5 de la historia CS-65 (diseño visual).
> Fuentes: [frontend.md](frontend.md) (cómo está hecho hoy), [sitemap.mmd](sitemap.mmd) (flujos), [arte.md](arte.md) (identidad visual) y el código de `frontend/`, que se revisó pantalla a pantalla para comprobar los estados. Los esquemas (solo escritorio) están en [diseno.md](diseno.md) y en [diseno/](diseno/).
> Revisado el 26/10/2026. Actualizado ese mismo día al cubrir las lagunas de la sección 5 y al pasar a diez pantallas (landing en `index.html` e inicio de sesión en `/acceso/iniciar-sesion.html`).

## Cómo leer las tablas

| Símbolo | Significa |
|---|---|
| ✔ | El estado existe hoy en la pantalla |
| ✗ | La pantalla lo necesita y hoy **no lo tiene** (ver «Lagunas») |
| — | No aplica: la pantalla no tiene ese estado |

## 1. Las páginas del sitemap

| # | Página | Grupo | Estado | Para qué sirve | Esquema |
|---|---|---|---|---|---|
| 1 | `index.html` | Público | implementada | Landing | [index.svg](diseno/index.svg) |
| 2 | `/acceso/iniciar-sesion.html` | Público | implementada | Iniciar sesión | [iniciar-sesion.svg](diseno/iniciar-sesion.svg) |
| 3 | `/acceso/registro.html` | Público | implementada | Crear cuenta | [registro.svg](diseno/registro.svg) |
| 4 | `/acceso/recuperar.html` | Público | implementada | Recuperar contraseña | [recuperar.svg](diseno/recuperar.svg) |
| 5 | `/acceso/restablecer.html` | Público | implementada | Restablecer contraseña | [restablecer.svg](diseno/restablecer.svg) |
| 6 | `ayuda.html` | Público | diseño futuro | Ayuda | [ayuda.svg](diseno/ayuda.svg) |
| 7 | `terminos.html` | Público | diseño futuro | Términos y privacidad | [terminos.svg](diseno/terminos.svg) |
| 8 | `no-encontrada.html` | Público | diseño futuro | Página no encontrada (404) | [no-encontrada.svg](diseno/no-encontrada.svg) |
| 9 | `/cuenta/bienvenida.html` | Inicio y descubrir | implementada | Inicio | [bienvenida.svg](diseno/bienvenida.svg) |
| 10 | `explorar.html` | Inicio y descubrir | diseño futuro | Explorar | [explorar.svg](diseno/explorar.svg) |
| 11 | `ciudad.html?id=` | Inicio y descubrir | diseño futuro | Ciudad | [ciudad.svg](diseno/ciudad.svg) |
| 12 | `/social/personas.html` | Inicio y descubrir | a reorganizar | Resultados de búsqueda | [personas.svg](diseno/personas.svg) |
| 13 | `/experiencias/experiencia.html?id=` | Planes | implementada | Detalle del plan | [experiencia.svg](diseno/experiencia.svg) |
| 14 | `crear-plan.html` | Planes | a reorganizar | Crear plan | [crear-plan.svg](diseno/crear-plan.svg) |
| 15 | `editar-plan.html?id=` | Planes | a reorganizar | Editar plan | [editar-plan.svg](diseno/editar-plan.svg) |
| 16 | `guardados.html` | Planes | diseño futuro | Guardados | [guardados.svg](diseno/guardados.svg) |
| 17 | `mis-planes.html` | Planes | a reorganizar | Mis planes | [mis-planes.svg](diseno/mis-planes.svg) |
| 18 | `/cuenta/perfil.html` | Personas y social | a reorganizar | Mi perfil | [perfil.svg](diseno/perfil.svg) |
| 19 | `/social/usuario.html?nombre=` | Personas y social | implementada | Perfil de otra persona | [usuario.svg](diseno/usuario.svg) |
| 20 | `amigos.html` | Personas y social | diseño futuro | Amigos | [amigos.svg](diseno/amigos.svg) |
| 21 | `seguidores.html` | Personas y social | diseño futuro | Seguidores y seguidos | [seguidores.svg](diseno/seguidores.svg) |
| 22 | `/social/amigos.html` | Personas y social | implementada | Amigos | [solicitudes.svg](diseno/solicitudes.svg) |
| 23 | `/cuenta/ajustes.html` | Cuenta | a reorganizar | Ajustes | [ajustes.svg](diseno/ajustes.svg) |
| 24 | `notificaciones.html` | Sistema | diseño futuro | Notificaciones | [notificaciones.svg](diseno/notificaciones.svg) |
| 25 | `error.html` | Sistema | diseño futuro | Error del servidor | [error.svg](diseno/error.svg) |
| 26 | `sin-permiso.html` | Sistema | diseño futuro | Sin permiso | [sin-permiso.svg](diseno/sin-permiso.svg) |

Son 26 páginas. «Implementada» existe tal como se dibuja; «a reorganizar» existe hoy con otra forma (por ejemplo, crear y editar son diálogos de Inicio); «diseño futuro» no tiene backend ni frontend y es solo maqueta con estado vacío. Las cabeceras y pies están en [cabecera.svg](diseno/cabecera.svg).

## 2. Estados de cada pantalla

Las páginas «diseño futuro» solo tienen el estado vacío de la maqueta (columna «Esquema» y sección 1); no se listan aquí hasta que existan.

Los cuatro estados que pide la tarjeta, más los propios de cada pantalla.

| Pantalla | Cargando | Vacío | Error | «Contenido no disponible» | Otros estados |
|---|---|---|---|---|---|
| `index` (landing) | — (estática, sin JavaScript) | — | — | — | Marcos de captura con rótulo «Captura de PlanB» en lugar de capturas reales |
| `iniciar-sesion` | — (no carga datos) | — | ✔ aviso con el mensaje del servidor | — | «Entrar» se desactiva mientras se envía («Entrando…») |
| `registro` | — | — | ✔ validación, duplicado y CAPTCHA no disponible | — | ✔ «Creando cuenta…» mientras se envía; requisitos de la contraseña marcados al escribir |
| `recuperar` | — | — | ✔ aviso de error | — | ✔ éxito, con el mismo mensaje exista o no la cuenta |
| `restablecer` | — | — | ✔ aviso de error | — | ✔ sin token en la dirección (aviso y formulario oculto); contraseñas que no coinciden; éxito con enlace al inicio de sesión |
| `mis-planes` | ✔ «Cargando…» | ✔ «Todavía no has publicado experiencias.», junto a la tarjeta «+» | ✔ error de la lista y error del diálogo | — | Diálogo de crear o editar abierto; «Cargar más» |
| `perfil` | ✔ «Cargando…» | ✔ cuatro: sin experiencias, sin solicitudes, sin amigos y sin seguidores | ✔ seis avisos (foto, datos, contraseña, experiencias, solicitudes y relaciones) | — | ✔ «Subiendo foto…»; avisos de éxito en foto, datos y contraseña; «Cargar más» |
| `personas` | ✔ «Cargando…» mientras busca | ✔ «No se han encontrado personas.»; en la pestaña Experiencias, vacío por diseño (CS-24): «Todavía no hay experiencias que mostrar» | ✔ aviso de error | — | ✔ antes de buscar: «Escribe parte de un nombre.» (Personas) o «Escribe para buscar experiencias.» (Experiencias); «Buscando…» mientras se envía |
| `usuario` | ✔ «Cargando…», sin datos de relleno hasta que llega el perfil | ✔ «No hay experiencias que puedas ver.» | ✔ error de la acción y error de la lista | ✔ **«Usuario no encontrado»** | Si es el propio usuario, va a `/cuenta/perfil.html`; cuatro versiones del botón de amistad; «Seguir» o «Dejar de seguir» |
| `experiencia` | ✔ «Cargando experiencia…» | ✔ sin valoraciones de amigos y sin comentarios | ✔ aviso en la valoración y errores de carga | ✔ **«Contenido no disponible»** (404) | Sin identificador en la dirección; sin sesión (401); el autor no ve el formulario; reporte; «Útil» y «Reportar» no guardan nada todavía |

**En todas las pantallas con sesión,** un 401 devuelve a `/acceso/iniciar-sesion.html`. **Todos los avisos de error llevan `role="alert"`**, y una prueba lo comprueba en las páginas con avisos.

## 3. Flujos

Salen del [sitemap](sitemap.mmd). Cada fila es una flecha del mapa.

| Desde | Hacia | Cómo |
|---|---|---|
| `index` (landing) | `registro` | «Crear cuenta» (cabecera, portada y llamamiento final) |
| `index` (landing) | `iniciar-sesion` | «Iniciar sesión» (cabecera y llamamiento final) |
| `iniciar-sesion` | `registro` | Botón «Crear cuenta» |
| `iniciar-sesion` | `recuperar` | «¿Has olvidado tu contraseña?» |
| `iniciar-sesion` | `bienvenida` | Acceso correcto |
| `registro` | `iniciar-sesion` | «Iniciar sesión» |
| `registro` | `bienvenida` | Cuenta creada (la sesión ya está abierta) |
| `recuperar` | `iniciar-sesion` | «Volver» |
| `recuperar` | `restablecer` | Enlace recibido por correo (con el token) |
| `restablecer` | `iniciar-sesion` | «Volver» tras cambiarla |
| `bienvenida` | `experiencia` | «Ver detalle» de una tarjeta |
| `perfil` | `usuario` | Un amigo, un seguidor o un solicitante |
| `perfil` | `experiencia` | Una de mis experiencias |
| `personas` | `usuario` | Un resultado de la búsqueda |
| `usuario` | `experiencia` | Una de sus experiencias |
| `usuario` | `perfil` | Si el nombre es el del propio usuario |
| `experiencia` | `usuario` | El autor, o el autor de una valoración |
| `experiencia` | `perfil` | Si el autor soy yo |
| Cualquiera con sesión | `bienvenida` | Marca PlanB y «Inicio» de la cabecera |
| Cualquiera con sesión | `perfil` | «Mi perfil» del menú de cuenta |
| Cualquiera con sesión | `personas` | Buscador de la cabecera (`/social/personas.html?q=texto`) |
| Cualquiera con sesión | `iniciar-sesion` | «Cerrar sesión» del menú de cuenta |
| Cualquiera con sesión | `iniciar-sesion` | Sesión no válida (401) |
| Cualquiera con sesión | `explorar`, `mis-planes`, `amigos` | Barra de pestañas (rediseño) |
| Cualquiera con sesión | `notificaciones`, `crear-plan` | Campana y «Crear plan» de la cabecera (rediseño) |
| Menú de cuenta | `guardados`, `ajustes`, `ayuda` | Opciones del menú (rediseño) |
| `explorar`, `personas` | `ciudad` | Una ciudad (rediseño) |
| `mis-planes` | `crear-plan` | Tarjeta «+» (rediseño) |
| `experiencia` | `editar-plan` | Editar, si soy el autor (rediseño) |
| `perfil` | `amigos`, `seguidores`, `solicitudes` | Contadores y banda de solicitudes (rediseño) |
| `notificaciones` | `solicitudes`, `usuario`, `experiencia` | Fila de actividad (rediseño) |
| Pie | `ayuda`, `terminos` | Enlaces del pie (rediseño) |
| `experiencia`, `usuario` | `sin-permiso`, `no-encontrada` | Contenido no visible o inexistente (rediseño) |

## 4. Identidad visual aplicada

Qué componentes de [arte.md](arte.md) usa cada pantalla, y cuál es su botón principal (**uno por pantalla**).

| Pantalla | Botón principal | Componentes de la guía que usa |
|---|---|---|
| `index` (landing) | **Crear cuenta** | Cabecera sin sesión, marco de captura, tres bloques con icono, tres pasos, botón secundario «Iniciar sesión» |
| `iniciar-sesion` | **Entrar** | Pantalla dividida sin cabecera, campos, avisos, botón secundario «Crear cuenta», botón con estado de espera |
| `registro` | **Crear cuenta** | Pantalla dividida, campos, requisitos de la contraseña, CAPTCHA, avisos |
| `recuperar` | **Enviar enlace** | Pantalla dividida, campos, avisos de error y de éxito |
| `restablecer` | **Guardar contraseña** | Pantalla dividida, campos, requisitos, avisos |
| `bienvenida` | **Guardar** (en el diálogo) | Cabecera con sesión, rejilla de tarjetas con etiqueta de visibilidad, diálogo, lista con «Cargar más», avisos |
| `perfil` | Ninguno (todos secundarios: «Aceptar», «Rechazar», «Guardar cambios», «Cambiar contraseña») | Cabecera con sesión, cabecera de perfil con contadores, banda de solicitudes, campos, tarjetas, avisos, lista con «Cargar más», etiquetas de visibilidad |
| `personas` | **Buscar** | Cabecera con sesión, campo, pestañas, filas de resultado, botón con estado de espera, aviso de vacío |
| `usuario` | **Añadir amigo** (o «Aceptar», según la relación) | Cabecera con sesión, cabecera de perfil con contadores, botones de amistad y de seguir, rejilla de tarjetas, etiquetas de visibilidad, avisos |
| `experiencia` | **Guardar** (la valoración) | Cabecera con sesión, tarjetas, campos, pestañas, listas con «Cargar más», diálogo de reporte, avisos |

Cada pantalla tiene como máximo un botón principal (Perfil, ninguno). Hoy ninguna pantalla lleva todavía esta identidad: la aplicación usa los colores por defecto de Bootstrap. Aplicarla es la historia de implementación.

## 5. Lagunas detectadas y su estado

Estados que la tarjeta pide y que **no existían** al revisar el código el 26/10/2026. Cuatro de las cinco se han cubierto ese mismo día.

| # | Laguna | Dónde | Qué hace el diseño | Estado |
|---|---|---|---|---|
| 1 | **No había estado «Cargando»**: mientras llegaban los datos la pantalla quedaba vacía | `bienvenida`, `perfil`, `personas`, `usuario` (solo `experiencia` lo tenía) | Un texto «Cargando…» igual en todas, en `#cargando` | ✔ Cubierta (26/10/2026) |
| 2 | **La bienvenida sin experiencias no explicaba nada**: solo se veía la tarjeta «+» | `bienvenida` | «Todavía no has publicado experiencias.» | ✔ Cubierta (26/10/2026) |
| 3 | **`personas` antes de buscar no tenía texto de ayuda** | `personas` | «Escribe parte de un nombre.» | ✔ Cubierta (26/10/2026) |
| 4 | **Ocho avisos de error no se anunciaban a lectores de pantalla**, en seis pantallas | `iniciar-sesion` (antes `index`), `registro`, `bienvenida` (2), `perfil` (2), `usuario` y `experiencia` | `role="alert"` en todos los avisos de error | ✔ Cubierta (26/10/2026), con una prueba que revisa las páginas |
| 5 | «Útil» y «Reportar» **no guardan nada** | `experiencia` | Reservarles su sitio sin que parezca que funcionan | ⏳ Pendiente: depende de CS-02 y CS-04, que son de otras historias |

## Para quien continúe

- Al añadir una pantalla, se añade una fila en cada tabla de este documento, un esquema en [diseno/](diseno/) y su flecha en el [sitemap](sitemap.mmd).
- La única laguna que queda abierta es la 5; cuando se implementen CS-02 y CS-04, se actualiza su estado en la sección 5.
- Los estados de las pantallas se describen con más detalle, y con sus diagramas, en [frontend.md](frontend.md).

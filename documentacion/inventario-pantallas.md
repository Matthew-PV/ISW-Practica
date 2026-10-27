# Inventario de pantallas de PlanB

> Las diez pantallas con sus estados (cargando, vacío, error y «Contenido no disponible») y sus flujos. Es el objetivo 5 de la historia CS-65 (diseño visual).
> Fuentes: [frontend.md](frontend.md) (cómo está hecho hoy), [sitemap.mmd](sitemap.mmd) (flujos), [arte.md](arte.md) (identidad visual) y el código de `frontend/`, que se revisó pantalla a pantalla para comprobar los estados. Los esquemas (solo escritorio) están en [diseno.md](diseno.md) y en [diseno/](diseno/).
> Revisado el 26/10/2026. Actualizado ese mismo día al cubrir las lagunas de la sección 5 y al pasar a diez pantallas (landing en `index.html` e inicio de sesión en `iniciar-sesion.html`).

## Cómo leer las tablas

| Símbolo | Significa |
|---|---|
| ✔ | El estado existe hoy en la pantalla |
| ✗ | La pantalla lo necesita y hoy **no lo tiene** (ver «Lagunas») |
| — | No aplica: la pantalla no tiene ese estado |

## 1. Las diez pantallas

| # | Pantalla | Grupo | Para qué sirve | Esquema |
|---|---|---|---|---|
| 1 | `index.html` | Acceso | Landing pública y estática: qué es PlanB y enlaces a «Crear cuenta» y «Iniciar sesión» | [index.svg](diseno/index.svg) |
| 2 | `iniciar-sesion.html` | Acceso | Iniciar sesión | [iniciar-sesion.svg](diseno/iniciar-sesion.svg) |
| 3 | `registro.html` | Acceso | Crear una cuenta | [registro.svg](diseno/registro.svg) |
| 4 | `recuperar.html` | Acceso | Pedir el enlace para recuperar la contraseña | [recuperar.svg](diseno/recuperar.svg) |
| 5 | `restablecer.html` | Acceso | Elegir una contraseña nueva desde el enlace del correo | [restablecer.svg](diseno/restablecer.svg) |
| 6 | `bienvenida.html` | Con sesión | Mis experiencias; crear y editar | [bienvenida.svg](diseno/bienvenida.svg) |
| 7 | `perfil.html` | Con sesión | Mi perfil, mis solicitudes, mis amigos y seguidores | [perfil.svg](diseno/perfil.svg) |
| 8 | `personas.html` | Con sesión | Buscar personas (y, vacía por ahora, experiencias) | [personas.svg](diseno/personas.svg) |
| 9 | `usuario.html?nombre=` | Con sesión | Perfil de otra persona: amistad, seguir y sus experiencias | [usuario.svg](diseno/usuario.svg) |
| 10 | `experiencia.html?id=` | Con sesión | Una experiencia y sus valoraciones | [experiencia.svg](diseno/experiencia.svg) |

Las cinco pantallas con sesión comparten la cabecera con buscador y menú de cuenta ([cabecera.svg](diseno/cabecera.svg)); las de acceso son pantalla dividida sin barra de cabecera, con la marca PlanB en la columna izquierda; solo la landing lleva cabecera sin sesión («Iniciar sesión» y «Crear cuenta») y pie.

## 2. Estados de cada pantalla

Los cuatro estados que pide la tarjeta, más los propios de cada pantalla.

| Pantalla | Cargando | Vacío | Error | «Contenido no disponible» | Otros estados |
|---|---|---|---|---|---|
| `index` (landing) | — (estática, sin JavaScript) | — | — | — | Marcos de captura con rótulo «Captura de PlanB» en lugar de capturas reales |
| `iniciar-sesion` | — (no carga datos) | — | ✔ aviso con el mensaje del servidor | — | «Entrar» se desactiva mientras se envía («Entrando…») |
| `registro` | — | — | ✔ validación, duplicado y CAPTCHA no disponible | — | ✔ «Creando cuenta…» mientras se envía; requisitos de la contraseña marcados al escribir |
| `recuperar` | — | — | ✔ aviso de error | — | ✔ éxito, con el mismo mensaje exista o no la cuenta |
| `restablecer` | — | — | ✔ aviso de error | — | ✔ sin token en la dirección (aviso y formulario oculto); contraseñas que no coinciden; éxito con enlace al inicio de sesión |
| `bienvenida` | ✔ «Cargando…» | ✔ «Todavía no has publicado experiencias.», junto a la tarjeta «+» | ✔ error de la lista y error del diálogo | — | Diálogo de crear o editar abierto; «Cargar más» |
| `perfil` | ✔ «Cargando…» | ✔ cuatro: sin experiencias, sin solicitudes, sin amigos y sin seguidores | ✔ seis avisos (foto, datos, contraseña, experiencias, solicitudes y relaciones) | — | ✔ «Subiendo foto…»; avisos de éxito en foto, datos y contraseña; «Cargar más» |
| `personas` | ✔ «Cargando…» mientras busca | ✔ «No se han encontrado personas.»; en la pestaña Experiencias, vacío por diseño (CS-24): «Todavía no hay experiencias que mostrar» | ✔ aviso de error | — | ✔ antes de buscar: «Escribe parte de un nombre.» (Personas) o «Escribe para buscar experiencias.» (Experiencias); «Buscando…» mientras se envía |
| `usuario` | ✔ «Cargando…», sin datos de relleno hasta que llega el perfil | ✔ «No hay experiencias que puedas ver.» | ✔ error de la acción y error de la lista | ✔ **«Usuario no encontrado»** | Si es el propio usuario, va a `perfil.html`; cuatro versiones del botón de amistad; «Seguir» o «Dejar de seguir» |
| `experiencia` | ✔ «Cargando experiencia…» | ✔ sin valoraciones de amigos y sin comentarios | ✔ aviso en la valoración y errores de carga | ✔ **«Contenido no disponible»** (404) | Sin identificador en la dirección; sin sesión (401); el autor no ve el formulario; reporte; «Útil» y «Reportar» no guardan nada todavía |

**En todas las pantallas con sesión,** un 401 devuelve a `iniciar-sesion.html`. **Todos los avisos de error llevan `role="alert"`**, y una prueba lo comprueba en las páginas con avisos.

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
| Cualquiera con sesión | `personas` | Buscador de la cabecera (`personas.html?q=texto`) |
| Cualquiera con sesión | `iniciar-sesion` | «Cerrar sesión» del menú de cuenta |
| Cualquiera con sesión | `iniciar-sesion` | Sesión no válida (401) |

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

# Pantallas del frontend — PlanB

> Qué pantallas hay, cómo se pasa de una a otra, qué archivos usa cada una y qué llamadas hace a la API.
> Documentos relacionados: [arquitectura](arquitectura.md), [flujos](flujos.md), [referencia de la API](api.md), [glosario](anexo/glosario.md) e [inventario de pantallas](inventario-pantallas.md) (estados y lagunas frente al diseño).

El frontend son páginas HTML estáticas con JavaScript sin *framework* y estilos de Bootstrap 5 (solo su CSS) complementados por `css/styles.css` y por el CSS propio de cada grupo de páginas. Está pensado para escritorio; la adaptación a pantallas pequeñas está aparcada. El mismo servidor Express sirve las páginas desde `frontend/` y la API desde `/api`, así que comparten origen y la cookie de sesión viaja sola en cada `fetch`.

## Mapa de navegación

El [sitemap de PlanB](sitemap.mmd) es la referencia del mapa de navegación, en formato Mermaid. Es la maqueta completa del rediseño: las doce páginas actuales y las que aún no existen, agrupadas en seis bloques y marcadas como «implementada», «a reorganizar» o «diseño futuro». Lo marcado «diseño futuro» o «a reorganizar» no existe todavía tal como se dibuja.

```mermaid
%% Copia renderizable de sitemap.mmd. Al modificar el sitemap, actualiza ambos bloques.
%% Sitemap de PlanB — rediseño (maqueta completa).
%% Cada caja es una página; las flechas, enlaces o redirecciones. Estado entre paréntesis: implementada, a reorganizar o diseño futuro.
%% Navegación principal (barra de pestañas): Inicio, Explorar, Mis planes y Amigos. Secundaria: menú de cuenta (Mi perfil, Guardados, Ajustes, Ayuda, Cerrar sesión), campana, «Crear plan», buscador y pie.
%% Línea discontinua: enlace recibido por correo. Sesión no válida (401): se vuelve a Iniciar sesión.
%% Los parámetros de las URL se explican en frontend.md.
flowchart TB
    subgraph g_0["Público"]
        index["Landing<br/>index.html<br/>(implementada)"]
        iniciar_sesion["Iniciar sesión<br/>/acceso/iniciar-sesion.html<br/>(implementada)"]
        registro["Crear cuenta<br/>/acceso/registro.html<br/>(implementada)"]
        recuperar["Recuperar contraseña<br/>/acceso/recuperar.html<br/>(implementada)"]
        restablecer["Restablecer contraseña<br/>/acceso/restablecer.html<br/>(implementada)"]
        ayuda["Ayuda<br/>ayuda.html<br/>(diseño futuro)"]
        terminos["Términos y privacidad<br/>terminos.html<br/>(diseño futuro)"]
        no_encontrada["Página no encontrada (404)<br/>no-encontrada.html<br/>(diseño futuro)"]
    end
    subgraph g_1["Inicio y descubrir"]
        bienvenida["Inicio<br/>/cuenta/bienvenida.html<br/>(a reorganizar)"]
        explorar["Explorar<br/>explorar.html<br/>(diseño futuro)"]
        ciudad["Ciudad<br/>ciudad.html?id=<br/>(diseño futuro)"]
        personas["Resultados de búsqueda<br/>/social/personas.html<br/>(a reorganizar)"]
    end
    subgraph g_2["Planes"]
        experiencia["Detalle del plan<br/>/experiencias/experiencia.html?id=<br/>(implementada)"]
        crear_plan["Crear plan<br/>crear-plan.html<br/>(a reorganizar)"]
        editar_plan["Editar plan<br/>editar-plan.html?id=<br/>(a reorganizar)"]
        guardados["Guardados<br/>guardados.html<br/>(diseño futuro)"]
        mis_planes["Mis planes<br/>mis-planes.html<br/>(a reorganizar)"]
    end
    subgraph g_3["Personas y social"]
        perfil["Mi perfil<br/>/cuenta/perfil.html<br/>(a reorganizar)"]
        usuario["Perfil de otra persona<br/>/social/usuario.html?nombre=<br/>(implementada)"]
        amigos["Amigos<br/>amigos.html<br/>(diseño futuro)"]
        seguidores["Seguidores y seguidos<br/>seguidores.html<br/>(diseño futuro)"]
        solicitudes["Solicitudes<br/>/social/solicitudes.html<br/>(implementada)"]
    end
    subgraph g_4["Cuenta"]
        ajustes["Ajustes<br/>/cuenta/ajustes.html<br/>(a reorganizar)"]
    end
    subgraph g_5["Sistema"]
        notificaciones["Notificaciones<br/>notificaciones.html<br/>(diseño futuro)"]
        error["Error del servidor<br/>error.html<br/>(diseño futuro)"]
        sin_permiso["Sin permiso<br/>sin-permiso.html<br/>(diseño futuro)"]
    end

    nav["Barra de pestañas<br/>(con sesión)"]
    cuenta["Menú de cuenta<br/>(con sesión)"]
    pie["Pie<br/>(páginas públicas)"]

    index -->|"Iniciar sesión"| iniciar_sesion
    index -->|"Crear cuenta"| registro
    iniciar_sesion -->|"Crear cuenta"| registro
    registro -->|"Iniciar sesión"| iniciar_sesion
    iniciar_sesion -->|"¿Has olvidado tu contraseña?"| recuperar
    recuperar -->|"Volver"| iniciar_sesion
    recuperar -.->|"Enlace recibido por correo"| restablecer
    restablecer -->|"Volver tras cambiarla"| iniciar_sesion
    iniciar_sesion -->|"Acceso correcto"| bienvenida
    registro -->|"Cuenta creada"| bienvenida
    iniciar_sesion -->|"Logo"| index
    registro -->|"Logo"| index
    recuperar -->|"Logo"| index
    restablecer -->|"Logo"| index
    index -->|"Pie"| pie
    ayuda -->|"Pie"| pie
    terminos -->|"Pie"| pie
    pie -->|"Ayuda"| ayuda
    pie -->|"Términos y privacidad"| terminos
    nav -->|"Inicio"| bienvenida
    nav -->|"Explorar"| explorar
    nav -->|"Mis planes"| mis_planes
    nav -->|"Amigos"| amigos
    cuenta -->|"Mi perfil"| perfil
    cuenta -->|"Guardados"| guardados
    cuenta -->|"Ajustes"| ajustes
    cuenta -->|"Ayuda"| ayuda
    cuenta -->|"Cerrar sesión"| iniciar_sesion
    nav -->|"Campana"| notificaciones
    nav -->|"Crear plan"| crear_plan
    nav -->|"Buscador"| personas
    bienvenida -->|"Ver detalle"| experiencia
    explorar -->|"Una ciudad"| ciudad
    explorar -->|"Un plan"| experiencia
    ciudad -->|"Un plan"| experiencia
    personas -->|"Una persona"| usuario
    personas -->|"Un plan"| experiencia
    personas -->|"Una ciudad"| ciudad
    mis_planes -->|"Un plan"| experiencia
    mis_planes -->|"Nuevo plan"| crear_plan
    guardados -->|"Un plan"| experiencia
    experiencia -->|"Editar (si soy el autor)"| editar_plan
    editar_plan -->|"Guardado o eliminado"| mis_planes
    crear_plan -->|"Publicado"| experiencia
    experiencia -->|"Autor o valoración"| usuario
    experiencia -->|"Si el autor soy yo"| perfil
    experiencia -->|"Ciudad"| ciudad
    perfil -->|"Mis planes"| mis_planes
    perfil -->|"Contador de amigos"| amigos
    perfil -->|"Contador de seguidores"| seguidores
    perfil -->|"Banda de solicitudes"| solicitudes
    perfil -->|"Editar perfil"| ajustes
    usuario -->|"Un plan suyo"| experiencia
    usuario -->|"Si es mi nombre"| perfil
    amigos -->|"Una persona"| usuario
    seguidores -->|"Una persona"| usuario
    solicitudes -->|"Solicitante"| usuario
    notificaciones -->|"Solicitud de amistad"| solicitudes
    notificaciones -->|"Valoración o plan"| experiencia
    notificaciones -->|"Nuevo seguidor"| usuario
    experiencia -->|"Contenido no visible"| sin_permiso
    usuario -->|"Usuario no existe"| no_encontrada
    bienvenida -->|"Fallo del servidor"| error
    ayuda -->|"Volver a la aplicación"| bienvenida
    error -->|"Ir al inicio"| bienvenida
    sin_permiso -->|"Ir al inicio"| bienvenida
    no_encontrada -->|"Ir al inicio"| bienvenida
    bienvenida -->|"Sesión no válida (401)"| iniciar_sesion
```

**Entrada:** `/` sirve `index.html`, la landing pública, con enlaces a `/acceso/iniciar-sesion.html` y `/acceso/registro.html`. Un inicio de sesión o un registro correctos llevan a `/cuenta/bienvenida.html`.

**Cabecera común:** las siete páginas con sesión (`bienvenida`, `perfil`, `ajustes`, `solicitudes`, `personas`, `usuario` y `experiencia`) comparten `header.cabecera`: la marca PlanB, «Inicio» (a `/cuenta/bienvenida.html`) y «Solicitudes» (a `/social/solicitudes.html`), un buscador y el menú de cuenta (ver «Cabecera común» más abajo).

**Sesión no válida:** si una página con sesión recibe 401, `irAlLogin` (en `js/shared/pantalla.js`) lleva a `/acceso/iniciar-sesion.html`.

Las URL de detalle incluyen parámetros: `/social/usuario.html?nombre=...` identifica a la persona, `/experiencias/experiencia.html?id=...` la experiencia, `/social/personas.html?q=...` el texto a buscar y `/acceso/restablecer.html?token=...` recibe el código del enlace de recuperación. Un enlace a un usuario lleva a `/cuenta/perfil.html` si es el propio usuario y a `/social/usuario.html?nombre=...` si es otro: lo decide `crearEnlacePerfil`.

## Páginas, archivos y llamadas

Cada página carga primero `js/shared/api.js`, después los módulos compartidos que necesita y por último su script. Todas cargan `css/styles.css`; la columna «CSS propio» es el segundo archivo de estilos.

| Página | Script | CSS propio | Módulos compartidos | Llamadas a la API | Historias |
|---|---|---|---|---|---|
| `index.html` | ninguno | `landing.css` | ninguno | ninguna | CS-66 |
| `/acceso/iniciar-sesion.html` | `iniciar-sesion.js` | `acceso.css` | `api` | `POST /auth/login` | CS-59 |
| `/acceso/registro.html` | `registro.js` | `acceso.css` | `api`, `password` y Turnstile | `GET /auth/captcha`, `POST /auth/registro` | CS-59, CS-64 |
| `/acceso/recuperar.html` | `recuperar.js` | `acceso.css` | `api` | `POST /auth/recuperar` | CS-64 |
| `/acceso/restablecer.html` | `restablecer.js` | `acceso.css` | `api`, `password` | `POST /auth/restablecer` | CS-64 |
| `/cuenta/bienvenida.html` | `bienvenida.js` | ninguno | `api`, `pantalla`, `cabecera` | `GET /auth/yo`, `GET /ciudades`, `GET /experiencias?autor=`, `POST /experiencias`, `PATCH /experiencias/:id` | CS-44, CS-49, CS-57, CS-22 |
| `/cuenta/perfil.html` | `perfil.js` | `perfil.css` | `api`, `pantalla`, `pestanas`, `cabecera`, `experiencias` | `GET /perfil`, `GET /perfil/resumen`, `/perfil/amigos` y `/perfil/seguidores`, `GET /experiencias?autor=` | CS-45, CS-44 |
| `/cuenta/ajustes.html` | `ajustes.js` | ninguno | `api`, `pantalla`, `pestanas`, `cabecera`, `password` | `GET` y `PUT /perfil`, `PUT /perfil/foto`, `PUT /perfil/password` | CS-47, CS-64 |
| `/social/solicitudes.html` | `solicitudes.js` | ninguno | `api`, `pantalla`, `cabecera` | `GET /amistades/solicitudes`, `PATCH /amistades/:id` | CS-61 |
| `/social/personas.html` | `personas.js` | `buscar.css` | `api`, `pantalla`, `pestanas`, `cabecera` | `GET /usuarios?texto=` | CS-61 |
| `/social/usuario.html` | `usuario.js` | `perfil.css` | `api`, `pantalla`, `cabecera`, `experiencias` | `GET /usuarios/:nombre`, `POST` y `DELETE /amistades`, `PATCH /amistades/:id`, `POST` y `DELETE /seguimientos`, `GET /experiencias?autor=` | CS-62, CS-61, CS-44 |
| `/experiencias/experiencia.html` | `experiencia.js` | `experiencia.css` | `api`, `pestanas`, `pantalla`, `cabecera` | `GET /experiencias/:id`, `GET /auth/yo`, `GET` y `PUT /experiencias/:id/valoracion`, `GET /experiencias/:id/valoraciones` y `/valoraciones/amigos` | CS-30, CS-63, CS-48, CS-01 |

## Estilos

* `css/styles.css` es el archivo común: define las variables `--color-*` (`--color-lienzo` es el fondo de la página y las tarjetas y paneles son blancos con borde; los colores solo se escriben en ese bloque; el resto de los CSS usa `var(--color-*)`) y los componentes compartidos: cabecera, botones, tarjetas, avisos y el enlace «Saltar al contenido».
* `landing.css`: la landing (`index.html`).
* Tarjetas de experiencia: bloque de color con icono (`.bloque-categoria`, color según `data-categoria`). Estados vacíos: `.estado-vacio` con ilustración de `img/vacio-*.svg`.
* `acceso.css`: la tarjeta de formulario de `iniciar-sesion`, `registro`, `recuperar` y `restablecer`.
* `experiencia.css`: el detalle de experiencia, con la experiencia y el formulario en una columna y las valoraciones en otra.
* `perfil.css`: `/cuenta/perfil.html` y `/social/usuario.html`.
* `buscar.css`: `/social/personas.html`.

## Estados de una pantalla

Casi todas las pantallas con datos pasan por los mismos estados. Este es el de `/experiencias/experiencia.html`, el más completo; `/social/usuario.html` es igual, pero el aviso que muestra es «Usuario no encontrado».

```mermaid
stateDiagram-v2
  [*] --> Cargando : abre /experiencias/experiencia.html?id=7
  Cargando --> SinId : la URL no trae id
  Cargando --> AlLogin : 401
  Cargando --> NoDisponible : 404
  Cargando --> Error : otro error o sin conexión
  Cargando --> Mostrando : 200
  Mostrando --> Mostrando : «Cargar más», guardar la valoración
  Mostrando --> NoDisponible : una petición posterior responde 404
  Mostrando --> AlLogin : una petición posterior responde 401
  SinId : «No se ha especificado ninguna experiencia.»
  AlLogin : vuelve a /acceso/iniciar-sesion.html
  NoDisponible : solo «Contenido no disponible», se borra lo que se mostraba
  Error : aviso rojo con el mensaje
  Mostrando : datos, listas y formulario
```

Cada lista con «Cargar más» tiene, a su vez, sus propios estados, que gestiona `listaConCargarMas`:

```mermaid
stateDiagram-v2
  [*] --> Pidiendo : cargar()
  Pidiendo --> Vacia : primera página sin elementos
  Pidiendo --> ConMas : siguiente distinto de null
  Pidiendo --> Completa : siguiente es null
  Pidiendo --> Fallo : error
  ConMas --> Pidiendo : «Cargar más» (el botón se desactiva mientras tanto)
  Vacia --> Pidiendo : reiniciar()
  Completa --> Pidiendo : reiniciar()
  ConMas --> Pidiendo : reiniciar()
  Vacia : se ve el texto «sin elementos»
  ConMas : se ve el botón «Cargar más»
  Completa : se oculta el botón
  Fallo : alFallar(error) muestra el aviso
```

## Cabecera común

Las siete páginas con sesión llevan `header.cabecera`, con el mismo HTML en todas:

* La marca PlanB y los enlaces «Inicio» y «Solicitudes», dentro de un `nav` con `aria-label="Principal"`; en la página actual el enlace lleva `aria-current="page"`.
* Un buscador (`form[role="search"]`) que envía a `/social/personas.html?q=`. No se envía si el texto está vacío.
* El menú de cuenta, un `<details class="menu-cuenta">` con «Mi perfil», «Ajustes» y el botón «Cerrar sesión» (`data-cerrar-sesion`). Se cierra al hacer clic fuera, al pulsar Escape (el foco vuelve al resumen) y al elegir una opción.

`js/shared/cabecera.js` engancha esos comportamientos. «Cerrar sesión» llama a `POST /api/auth/logout` y va a `/acceso/iniciar-sesion.html`; mientras espera, el botón se desactiva y muestra «Cerrando sesión…», y si falla se restaura y aparece un aviso `role="alert"` bajo la cabecera.

Antes de la cabecera, cada una de estas páginas (y la landing) lleva el enlace «Saltar al contenido», que solo se ve al recibir el foco del teclado.

## Cada página

### `index.html`: landing

Página pública y estática: no tiene JavaScript, no comprueba la sesión y no llama a la API. Su cabecera solo ofrece «Iniciar sesión» y «Crear cuenta». Presenta la frase «Comparte y descubre planes por tu ciudad» con una ilustración, las categorías, tres bloques de valor, los tres pasos de uso y una banda de cierre con los dos accesos. Es la página que sirve `/`.

Pruebas: `landing.test.js`.

### `/acceso/iniciar-sesion.html`: iniciar sesión

Formulario de email y contraseña. Si el login es correcto va a `/cuenta/bienvenida.html`; si no, muestra el mensaje del servidor en `#error-login`. Enlaza a la recuperación de la contraseña y ofrece «Crear cuenta».

Pruebas: `iniciar-sesion.test.js`.

### `/acceso/registro.html`: crear una cuenta

* Pide nombre de usuario, email y contraseña. Mientras se escribe la contraseña, `mostrarRequisitosPassword` marca cada requisito cumplido en `#requisitos-password`, también el de no contener el nombre.
* El CAPTCHA de Cloudflare Turnstile se dibuja en `#captcha` cuando su script llama a `window.iniciarCaptcha`, con la clave pública de `GET /api/auth/captcha`.
* Con el registro correcto, la sesión ya está abierta y va a `/cuenta/bienvenida.html`.

Pruebas: `registro.test.js`.

### `/acceso/recuperar.html`: pedir el enlace

Pide el email y siempre muestra el mismo mensaje de éxito, exista la cuenta o no: la página no lo sabe, y así nadie puede usarla para averiguarlo.

Pruebas: `recuperacion.test.js`.

### `/acceso/restablecer.html`: elegir una contraseña nueva

* Lee el `token` de la URL. Sin token muestra el aviso y oculta el formulario.
* Pide la contraseña dos veces y comprueba en la pantalla que coinciden antes de enviarla. El requisito «sin el nombre de usuario» lo comprueba el servidor, porque la página no sabe de quién es el enlace.
* Al terminar, muestra un enlace a `/acceso/iniciar-sesion.html`.

Pruebas: `recuperacion.test.js`.

### `/cuenta/bienvenida.html`: mis experiencias

* Saluda al usuario y muestra sus experiencias en una rejilla, de 10 en 10, con «Cargar más» (`#mas-experiencias`). Mientras llegan los datos se ve «Cargando…» (`#cargando`) y, si no hay ninguna experiencia, `#sin-experiencias` dice «Todavía no has publicado experiencias.» junto a la tarjeta «+».
* La primera tarjeta, «+», abre el `<dialog>` `#dialogo-experiencia` para crear una experiencia. «Editar» abre el mismo diálogo relleno con sus datos.
* Debajo del selector de visibilidad, `#descripcion-visibilidad` explica la opción elegida.
* Al guardar, la tarjeta nueva aparece la primera y la editada se sustituye en su sitio, sin recargar la página.
* El desplegable de ciudades se llena con `GET /api/ciudades`.

Pruebas: `bienvenida.test.js` y `estados.test.js`.

### `/cuenta/perfil.html`: mi perfil

* **Cabecera:** foto, nombre y contadores de experiencias, amigos y seguidores. Hasta que llegan los datos se ve «Cargando…» (`#cargando`).
* **Pestañas** (`shared/pestanas.js`): *Experiencias* (con `mostrarExperienciasDe`, incluidas las privadas), *Amigos* y *Seguidores* (listas de 20 en 20 con «Cargar más»; cada nombre lleva a su perfil).

Pruebas: `perfil.relaciones.test.js`, `perfil.cabecera.test.js`, `estados.test.js` y `shared/experiencias.test.js`.

### `/cuenta/ajustes.html`: ajustes

Tres pestañas (`shared/pestanas.js`):

* **Perfil:** la foto, que se sube nada más elegirla, y el nombre de usuario y la ciudad editables; el email es solo de lectura.
* **Contraseña:** actual, nueva y repetida, con la lista de requisitos.
* **Sesión:** «Cerrar sesión».

Pruebas: `ajustes.test.js`, `ajustes.foto.test.js`, `ajustes.password.test.js` y `estados.test.js`.

### `/social/solicitudes.html`: solicitudes de amistad

Las solicitudes recibidas, cada una con «Aceptar» y «Rechazar». Si no hay ninguna se ve «No tienes solicitudes pendientes.».

Pruebas: `solicitudes.test.js` y `estados.test.js`.

### `/social/personas.html`: buscar

Un buscador con dos pestañas, «Personas» y «Experiencias» (`shared/pestanas.js`). Si la URL trae `?q=`, rellena el campo y busca al cargarse.

* **Personas:** busca por parte del nombre (como mucho 20 resultados) con `GET /api/usuarios?texto=`. Cada resultado es un enlace a su perfil. Antes de buscar, `#ayuda-busqueda` explica qué escribir; mientras se busca se ve «Cargando…» (`#cargando`) y el botón pasa a «Buscando…».
* **Experiencias:** `buscarExperiencias` devuelve siempre una lista vacía, así que se ve «sin experiencias»; la búsqueda real llegará con CS-24.

Pruebas: `personas.test.js`, `pestanas.test.js` y `estados.test.js`.

### `/social/usuario.html?nombre=`: perfil de otro usuario

* Foto, nombre, ciudad y contadores de amigos y seguidores. Hasta que llega el perfil se ve «Cargando…» (`#cargando`) y no los datos de relleno. Si el usuario no existe, solo se muestra `#no-encontrado`; si es el propio usuario, va a `/cuenta/perfil.html`.
* En `#botones-amistad` aparecen los botones que corresponden a la relación (ver [E2](flujos.md#e2-la-relación-vista-desde-el-perfil-de-otro-usuario)). «Eliminar amigo» pide confirmación.
* `#boton-seguir` alterna entre «Seguir» y «Dejar de seguir».
* Tras cada acción se vuelve a pedir el perfil, para que los contadores y botones sean los reales, y también «Sus experiencias», porque al cambiar la amistad cambian las que se pueden ver.

Pruebas: `usuario.test.js`, `estados.test.js`, `usuario.cabecera.test.js` y `shared/experiencias.test.js`.

### `/experiencias/experiencia.html?id=`: una experiencia

* Título, autor (enlace a su perfil), ciudad y descripción.
* **Valorar:** el formulario solo aparece si no soy el autor y se rellena con mi valoración si ya la había hecho. La puntuación es obligatoria (1–5) y `#contador-caracteres` cuenta hasta 1000. El botón «Guardar» pasa a «Actualizar valoración» cuando ya existe una.
* **Valoraciones de amigos y seguidores** (CS-48) y **todas las valoraciones** (CS-63): dos listas de 10 en 10 con «Cargar más».
* **«Útil» y «Reportar»:** solo funcionan en la pantalla y no guardan nada, hasta que se implementen CS-02 y CS-04. «Reportar» abre el `<dialog>` `#dialogo-reporte`.
* Si cualquier petición responde 404, se borra lo que se mostraba y queda solo «Contenido no disponible».

Pruebas: `experiencia.test.js`, `experiencia.formulario.test.js`.

## Módulos compartidos (`js/shared/`)

| Archivo | Ofrece | Lo usan |
|---|---|---|
| `api.js` | `api(ruta, opciones)`: llama a `/api` + `ruta` con `fetch` y la cookie de sesión. Envía `Content-Type: application/json` salvo con `FormData`, en cuyo caso la cabecera la pone el navegador. Devuelve el JSON (o `null` si no hay cuerpo); si falla, lanza un `Error` con el mensaje del servidor y `error.status`. | Todas las páginas |
| `pantalla.js` | `mostrarMensaje(caja, texto)` y `ocultarMensaje(caja)`; `mostrarCargando()` y `ocultarCargando()`, que muestran y ocultan el texto `#cargando` de la página; `irAlLogin()`; `crearEnlacePerfil(enlace, usuario, miUsuarioId)`; `crearBloqueCategoria(tipo)`, que devuelve el bloque de color con el icono de la categoría deducida de `tipo` (texto libre; «rincones» si no encaja ninguna); `listaConCargarMas({ lista, vacio, botonMas, pedir, crear, alFallar })`, que devuelve `{ cargar, reiniciar }` y no repite un elemento que ya está en la lista. La lista está vacía cuando no tiene ningún hijo con `data-id-elemento`, de modo que la tarjeta «+» de la bienvenida no cuenta. | Las páginas con sesión y `experiencias.js` |
| `experiencias.js` | `mostrarExperienciasDe(nombreUsuario)` y `recargarExperiencias()`: la lista «Cargar más» de experiencias de un autor. La página debe tener `#lista-experiencias`, `#sin-experiencias`, `#mas-experiencias` y `#error-experiencias`. | `perfil.js`, `usuario.js` |
| `cabecera.js` | Comportamiento de la cabecera común (ver «Cabecera común»). No exporta nada. | Las siete páginas con sesión |
| `pestanas.js` | `window.activarPestanas(lista)`: pestañas accesibles (`role="tablist"`) que se manejan con ratón y teclado. | `personas.js`, `experiencia.js` |
| `password.js` | `mostrarRequisitosPassword(campo, lista, obtenerNombre)`: marca los requisitos cumplidos mientras se escribe. Son los mismos que comprueba el backend, que es quien decide. | `registro.js`, `ajustes.js`, `restablecer.js` |

Los módulos se cargan con `<script>` normales (no son módulos ES) y exponen sus funciones con `window.nombre = nombre`, para que se vea qué ofrece cada archivo y las pruebas puedan cargarlos.

## Reglas del frontend

* **Sin scripts en línea.** La política CSP de Helmet los bloquea: nada de `onclick=` ni `<script>` con código dentro del HTML. Los eventos se asignan con `addEventListener` en el JS de la página.
* **Avisos de error con `role="alert"`.** Todo elemento cuyo `id` empieza por `error-` lleva `role="alert"` para que se anuncie a los lectores de pantalla; `estados.test.js` lo comprueba en las páginas con avisos de error.
* **Texto de usuarios con `textContent`.** Nunca con `innerHTML`, para que un nombre o comentario con HTML se vea como texto y no se ejecute. `innerHTML` solo se usa para estructuras fijas sin datos, como el esqueleto de una tarjeta.
* **Ventanas con `<dialog>`.** La CSP no deja cargar el JavaScript de Bootstrap desde el CDN, así que los diálogos usan el elemento nativo `<dialog>` con `showModal()` y `close()`.
* **La seguridad está en el backend.** Ocultar un botón (por ejemplo, el formulario de valorar en una experiencia propia) solo mejora la interfaz: el servidor comprueba siempre los permisos.
* **Llamadas con `api`.** Ninguna página usa `fetch` directamente.
* **Colores en variables.** Los colores solo se definen como `--color-*` en `css/styles.css`; los demás CSS las usan.
* **Escritorio.** El diseño se comprueba en escritorio; el móvil está aparcado.

## Pruebas del frontend

Las pruebas están en `backend/tests/frontend/`, agrupadas por página y tema (`ajustes.foto.test.js`, `ajustes.password.test.js`...), y en `backend/tests/frontend/shared/`. `cabecera.test.js` y `enlaces.test.js` comprueban la cabecera común y los enlaces entre páginas. Usan Jest con jsdom: cargan el HTML real de la página, simulan `fetch` y comprueban lo que ve el usuario. El ayudante `tests/helpers/pantalla.js` carga los scripts en orden, igual que el navegador. Se ejecutan con el resto: `npm test` desde `backend/`.

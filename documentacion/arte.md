# Arte de PlanB: cómo se ve

> Colores, tipografía, bordes, componentes e interacciones, para que todas las pantallas sean consistentes. La estructura de cada pantalla está en [diseno.md](diseno.md). Una vista de conjunto está en [diseno/guia-estilo.svg](diseno/guia-estilo.svg).
> Estado: **aplicada** en el CSS y las pantallas existentes (dirección «Verbena», ver [la decisión](decisiones/2026-10-27-identidad-verbena.md) y [la de su implementación](decisiones/2026-10-27-implementacion-verbena.md)). Faltan las pantallas del sitemap que aún no existen. Solo escritorio (1024 px o más).

## Cómo se usa este documento

- Aquí se recoge **qué se decide**, no cómo se implementa. Lo aprobado se traduce a variables CSS en `frontend/css/tokens.css`.
- Si una pantalla necesita algo que no figura aquí, se propone aquí primero y después se usa.
- Todos los contrastes están **calculados** con la fórmula de luminancia relativa de WCAG, no estimados a ojo.
- En el CSS no hay colores literales fuera de la declaración de las variables `--color-*`.

## Identidad

PlanB es una red social para compartir y descubrir planes por una ciudad. La identidad «Verbena» es **blanca, viva y cercana**:

- **Blanco como base** y mucho espacio; el protagonista es el contenido de los usuarios.
- **Dos acentos con intención:** naranja para la acción y la señal, ciruela para el texto y el contraste. Melocotón y crema solo de apoyo.
- Sin degradados. Borde fino en todo; sombra muy suave solo en elementos flotantes (menú, diálogo).
- **Un solo estilo de borde redondeado** en toda la aplicación.
- **Pensada para un público joven y universitario:** acciones en pocos pasos, lenguaje cercano (tú) y patrones conocidos de otras redes sociales.

### Logo

Un **pin de mapa** naranja con punto ciruela y el nombre «plan**B**» en ciruela, con la B en naranja. Ficheros: [logo.svg](../frontend/img/logo.svg) (completo, 132 × 32) y [logo-pin.svg](../frontend/img/logo-pin.svg) (solo el pin, para icono de pestaña y espacios pequeños). Sobre fondo blanco o crema; alto mínimo 24 px; margen alrededor igual a la mitad del alto.

## Reglas de consistencia

- Mismo radio de borde en botones, campos y tarjetas (ver «Bordes»).
- **Como máximo un botón principal por pantalla y estado**; el resto son secundarios o de texto.
- Los mismos avisos, con los mismos colores y textos, en todas las pantallas.
- Contraste mínimo **AA**: 4,5:1 en texto y botones, y 3:1 en bordes de campos, iconos, anillo de foco y otros componentes de interfaz.
- **El color nunca es la única señal.** Lo activo se marca también con una línea y negrita; un error, con texto; lo desactivado, con texto.
- Todo se comprueba en 1024, 1280 y 1440 px, sin desplazamiento horizontal.
- Zonas pulsables de al menos 44 px de alto.

## Paleta

Los nombres son los de las variables CSS propuestas.

| Rol | Variable | Valor | Para qué se usa |
|---|---|---|---|
| Fondo | `--color-fondo` | `#FFFFFF` | Página y tarjetas |
| Superficie | `--color-superficie` | `#F6F3F9` | Bloques, filas alternas, campos desactivados |
| Texto / ciruela | `--color-texto` | `#2A1E3F` | Todo el texto normal, banda ciruela |
| Texto suave | `--color-texto-suave` | `#5E5470` | Datos secundarios (ciudad, fechas, ayudas) |
| **Principal (naranja)** | `--color-primario` | `#FF5A36` | Botón principal, línea de sección activa, pin del logo |
| Principal al pasar | `--color-primario-hover` | `#FF7A5C` | Botón principal con el ratón encima |
| Acento para texto | `--color-acento` | `#C2410C` | Enlaces, texto e iconos naranjas sobre fondo claro |
| Acento al pasar | `--color-acento-hover` | `#9A3412` | Enlaces con el ratón encima, texto de etiquetas |
| Melocotón | `--color-melocoton` | `#FFC7B3` | Seleccionado, pulsado, bloque de categoría |
| Crema | `--color-crema` | `#FFF4E6` | Bandas y fondos de apoyo |
| Peligro | `--color-peligro` | `#B91C1C` | Eliminar, rechazar, errores |
| Éxito | `--color-exito` | `#15803D` | Confirmaciones, «Aceptar» |
| Foco | `--color-foco` | `#1D4ED8` | Anillo de foco del teclado |
| Borde de campo | `--color-borde-campo` | `#7A6F8C` | Borde de los campos de formulario |
| Borde suave | `--color-borde-suave` | `#E8E3EE` | Separadores y bordes de tarjetas (solo decorativo) |

**Fondos de avisos:** error `#FEE2E2` con texto `#7F1D1D`; éxito `#DCFCE7` con texto `#14532D`; aviso `#FEF3C7` con texto `#78350F`; información `#E0F2FE` con texto `#0C4A6E`.

**El botón principal lleva texto ciruela**, no blanco: el blanco sobre `#FF5A36` da 3,10:1 y no cumple. Pulsado: fondo ciruela y texto blanco.

### Contraste calculado

Reproducible con un script de luminancia WCAG (fórmula en la sección 1.4.3 de WCAG 2.1).

| Combinación | Ratio | Mínimo | Resultado |
|---|---|---|---|
| Texto sobre fondo | 15,49 | 4,5 | Cumple |
| Texto sobre superficie | 14,09 | 4,5 | Cumple |
| Texto sobre crema | 14,26 | 4,5 | Cumple |
| Texto sobre melocotón | 10,38 | 4,5 | Cumple |
| Texto suave sobre fondo | 7,05 | 4,5 | Cumple |
| Texto suave sobre superficie | 6,42 | 4,5 | Cumple |
| Texto suave sobre crema | 6,49 | 4,5 | Cumple |
| **Texto ciruela sobre principal (botón)** | **4,99** | 4,5 | Cumple |
| Texto ciruela sobre principal al pasar | 6,04 | 4,5 | Cumple |
| Blanco sobre ciruela (botón pulsado, banda) | 15,49 | 4,5 | Cumple |
| Principal sobre ciruela (acento en la banda) | 4,99 | 4,5 | Cumple |
| Blanco sobre principal | 3,10 | 4,5 | **No cumple**: por eso el botón lleva texto ciruela |
| Acento sobre fondo (enlace) | 5,18 | 4,5 | Cumple |
| Acento sobre superficie | 4,71 | 4,5 | Cumple |
| Acento al pasar sobre melocotón | 4,90 | 4,5 | Cumple |
| Acento al pasar sobre crema | 6,73 | 4,5 | Cumple |
| Blanco sobre peligro (botón) | 6,47 | 4,5 | Cumple |
| Blanco sobre éxito (botón) | 5,02 | 4,5 | Cumple |
| Avisos (error / éxito / aviso / información) | 8,20 / 8,30 / 8,15 / 8,24 | 4,5 | Cumple |
| Borde de campo sobre fondo | 4,69 | 3 | Cumple |
| Borde de campo sobre superficie | 4,26 | 3 | Cumple |
| Anillo de foco sobre fondo | 6,70 | 3 | Cumple |
| Anillo de foco sobre superficie | 6,10 | 3 | Cumple |
| Principal (línea de sección activa) sobre fondo | 3,10 | 3 | Cumple |

El borde suave (`#E8E3EE`, 1,26:1) es solo decorativo: nada depende de verlo.

## Tipografía

- **Fuente del sistema:** `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. No hay que descargar ninguna fuente.
- Cuerpo de **16 px** con interlineado 1,5. Nunca menos de 14 px.
- Pesos: normal (400) y negrita (700).

| Elemento | Tamaño | Peso |
|---|---|---|
| Título de página (`h1`) | 28 px | 700 |
| Título de sección (`h2`) | 22 px | 700 |
| Subtítulo (`h3`) | 18 px | 700 |
| Texto | 16 px | 400 |
| Texto pequeño (ayudas, datos) | 14 px | 400 |

- Columnas de texto estrechas: unos 65 caracteres como máximo por línea.

## Espaciado

Escala de múltiplos de 4 px: **4, 8, 12, 16, 24, 32 y 48**. Entre bloques de una pantalla, 24 px; dentro de un bloque, 8 o 12 px. Contenido centrado de 960 px como máximo, con 24 px de margen lateral; la landing y las pantallas divididas ocupan todo el ancho.

## Bordes y sombras

| Elemento | Radio | Borde |
|---|---|---|
| Botones y campos | 8 px | 1 px, `--color-borde-campo` |
| Buscador de la cabecera | 999 px (píldora) | 1 px, `--color-borde-campo` |
| Tarjetas y diálogos | 12 px | 1 px, `--color-borde-suave` |
| Etiquetas y chips | 999 px (píldora) | según tipo |
| Foto de perfil | círculo | ninguno |

**Sin sombras**, salvo una muy suave (`0 4px 16px` ciruela al 12 %) en elementos flotantes: menú de cuenta y diálogos. *(Pendiente de confirmar.)*

## Iconos

Iconos de línea en **SVG en línea** (24 px, trazo de 2 px, `currentColor`, `aria-hidden`), siempre acompañados de su texto o de `aria-label`. Sin biblioteca externa: ver la [decisión](decisiones/2026-10-27-implementacion-verbena.md). Iconos de categoría y de navegación: ver [diseno.md](diseno.md).

## Componentes

Todo elemento pulsable mide **44 px de alto como mínimo**. Todos los estados usan solo variables `--color-*`.

### Estados comunes de botones y enlaces

| Estado | Botón principal | Botón secundario | Botón de peligro |
|---|---|---|---|
| Reposo | Fondo `--color-primario`, texto `--color-texto`, negrita | Fondo `--color-fondo`, borde `--color-texto`, texto `--color-texto` | Fondo `--color-fondo`, borde y texto `--color-peligro` |
| Ratón encima | Fondo `--color-primario-hover` | Fondo `--color-crema` | Fondo `--color-fondo`, borde 2 px |
| Pulsado | Fondo `--color-texto`, texto `--color-fondo` | Fondo `--color-melocoton` | Fondo `--color-peligro`, texto `--color-fondo` |
| Foco | Anillo de foco | Ídem | Ídem |
| Desactivado | Fondo `--color-superficie`, texto `--color-texto-suave`, borde `--color-borde-suave` | Ídem | Ídem |
| Espera | `[aria-busy="true"]`: ver «Botón con estado de espera» | Ídem | Ídem |

Un enlace de texto es `--color-acento` subrayado; con el ratón, `--color-acento-hover`; con foco, el anillo.

| Componente | Decisión |
|---|---|
| **Botón principal** | Fondo naranja, texto ciruela en negrita, 44 px de alto como mínimo. **Uno por pantalla** |
| **Botón secundario** | Fondo blanco, borde y texto ciruela. Mismo tamaño |
| **Botón de peligro** | Borde y texto de peligro; relleno solo en la confirmación final de una acción destructiva |
| **Botón desactivado** | Fondo superficie y texto suave; además, un texto que explique el estado («Solicitud enviada») |
| **Campos de formulario** | 44 px de alto, borde `--color-borde-campo`; etiqueta siempre visible encima. Ratón encima: borde `--color-texto`. Foco: anillo. Desactivado: fondo `--color-superficie` y texto suave. En error: borde de peligro y mensaje debajo |
| **Avisos** | Fondo y texto de su color, radio 8 px, siempre con texto. Los de error llevan `role="alert"` |
| **Tarjeta** | Fondo blanco, borde suave, radio 12 px. Ver «Tarjeta con bloque de color» |
| **Chip de categoría** | Píldora de 32 px de alto con icono y texto; en reposo borde `--color-borde-campo`; seleccionado, fondo `--color-melocoton` y negrita. Es un botón o un enlace |
| **Lista con «Cargar más»** | Filas separadas por borde suave; el botón de «Cargar más» es secundario, centrado y se desactiva mientras carga |
| **Foto de perfil** | Círculo; sin foto, una imagen por defecto neutra de la misma forma |
| **Diálogo** | Elemento nativo `<dialog>`, radio 12 px, un solo botón principal y uno secundario («Cancelar») |
| **Anillo de foco** | Contorno de 2 px en `--color-foco`, separado 2 px del elemento. Nunca se quita |

### Botón con estado de espera

Para toda acción con espera (buscar, entrar, guardar, cerrar sesión).

- Mientras espera: `[aria-busy="true"]` y `disabled`; el texto cambia a su gerundio («Buscando…», «Entrando…», «Guardando…», «Cerrando sesión…», «Creando cuenta…»).
- Aspecto: el del botón desactivado de su tipo, sin cambiar de tamaño: conserva su ancho para que la fila no salte.
- Cursor de espera (`progress`). Sin ruedas giratorias ni animaciones.
- Al terminar recupera su texto y `disabled` se quita; si falla, aparece el aviso con `role="alert"`.

### Cabecera con sesión

- Barra de **64 px** de alto y todo el ancho, fondo `--color-fondo` con borde inferior de 1 px `--color-borde-suave`. Contenido alineado con el cuerpo (960 px como máximo) salvo que la pantalla sea más ancha.
- Izquierda: **logo** completo (enlace a la pantalla de inicio).
- Centro: **buscador en píldora**, 44 px de alto y 400 px de ancho máximo, fondo `--color-superficie`, borde `--color-borde-campo`, texto de ayuda «Buscar personas y planes» en `--color-texto-suave`, con botón «Buscar» (`type=submit`, texto visible, 36 px de alto) a la derecha.
- Derecha: botón principal «Crear plan» (el único de la cabecera), campana de notificaciones y **menú de cuenta**.
- Debajo, la **barra de pestañas de sección** (ver abajo).
- Enlace «Saltar al contenido» antes de la cabecera, visible solo con foco. `nav` con `aria-label="Principal"`.

| Estado | Enlaces y logo | Buscador | Menú de cuenta |
|---|---|---|---|
| Reposo | Texto `--color-texto` | Fondo `--color-superficie` | Avatar de 32 px, «Cuenta» y flecha |
| Ratón encima | Subrayado | Borde `--color-texto` | Subrayado del texto |
| Pulsado | Negrita | Sin cambio | Panel abierto |
| Foco | Anillo | Anillo | Ídem |
| Desactivado / Espera | No aplica | No aplica | «Cerrando sesión…» dentro del panel |

### Barra de pestañas de sección

- Fila bajo la cabecera con las secciones principales: Inicio, Explorar, Mis planes, Amigos (lista definitiva en [sitemap.mmd](sitemap.mmd)).
- Cada pestaña: 44 px de alto, icono de 20 px y texto. La activa: texto `--color-texto` en negrita, línea de 3 px `--color-primario` debajo y `aria-current="page"`; las demás, texto `--color-texto-suave`.
- Ratón encima: fondo `--color-superficie`. Pulsada: fondo `--color-melocoton`. Foco: anillo.

### Menú de cuenta

- Es un `<details>`; el `<summary>` mide 44 px de alto y muestra avatar, «Cuenta» y una flecha.
- Panel: fondo `--color-fondo`, borde `--color-borde-suave`, radio 12 px, sombra suave, 220 px de ancho, alineado a la derecha, con opciones de 44 px: «Mi perfil», «Guardados», «Ajustes», «Ayuda» y «Cerrar sesión» (botón de texto).
- Opción con ratón encima: fondo `--color-superficie`. Con foco: anillo. «Cerrar sesión» en espera: «Cerrando sesión…», desactivado y `[aria-busy="true"]`.

### Cabecera sin sesión

- Barra de 64 px, fondo blanco y borde inferior, con el **logo** a la izquierda y a la derecha «Iniciar sesión» (secundario) y «Crear cuenta» (principal).
- Las pantallas divididas de acceso no llevan barra de cabecera: el logo va dentro de la columna izquierda.
- Las pantallas de la aplicación no llevan pie; solo las páginas públicas (landing, ayuda, términos), con enlaces legales.

### Pantalla dividida de acceso

Para `iniciar-sesion`, `registro`, `recuperar` y `restablecer`.

- Dos columnas iguales que ocupan toda la ventana, con altura mínima de la ventana.
- Izquierda: fondo `--color-crema` con la escena animada de la capa expresiva (ver más abajo), logo y **tres frases** de 24 px en negrita sobre una tarjeta blanca con borde, con 48 px de relleno.
- Derecha: fondo `--color-fondo`, formulario de 400 px de ancho máximo centrado; título `h1`, campos, botón principal a todo el ancho y debajo los enlaces secundarios.
- El CAPTCHA (iframe de unos 300 px) cabe en los 400 px del formulario.

### Pestañas de contenido

- Fila de botones con `role="tab"` (`tablist`), sobre un borde inferior de 1 px `--color-borde-suave`. Cada una mide **44 px de alto** y 24 px de relleno lateral.
- La activa lleva `aria-selected="true"`, texto `--color-texto` en negrita y línea de 3 px `--color-primario`; las demás, texto `--color-texto-suave`.
- Ratón encima: fondo `--color-superficie`. Pulsada: fondo `--color-melocoton`. Foco: anillo. Desactivada y espera: no aplican.

### Fila de resultado

- Fila de **64 px** de alto como mínimo, separada de la siguiente por un borde `--color-borde-suave`.
- Foto de 40 px (círculo), nombre en negrita y ciudad en 14 px `--color-texto-suave`. Toda la fila es un enlace al perfil.
- Reposo: fondo `--color-fondo`. Ratón encima: `--color-superficie`. Pulsada: `--color-melocoton`. Foco: anillo.

### Tarjeta con bloque de color

- Rejilla de **4 columnas** con 16 px de hueco, dentro de los 960 px del contenido.
- Cada tarjeta: arriba un **bloque de color de 96 px** (sin foto) con el icono de su categoría centrado, en `--color-melocoton` o `--color-crema` según la categoría; debajo título en negrita, ciudad en `--color-texto-suave` y la etiqueta de visibilidad. Alto de tarjeta uniforme; toda la tarjeta es un enlace.
- Tarjeta «+» (Nueva experiencia): mismo tamaño, borde discontinuo `--color-borde-suave`, signo «+» y texto en `--color-acento`.
- Reposo: fondo blanco. Ratón encima: borde `--color-borde-campo`. Pulsada: `--color-superficie`. Foco: anillo. En espera: «Cargando…».

**Etiqueta de visibilidad:** píldora de 24 px de alto, texto de 14 px, relleno lateral de 12 px; no es pulsable. Siempre con texto.

| Clase | Texto | Colores |
|---|---|---|
| `.etiqueta-publica` | Pública | Texto `--color-texto-suave`, borde 1 px `--color-borde-campo`, fondo `--color-fondo` |
| `.etiqueta-amigos` | Amigos | Texto `--color-acento-hover`, fondo `--color-crema` |
| `.etiqueta-privada` | Privada | Texto `--color-texto-suave`, fondo `--color-superficie` |

### Banda ciruela

- Ancho completo, fondo `--color-texto`, texto `--color-fondo`, acentos en `--color-primario`, 48 px de relleno vertical. Para la portada de la landing y avisos de peso (p. ej. solicitudes pendientes). Un botón principal dentro mantiene su naranja.

### Estado vacío

- Centrado en el contenido: icono de 48 px en `--color-acento`, frase corta en negrita, una línea de ayuda en `--color-texto-suave` y, si hay una acción útil, **un botón** (principal solo si es el único de la pantalla). Ej.: «Aún no tienes planes» → «Crear plan».

### Fila de actividad

- Fila de 64 px (notificaciones y actividad): icono de tipo en un círculo `--color-crema` de 40 px, texto de una o dos líneas con el nombre en negrita, fecha en 14 px `--color-texto-suave` a la derecha. Sin leer: punto de 8 px `--color-primario` además de la negrita. Ratón encima: `--color-superficie`.

### Cabecera de perfil con contadores

- **Perfil propio:** foto de 96 px a la izquierda; a su derecha el nombre (`h1`) y tres contadores (experiencias, amigos, seguidores): número en negrita de 22 px y rótulo en 14 px `--color-texto-suave`. Los contadores son texto, no enlaces.
- **Perfil de otra persona:** misma cabecera, con el botón de amistad y «Seguir» debajo de los contadores.
- **Banda de solicitudes** (solo perfil propio): fondo `--color-crema`, con «Aceptar» y «Rechazar» como botones secundarios; solo aparece si hay solicitudes.
- «Ajustes» es un `<details>` plegado con el aspecto de un botón secundario.
- Estados: cargando, error con aviso y, en otra persona, «Usuario no encontrado».

### Marco de captura (landing)

- Recuadro 16:10, fondo `--color-superficie`, borde 1 px discontinuo `--color-borde-suave`, radio 12 px, rótulo «Captura de PlanB» en `--color-texto-suave`, `role="img"` y `aria-label="Captura de PlanB (próximamente)"`. No es interactivo. Sin capturas inventadas.

## Interacciones

Reglas normativas, iguales en todas las pantallas. Nada se anima más que esto, salvo la capa decorativa de la landing (más abajo): sin carruseles, sin esqueletos de carga.

| Interacción | Regla |
|---|---|
| **Acción con espera** | Al enviarse, el botón pasa a su texto en gerundio («Buscando…», «Cerrando sesión…», «Guardando…», «Entrando…») y queda desactivado con `[aria-busy="true"]`; al terminar recupera su texto y se activa. Si falla, aviso con `role="alert"` |
| **Buscar** | Al enviar, desaparece el texto de ayuda («Escribe parte de un nombre.» o «Escribe para buscar experiencias.»), se vacían los resultados anteriores, aparece «Cargando…» y, al llegar la respuesta, los resultados entran con un **fundido de 150 ms**. Sin resultados: «No se han encontrado personas.» (o el texto de «Experiencias»). El campo conserva lo escrito |
| **Pestañas** | `role="tab"`, `aria-selected` y paneles `role="tabpanel"`. Al cambiar, la activa se marca con línea gruesa y negrita y el panel anterior se oculta. Se mueven con las flechas izquierda y derecha (de la última a la primera y al revés). El texto de ayuda de cada panel es independiente |
| **Menú de cuenta** | Se abre con un **fundido de 150 ms**; se cierra al pulsar fuera, con Escape o al elegir una opción, y el foco vuelve al botón |
| **Botones y enlaces** | Cambio de ratón, pulsado y foco con una **transición de 120 ms** |
| **Movimiento reducido** | Con `prefers-reduced-motion: reduce` se desactivan todas las transiciones y animaciones: los cambios son instantáneos |

Duraciones: **120 ms** (botones y enlaces) y **150 ms** (fundidos de resultados y del menú). No hay otras.

### Capa expresiva (landing y pantallas de acceso)

Zonas donde no se lee ni se pulsa nada crítico: ahí la marca se sigue con más libertad. Se permiten **formas orgánicas, tonos extra** (`--expr-lila`, `--expr-menta`, `--expr-sol`, `--expr-cielo`, solo para formas, nunca para texto), pegatinas, garabatos y dibujos de producto en SVG. Siguen valiendo: una sola tipografía, contraste AA del texto y zonas pulsables de 44 px.

- **Pantallas de acceso:** la columna de marca lleva la escena animada `img/escena-acceso.svg` (manchas, ruta de puntos, pines con ondas, tarjetas y brillos) como fondo de `.pantalla-dividida-marca`. Las tres frases van en una tarjeta blanca con borde, para que se lean sobre la escena.
- **Landing:** cada paso de «Cómo funciona» lleva su dibujo (`svg.paso-dibujo`), con un camino de puntos entre ellos; pegatinas alrededor de la ilustración; chips y bloques con un color y una forma cada uno; onda hacia la banda de cierre.

### Movimiento decorativo de la landing

Solo en `index.html`, en CSS y sin scripts. Nunca se anima lo que se lee o se pulsa: el movimiento va en capas `aria-hidden` detrás del contenido, con colores suaves (crema, melocotón) y sin degradados ni sombras.

- **Ruta de puntos** fija al viewport que se dibuja con el scroll, con tres paradas que se encienden (`animation-timeline: scroll()`).
- **Manchas orgánicas** que flotan tras la portada y **pines** que flotan en la banda de cierre.
- **Bloques y pasos** que entran con un fundido al verse (`animation-timeline: view()`); los chips de categoría se inclinan al pasar el ratón.
- Sin soporte de `animation-timeline` o con `prefers-reduced-motion`, todo queda estático y visible.

## Tono de los textos

- Castellano, frases cortas y primera letra en mayúscula, sin punto final en botones.
- Los avisos de error dicen qué pasó y qué hacer. Los textos de ayuda terminan en punto.
- Verbo primero en los botones: «Guardar cambios», «Añadir amigo», «Buscar».
- «Tú», no «usted»: «Tus experiencias», «¿Has olvidado tu contraseña?».
- Acciones con espera en gerundio: «Buscando…», «Guardando…».


## Estado de la aplicación

Aplicado: paleta y botones, cabecera blanca con logo y buscador en píldora, pestañas subrayadas, landing con ilustración y banda ciruela, tarjetas con bloque de color por categoría (`crearBloqueCategoria` en `js/shared/pantalla.js`) y estados vacíos con ilustración animada (`.estado-vacio`: mancha de color y un objeto que se mueve; CSS embebido en el SVG).

Pendiente: chips de categoría y filas de actividad en las pantallas con sesión, «Crear plan» y notificaciones en la cabecera, y las pantallas nuevas del sitemap.

## Aplicación pantalla por pantalla

Ninguna pantalla usa todavía esta versión de la guía; la anterior se aplicó en CS-66.

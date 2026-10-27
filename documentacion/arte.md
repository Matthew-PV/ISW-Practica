# Arte de PlanB: cómo se ve

> Colores, tipografía, bordes, componentes e interacciones, para que todas las pantallas sean consistentes. La estructura de cada pantalla está en [diseno.md](diseno.md). Una vista de conjunto, con los colores y los componentes dibujados, está en [diseno/guia-estilo.svg](diseno/guia-estilo.svg).
> Estado: **propuesta para aprobar** (objetivo 3 del libro de historias). Cuando el equipo la apruebe, se aplica a todas las pantallas a la vez en la historia de implementación. Solo escritorio (1024 px o más).

## Cómo se usa este documento

- Aquí se recoge **qué se decide**, no cómo se implementa. Lo aprobado se traduce a variables CSS en `frontend/css/styles.css`.
- Si una pantalla necesita algo que no figura aquí, se propone aquí primero y después se usa.
- Todos los contrastes están **calculados** con la fórmula de luminancia relativa de WCAG, no estimados a ojo.
- En el CSS no hay colores literales fuera de la declaración de las variables `--color-*`.

## Identidad

PlanB es una red social para compartir y descubrir planes por una ciudad. La identidad es **clara, cercana y tranquila**:

- Fondo claro y mucho espacio en blanco, para que el protagonista sea el contenido de los usuarios.
- **Un solo color principal, un verde azulado**, que recuerda a una ciudad, al agua y a los mapas, y se usa solo en lo importante.
- Grises neutros para todo lo demás. Sin degradados ni sombras pesadas: la jerarquía se consigue con el tamaño, el peso y el espacio.
- **Un solo estilo de borde redondeado** en toda la aplicación.
- **Pensada para un público joven y universitario:** acciones en pocos pasos, lenguaje cercano (tú) y patrones que ya conoce de otras redes sociales, como la cabecera con buscador y la cabecera de perfil con contadores.

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
| Superficie | `--color-superficie` | `#F3F4F6` | Fondos de bloques, filas alternas, campos desactivados |
| Texto | `--color-texto` | `#1F2937` | Todo el texto normal |
| Texto suave | `--color-texto-suave` | `#4B5563` | Datos secundarios (ciudad, fechas, ayudas) |
| **Principal** | `--color-primario` | `#0F766E` | Botón principal, enlaces, sección activa |
| Principal al pasar | `--color-primario-hover` | `#115E59` | Botón principal con el ratón encima y pulsado |
| Principal suave | `--color-primario-suave` | `#CCFBF1` | Etiquetas y fondos de elementos seleccionados |
| Peligro | `--color-peligro` | `#B91C1C` | Eliminar, rechazar, errores |
| Éxito | `--color-exito` | `#15803D` | Confirmaciones, «Aceptar» |
| Foco | `--color-foco` | `#1D4ED8` | Anillo de foco del teclado sobre fondos claros |
| Borde de campo | `--color-borde-campo` | `#6B7280` | Borde de los campos de formulario |
| Borde suave | `--color-borde-suave` | `#D1D5DB` | Separadores y bordes de tarjetas (solo decorativo) |
| Barra | `--color-barra` | `#0F172A` | Cabecera (con y sin sesión) |
| Texto de la barra | `--color-barra-texto` | `#F8FAFC` | Texto, enlaces y anillo de foco sobre la cabecera |

**Fondos de avisos:** error `#FEE2E2` con texto `#7F1D1D`; éxito `#DCFCE7` con texto `#14532D`; aviso `#FEF3C7` con texto `#78350F`; información `#E0F2FE` con texto `#0C4A6E`.

### Contraste calculado

| Combinación | Ratio | Mínimo | Resultado |
|---|---|---|---|
| Texto sobre fondo | 14,68 | 4,5 | Cumple |
| Texto sobre superficie | 13,34 | 4,5 | Cumple |
| Texto sobre principal suave | 13,03 | 4,5 | Cumple |
| Texto suave sobre fondo | 7,56 | 4,5 | Cumple |
| Texto suave sobre superficie | 6,87 | 4,5 | Cumple |
| Texto suave sobre principal suave | 6,71 | 4,5 | Cumple |
| Blanco sobre principal (botón) | 5,47 | 4,5 | Cumple |
| Blanco sobre principal al pasar | 7,58 | 4,5 | Cumple |
| Principal sobre fondo (enlace) | 5,47 | 4,5 | Cumple |
| Principal sobre superficie | 4,97 | 4,5 | Cumple |
| Principal sobre principal suave | 4,86 | 4,5 | Cumple |
| Principal al pasar sobre principal suave (etiqueta «Amigos») | 6,73 | 4,5 | Cumple |
| Blanco sobre peligro (botón) | 6,47 | 4,5 | Cumple |
| Blanco sobre éxito (botón) | 5,02 | 4,5 | Cumple |
| Texto sobre aviso de error | 8,20 | 4,5 | Cumple |
| Texto sobre aviso de éxito | 8,30 | 4,5 | Cumple |
| Texto sobre aviso | 8,15 | 4,5 | Cumple |
| Texto sobre información | 8,24 | 4,5 | Cumple |
| Texto de la barra sobre barra | 17,06 | 4,5 | Cumple |
| **Borde de campo sobre fondo** | **4,83** | 3 | Cumple (el de Bootstrap por defecto, `#ced4da`, daba 1,49) |
| Borde de campo sobre superficie | 4,39 | 3 | Cumple |
| Anillo de foco sobre fondo | 6,70 | 3 | Cumple |
| Anillo de foco sobre superficie | 6,09 | 3 | Cumple |
| Anillo de foco (texto de la barra) sobre barra | 17,06 | 3 | Cumple |
| Anillo de foco azul (`--color-foco`) sobre barra | 2,66 | 3 | **No cumple**: por eso, dentro de la cabecera el anillo usa `--color-barra-texto` |

Los textos y botones de la propuesta tienen **más margen** que los colores por defecto de Bootstrap, algunos de los cuales cumplían justo (4,50:1).

## Tipografía

- **Fuente del sistema:** `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. No hay que descargar ninguna fuente (carga más rápida y sin depender de servicios externos).
- Cuerpo de **16 px** con interlineado 1,5. Nunca menos de 14 px.
- Pesos: normal (400) y negrita (700). Nada de varios pesos intermedios.

| Elemento | Tamaño | Peso |
|---|---|---|
| Título de página (`h1`) | 28 px | 700 |
| Título de sección (`h2`) | 22 px | 700 |
| Subtítulo (`h3`) | 18 px | 700 |
| Texto | 16 px | 400 |
| Texto pequeño (ayudas, datos) | 14 px | 400 |

- Columnas de texto estrechas: unos 65 caracteres como máximo por línea.

## Espaciado

Escala de múltiplos de 4 px: **4, 8, 12, 16, 24, 32 y 48**. No se usan otros valores. Entre bloques de una pantalla, 24 px; dentro de un bloque, 8 o 12 px. Contenido centrado de 960 px como máximo, con 24 px de margen lateral; la landing y las pantallas divididas ocupan todo el ancho.

## Bordes y sombras

| Elemento | Radio | Borde |
|---|---|---|
| Botones y campos | 8 px | 1 px, `--color-borde-campo` |
| Buscador de la cabecera | 999 px (píldora) | ninguno (va sobre `--color-barra`) |
| Tarjetas y diálogos | 12 px | 1 px, `--color-borde-suave` |
| Etiquetas | 999 px (píldora) | ninguno |
| Foto de perfil | círculo | ninguno |

**Sin sombras.** La profundidad se logra con borde y color de fondo.

## Componentes

Todo elemento pulsable mide **44 px de alto como mínimo**. Todos los estados usan solo variables `--color-*`.

### Estados comunes de botones y enlaces

| Estado | Botón principal | Botón secundario | Botón de peligro |
|---|---|---|---|
| Reposo | Fondo `--color-primario`, texto `--color-fondo`, negrita | Fondo `--color-fondo`, borde y texto `--color-primario` | Fondo `--color-fondo`, borde y texto `--color-peligro` |
| Ratón encima | Fondo `--color-primario-hover` | Fondo `--color-primario-suave` | Fondo `--color-fondo`, borde 2 px |
| Pulsado | Fondo `--color-primario-hover` | Fondo `--color-primario-suave`, borde `--color-primario-hover` | Fondo `--color-peligro`, texto `--color-fondo` |
| Foco | Anillo de foco (ver «Anillo de foco») | Ídem | Ídem |
| Desactivado | Fondo `--color-superficie`, texto `--color-texto-suave`, borde `--color-borde-suave`; cursor normal | Ídem | Ídem |
| Espera | `[aria-busy="true"]`: ver «Botón con estado de espera» | Ídem | Ídem |

Un enlace de texto es `--color-primario` subrayado; con el ratón, `--color-primario-hover`; con foco, el anillo.

### Componentes

| Componente | Decisión |
|---|---|
| **Botón principal** | Fondo principal, texto blanco en negrita, 44 px de alto como mínimo. **Uno por pantalla.** Estados: tabla anterior |
| **Botón secundario** | Fondo blanco, borde y texto principal. Mismo tamaño que el principal |
| **Botón de peligro** | Borde y texto de peligro; relleno solo en la confirmación final de una acción destructiva |
| **Botón desactivado** | Fondo superficie y texto suave; además, un texto que explique el estado («Solicitud enviada») |
| **Botón con estado de espera** | Ver el apartado siguiente |
| **Campos de formulario** | 44 px de alto, borde `--color-borde-campo`; la etiqueta siempre visible encima, nunca solo el texto de ayuda dentro. Ratón encima: borde `--color-texto`. Foco: anillo. Desactivado: fondo `--color-superficie` y texto suave. En error: borde de peligro y mensaje debajo, con texto |
| **Avisos** | Fondo y texto de su color (error, éxito, aviso, información), radio 8 px, y siempre con texto. Los de error llevan `role="alert"` |
| **Tarjeta** | Fondo blanco, borde suave, radio 12 px, relleno de 16 px. Título en negrita, datos secundarios en texto suave. Sin imagen |
| **Lista con «Cargar más»** | Filas separadas por borde suave; el botón de «Cargar más» es secundario, centrado y se desactiva mientras carga |
| **Foto de perfil** | Círculo; sin foto, una imagen por defecto neutra de la misma forma |
| **Diálogo** | Elemento nativo `<dialog>`, radio 12 px, un solo botón principal («Guardar») y uno secundario («Cancelar») |
| **Anillo de foco** | Contorno de 2 px en `--color-foco`, separado 2 px del elemento. Sobre `--color-barra` (dentro de la cabecera) es de `--color-barra-texto`. Nunca se quita |
| **Iconos** | Sin biblioteca de iconos. Los pocos que hagan falta (la flecha del menú, los tres bloques de la landing) serán SVG en línea de 24 px y trazo de 2 px, siempre acompañados de su texto |

### Botón con estado de espera

Para toda acción con espera (buscar, entrar, guardar, cerrar sesión).

- Mientras espera: `[aria-busy="true"]` y `disabled`; el texto cambia a su gerundio («Buscando…», «Entrando…», «Guardando…», «Cerrando sesión…», «Creando cuenta…»).
- Aspecto: el del botón desactivado de su tipo (fondo `--color-superficie`, texto `--color-texto-suave`, borde `--color-borde-suave`), sin cambiar de tamaño: el botón conserva su ancho para que la fila no salte.
- Cursor de espera (`progress`). Sin ruedas giratorias ni animaciones.
- Al terminar recupera su texto y `disabled` se quita; si falla, aparece el aviso con `role="alert"`.

### Cabecera con sesión

- Barra de **56 px** de alto y todo el ancho, fondo `--color-barra`, texto `--color-barra-texto`. Contenido alineado con el cuerpo (960 px como máximo) salvo que la pantalla sea más ancha.
- Izquierda: marca **PlanB** (enlace a `bienvenida.html`), negrita de 18 px.
- Centro: **buscador redondeado**, campo de 44 px de alto y 400 px de ancho máximo, fondo `--color-fondo`, texto `--color-texto`, texto de ayuda «Buscar personas» en `--color-texto-suave`, radio de píldora. Dentro de la píldora, a la derecha, lleva un botón «Buscar» (`type=submit`, texto visible, 36 px de alto, borde y texto `--color-primario`); también se envía con Intro (formulario GET a `personas.html?q=`).
- Derecha: enlace «Inicio» y el **menú de cuenta**.
- Enlace de sección activa: negrita y línea de 3 px debajo en `--color-barra-texto`; además `aria-current="page"`. Los demás, texto normal.
- Enlace «Saltar al contenido» antes de la cabecera, visible solo con foco.
- `nav` con `aria-label="Principal"`. En `personas.html` el buscador de la cabecera no se ve, porque la página lleva su propio campo.

| Estado | Enlaces y marca | Buscador | Menú de cuenta (resumen) |
|---|---|---|---|
| Reposo | Texto `--color-barra-texto` | Fondo `--color-fondo` | Avatar de 32 px, texto «Cuenta» y flecha |
| Ratón encima | Subrayado | Sin cambio | Subrayado del texto |
| Pulsado | Subrayado y texto en negrita | Sin cambio | Panel abierto |
| Foco | Anillo `--color-barra-texto` | Anillo `--color-barra-texto` | Ídem |
| Desactivado | No aplica | No aplica | No aplica |
| Espera | No aplica | No aplica | «Cerrando sesión…» dentro del panel |

### Menú de cuenta

- Es un `<details>`; el `<summary>` mide 44 px de alto y muestra avatar, «Cuenta» y una flecha.
- Panel: fondo `--color-fondo`, borde `--color-borde-suave`, radio 12 px, 200 px de ancho, alineado a la derecha del botón, con dos opciones de 44 px de alto: «Mi perfil» (enlace) y «Cerrar sesión» (botón de texto).
- Opción con ratón encima: fondo `--color-superficie`. Con foco: anillo `--color-foco`. «Cerrar sesión» en espera: texto «Cerrando sesión…», desactivado y `[aria-busy="true"]`.
- Se abre y se cierra según «Interacciones».

### Cabecera sin sesión

- Solo la landing. Misma barra de 56 px y mismos colores, con la **marca PlanB** a la izquierda (sin buscador, sin menú).
- En la landing (`index.html`), a la derecha: «Iniciar sesión» (secundario) y «Crear cuenta» (también secundario: el único botón principal de la landing es el «Crear cuenta» de la portada). Dentro de la barra, ambos llevan borde `--color-barra-texto` para que se distingan del fondo oscuro.
- Las pantallas divididas de acceso no llevan barra de cabecera: la marca va dentro de la columna izquierda.
- Las pantallas de la aplicación no llevan pie; solo la landing.

### Pantalla dividida de acceso

Para `iniciar-sesion`, `registro`, `recuperar` y `restablecer`.

- Dos columnas iguales que ocupan toda la ventana (sin barra de cabecera), con altura mínima de la ventana.
- Izquierda: fondo `--color-superficie`, marca de 28 px (enlace a `index.html`) y **tres frases** de 18 px en `--color-texto` (en `--color-texto-suave` el detalle), con 48 px de relleno.
- Derecha: fondo `--color-fondo`, formulario de 400 px de ancho máximo centrado; título `h1`, campos, botón principal a todo el ancho y debajo los enlaces secundarios.
- El CAPTCHA (iframe de unos 300 px) cabe en los 400 px del formulario.
- Estados: los de cada formulario (error con aviso, botón con estado de espera, éxito); no cambia la columna izquierda.

### Pestañas

- Fila de botones con `role="tab"` (`tablist`), sobre un borde inferior de 1 px `--color-borde-suave`. Cada pestaña mide **44 px de alto** y 24 px de relleno lateral.
- La activa lleva `aria-selected="true"`, texto `--color-texto` en negrita y una línea de 3 px `--color-primario` bajo el texto; las demás, texto `--color-texto-suave` normal.

| Estado | Aspecto |
|---|---|
| Reposo | Texto `--color-texto-suave`, sin línea |
| Ratón encima | Fondo `--color-superficie` y texto `--color-texto` |
| Pulsado | Fondo `--color-primario-suave` |
| Foco | Anillo `--color-foco` |
| Desactivado | No aplica |
| Espera | No aplica (el panel muestra «Cargando…») |

### Fila de resultado

- Fila de **64 px** de alto como mínimo, ancho completo del contenido, separada de la siguiente por un borde `--color-borde-suave`.
- Foto de 40 px (círculo), nombre en negrita (`--color-texto`) y ciudad en 14 px (`--color-texto-suave`). Toda la fila es un enlace al perfil.
- Reposo: fondo `--color-fondo`. Ratón encima: fondo `--color-superficie`. Pulsada: fondo `--color-primario-suave`. Foco: anillo. Desactivada y espera: no aplican.

### Rejilla de tarjetas con etiqueta de visibilidad

- Rejilla de **4 columnas** con 16 px de hueco, dentro de los 960 px del contenido. La primera casilla de «Tus experiencias» es la tarjeta «+».
- Cada tarjeta: el componente «Tarjeta» con título en negrita, ciudad en `--color-texto-suave`, la etiqueta de visibilidad y el botón secundario «Ver detalle» (44 px de alto). Alto de tarjeta uniforme.
- Tarjeta «+»: mismo tamaño, borde discontinuo `--color-borde-suave` y signo «+» y texto «Nueva experiencia» en `--color-primario`. Ratón encima: fondo `--color-primario-suave`. Foco: anillo.
- Tarjeta en reposo: fondo `--color-fondo`. Ratón encima: borde `--color-borde-campo`. Pulsada: fondo `--color-superficie`. Foco: anillo. En espera, la rejilla muestra «Cargando…» y no hay tarjetas.

**Etiqueta de visibilidad:** píldora de 24 px de alto, texto de 14 px y relleno lateral de 12 px; no es pulsable. Siempre con texto.

| Clase | Texto | Colores |
|---|---|---|
| `.etiqueta-publica` | Pública | Texto `--color-texto-suave`, borde 1 px `--color-borde-campo`, fondo `--color-fondo` |
| `.etiqueta-amigos` | Amigos | Texto `--color-primario-hover`, fondo `--color-primario-suave` |
| `.etiqueta-privada` | Privada | Texto `--color-texto-suave`, fondo `--color-superficie` |

### Cabecera de perfil con contadores

- **Perfil propio:** foto de 96 px a la izquierda; a su derecha el nombre (`h1`) y una fila de tres contadores (experiencias, amigos, seguidores). Cada contador: el número en negrita de 22 px y debajo el rótulo en 14 px `--color-texto-suave`. Los contadores son texto, no enlaces.
- **Perfil de otra persona:** la misma cabecera centrada, con el botón de amistad y «Seguir» debajo de los contadores.
- **Banda de solicitudes** (solo perfil propio): ancho completo, fondo `--color-primario-suave`, texto `--color-texto`, que avisa y lista las solicitudes recibidas, cada una con los botones secundarios «Aceptar» (`btn-outline-success`) y «Rechazar» (`btn-outline-danger`); solo aparece si hay solicitudes. En el perfil no hay botón principal; en «Ajustes», «Guardar cambios» y «Cambiar contraseña» son `btn-outline-primary`.
- «Ajustes» es un `<details>` plegado: el `<summary>` mide 44 px de alto y lleva el borde y los estados de un botón secundario.
- Estados: cargando («Cargando…» en lugar de los datos), error con aviso y, en otra persona, «Usuario no encontrado».

### Marco de captura (landing)

- Recuadro de relación 16:10 (unos 560 × 350 px en 1280 px), fondo `--color-superficie`, borde 1 px discontinuo `--color-borde-suave`, radio 12 px.
- Rótulo centrado «Captura de PlanB» en `--color-texto-suave`. Lleva `role="img"` y `aria-label="Captura de PlanB (próximamente)"`. Se sustituirá por capturas reales; sin cifras ni capturas inventadas.
- No es interactivo: no tiene estados de ratón, pulsado ni foco.

## Interacciones

Reglas normativas, iguales en todas las pantallas. Nada se anima más que esto: sin carruseles, sin desplazamientos animados, sin esqueletos de carga.

| Interacción | Regla |
|---|---|
| **Acción con espera** | Al enviarse, el botón pasa a su texto en gerundio («Buscando…», «Cerrando sesión…», «Guardando…», «Entrando…») y queda desactivado con `[aria-busy="true"]`; al terminar recupera su texto y se activa. Si falla, aviso con `role="alert"` |
| **Buscar** | Al enviar, desaparece el texto de ayuda («Escribe parte de un nombre.» o «Escribe para buscar experiencias.»), se vacían los resultados anteriores, aparece «Cargando…» y, al llegar la respuesta, los resultados entran con un **fundido de 150 ms**. Sin resultados: «No se han encontrado personas.» (o el texto de «Experiencias»). El campo conserva lo escrito |
| **Pestañas** | `role="tab"`, `aria-selected` y paneles `role="tabpanel"`. Al cambiar, la activa se marca con línea gruesa y negrita y el panel anterior se oculta. Se mueven con las flechas izquierda y derecha (de la última a la primera y al revés). El texto de ayuda de cada panel es independiente |
| **Menú de cuenta** | Se abre con un **fundido de 150 ms**; se cierra al pulsar fuera, con Escape o al elegir una opción, y el foco vuelve al botón |
| **Botones y enlaces** | Cambio de ratón, pulsado y foco con una **transición de 120 ms** |
| **Movimiento reducido** | Con `prefers-reduced-motion: reduce` se desactivan todas las transiciones y animaciones: los cambios son instantáneos |

Duraciones: **120 ms** (botones y enlaces) y **150 ms** (fundidos de resultados y del menú). No hay otras.

## Tono de los textos

- Castellano, frases cortas y primera letra en mayúscula, sin punto final en botones.
- Los avisos de error dicen qué pasó y qué hacer. Los textos de ayuda terminan en punto.
- Verbo primero en los botones: «Guardar cambios», «Añadir amigo», «Buscar».
- «Tú», no «usted»: «Tus experiencias», «¿Has olvidado tu contraseña?».
- Acciones con espera en gerundio: «Buscando…», «Guardando…».

## Qué cambia respecto a hoy

PlanB usa los colores por defecto de Bootstrap. Aplicar esta guía supone:

- Sustituir el azul primario por el verde azulado y la barra negra de Bootstrap por `--color-barra`.
- Oscurecer el borde de los campos de formulario, que hoy da 1,49:1.
- Subir los botones a 44 px de alto y unificar el radio en 8 px.
- Una sola jerarquía de botones, en lugar de mezclar azul, verde y rojo sin regla.
- Una cabecera común con buscador y menú de cuenta en las pantallas con sesión.

Esto se hace en la historia de implementación, no aquí.

## Aplicación pantalla por pantalla

| Pantalla | ¿Se ha aplicado esta guía? |
|---|---|
| index (landing) | Sí (CS-66) |
| iniciar-sesion | Sí (CS-66) |
| registro, recuperar, restablecer | Sí (CS-66) |
| bienvenida | Sí (CS-66) |
| perfil, personas, usuario, experiencia | Sí (CS-66) |

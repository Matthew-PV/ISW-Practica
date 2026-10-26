# Arte de PlanB: cómo se ve

> Colores, tipografía, bordes y componentes, para que todas las pantallas sean consistentes. La estructura de cada pantalla está en [diseno.md](diseno.md). Una vista de conjunto, con los colores y los componentes dibujados, está en [diseno/guia-estilo.svg](diseno/guia-estilo.svg).
> Estado: **propuesta para aprobar** (objetivo 3 del libro de historias). Cuando el equipo la apruebe, se aplica a todas las pantallas a la vez en la historia de implementación.

## Cómo se usa este documento

- Aquí se recoge **qué se decide**, no cómo se implementa. Lo aprobado se traduce a variables CSS en `frontend/css/styles.css`.
- Si una pantalla necesita algo que no figura aquí, se propone aquí primero y después se usa.
- Todos los contrastes están **calculados** con la fórmula de luminancia relativa de WCAG, no estimados a ojo.

## Identidad

PlanB es una red social para compartir y descubrir planes por una ciudad. La identidad es **clara, cercana y tranquila**:

- Fondo claro y mucho espacio en blanco, para que el protagonista sea el contenido de los usuarios.
- **Un solo color principal, un verde azulado**, que recuerda a una ciudad, al agua y a los mapas, y se usa solo en lo importante.
- Grises neutros para todo lo demás. Sin degradados ni sombras pesadas: la jerarquía se consigue con el tamaño, el peso y el espacio.
- **Un solo estilo de borde redondeado** en toda la aplicación.

## Reglas de consistencia

- Mismo radio de borde en botones, campos y tarjetas (ver «Bordes»).
- **Un solo botón principal por pantalla**; el resto son secundarios o de texto.
- Los mismos avisos, con los mismos colores y textos, en todas las pantallas.
- Contraste mínimo **AA**: 4,5:1 en texto y botones, y 3:1 en bordes de campos, iconos, anillo de foco y otros componentes de interfaz.
- **El color nunca es la única señal.** Lo activo se marca también con una línea y negrita; un error, con texto; lo desactivado, con texto.
- Todo se comprueba en 375, 768 y 1280 px.
- Zonas pulsables de al menos 44 × 44 px.

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
| Foco | `--color-foco` | `#1D4ED8` | Anillo de foco del teclado |
| Borde de campo | `--color-borde-campo` | `#6B7280` | Borde de los campos de formulario |
| Borde suave | `--color-borde-suave` | `#D1D5DB` | Separadores y bordes de tarjetas (solo decorativo) |
| Barra | `--color-barra` | `#0F172A` | Barra superior de las pantallas con sesión |
| Texto de la barra | `--color-barra-texto` | `#F8FAFC` | Enlaces de la barra |

**Fondos de avisos:** error `#FEE2E2` con texto `#7F1D1D`; éxito `#DCFCE7` con texto `#14532D`; aviso `#FEF3C7` con texto `#78350F`; información `#E0F2FE` con texto `#0C4A6E`.

### Contraste calculado

| Combinación | Ratio | Mínimo | Resultado |
|---|---|---|---|
| Texto sobre fondo | 14,68 | 4,5 | Cumple |
| Texto sobre superficie | 13,34 | 4,5 | Cumple |
| Texto suave sobre fondo | 7,56 | 4,5 | Cumple |
| Texto suave sobre superficie | 6,87 | 4,5 | Cumple |
| Blanco sobre principal (botón) | 5,47 | 4,5 | Cumple |
| Blanco sobre principal al pasar | 7,58 | 4,5 | Cumple |
| Principal sobre fondo (enlace) | 5,47 | 4,5 | Cumple |
| Principal sobre superficie | 4,97 | 4,5 | Cumple |
| Blanco sobre peligro (botón) | 6,47 | 4,5 | Cumple |
| Blanco sobre éxito (botón) | 5,02 | 4,5 | Cumple |
| Texto sobre aviso de error | 8,20 | 4,5 | Cumple |
| Texto sobre aviso de éxito | 8,30 | 4,5 | Cumple |
| Texto sobre aviso | 8,15 | 4,5 | Cumple |
| Texto sobre información | 8,24 | 4,5 | Cumple |
| Texto sobre barra oscura | 17,06 | 4,5 | Cumple |
| **Borde de campo sobre fondo** | **4,83** | 3 | Cumple (el de Bootstrap por defecto, `#ced4da`, daba 1,49) |
| Borde de campo sobre superficie | 4,39 | 3 | Cumple |
| Anillo de foco sobre fondo | 6,70 | 3 | Cumple |
| Anillo de foco sobre barra oscura | 17,85 | 3 | Cumple |

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

Escala de múltiplos de 4 px: **4, 8, 12, 16, 24, 32 y 48**. No se usan otros valores. Entre bloques de una pantalla, 24 px; dentro de un bloque, 8 o 12 px; margen lateral de página, 16 px en móvil.

## Bordes y sombras

| Elemento | Radio | Borde |
|---|---|---|
| Botones y campos | 8 px | 1 px, `--color-borde-campo` |
| Tarjetas y diálogos | 12 px | 1 px, `--color-borde-suave` |
| Etiquetas | 999 px (píldora) | ninguno |
| Foto de perfil | círculo | ninguno |

**Sin sombras**, salvo el borde superior de la barra inferior del móvil. La profundidad se logra con borde y color de fondo.

## Componentes

| Componente | Decisión |
|---|---|
| **Botón principal** | Fondo principal, texto blanco en negrita, 44 px de alto como mínimo. **Uno por pantalla.** Al pasar el ratón, `--color-primario-hover` |
| **Botón secundario** | Fondo blanco, borde y texto principal. Mismo tamaño que el principal |
| **Botón de peligro** | Borde y texto de peligro; relleno solo en la confirmación final de una acción destructiva |
| **Botón desactivado** | Fondo superficie y texto suave; además, un texto que explique el estado («Solicitud enviada») |
| **Campos de formulario** | 44 px de alto, borde `--color-borde-campo`; la etiqueta siempre visible encima, nunca solo el texto de ayuda dentro. En error: borde de peligro y mensaje debajo, con texto |
| **Tarjeta** | Fondo blanco, borde suave, radio 12 px, relleno de 16 px. Título en negrita, datos secundarios en texto suave |
| **Barra superior** (≥ 768 px) | Fondo `--color-barra`, texto claro; el enlace activo con una línea gruesa debajo y en negrita |
| **Barra inferior** (< 768 px) | Fondo blanco, borde superior, tres zonas iguales de 56 px; la activa con línea gruesa arriba y en negrita. Ver [diseno/navegacion-movil.svg](diseno/navegacion-movil.svg) |
| **Avisos** | Fondo y texto de su color (error, éxito, aviso, información), radio 8 px, y siempre con texto. Los de error llevan `role="alert"` |
| **Lista con «Cargar más»** | Filas separadas por borde suave; el botón de «Cargar más» es secundario, centrado y se desactiva mientras carga |
| **Foto de perfil** | Círculo; sin foto, una imagen por defecto neutra de la misma forma |
| **Etiqueta de visibilidad** | Píldora con texto: «Pública» (borde y texto neutros), «Amigos» (fondo principal suave) y «Privada» (fondo superficie). Siempre el texto, no solo el color |
| **Diálogo** | Elemento nativo `<dialog>`, radio 12 px, un solo botón principal («Guardar») y uno secundario («Cancelar») |
| **Anillo de foco** | Contorno de 2 px en `--color-foco`, separado 2 px del elemento. Nunca se quita |
| **Iconos** | Sin biblioteca de iconos. Los pocos que hagan falta (por ejemplo, en la barra inferior) serán SVG en línea de 24 px y trazo de 2 px, siempre acompañados de su texto |

## Tono de los textos

- Castellano, frases cortas y primera letra en mayúscula, sin punto final en botones.
- Los avisos de error dicen qué pasó y qué hacer. Los textos de ayuda terminan en punto.
- Verbo primero en los botones: «Guardar cambios», «Añadir amigo», «Buscar».
- «Tú», no «usted»: «Tus experiencias», «¿Has olvidado tu contraseña?».

## Qué cambia respecto a hoy

PlanB usa los colores por defecto de Bootstrap. Aplicar esta guía supone:

- Sustituir el azul primario por el verde azulado y la barra negra de Bootstrap por `--color-barra`.
- Oscurecer el borde de los campos de formulario, que hoy da 1,49:1.
- Subir los botones a 44 px de alto en móvil y unificar el radio en 8 px.
- Una sola jerarquía de botones, en lugar de mezclar azul, verde y rojo sin regla.

Esto se hace en la historia de implementación, no aquí.

## Aplicación pantalla por pantalla

| Pantalla | ¿Se ha aplicado esta guía? |
|---|---|
| index, registro, recuperar, restablecer | No |
| bienvenida | No (será la página piloto) |
| perfil, personas, usuario, experiencia | No |

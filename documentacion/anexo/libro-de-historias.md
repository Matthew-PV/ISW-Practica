# Libro de historias: estructura y uso

Cómo está construido `Customer_Stories_PlanB.xlsx` (OneDrive) y cómo se edita. Solo hace falta para trabajar con el libro; no es necesario para programar.

## 1. Estructura del libro

El libro está preparado para Excel para la web: solo usa fórmulas, tablas de Excel, listas desplegables, formato condicional y un Office Script, sin macros. Tiene tres tipos de hoja: el **Índice**, una **página por historia** y la hoja **«Plantilla»**, que es siempre la última.

**Referencias.** Cada historia se identifica como `CS-XX`, con un número correlativo que empieza en `CS-01`. La página de cada historia se llama exactamente igual que su referencia, y las menciones a otras historias dentro de los textos también usan esa referencia.

**Índice.** Es una tabla de Excel llamada «Historias», con filtro en cada columna:

|Columna|Contenido|Cómo se rellena|
|-|-|-|
|Ref|Referencia `CS-XX`|La pone el botón «Crear páginas»|
|Título|Nombre de la historia, enlazado a su página|A mano|
|Riesgo|Bajo, Medio bajo, Medio, Alto o Muy alto|Desplegable|
|Prioridad|I (la más importante), N (media) o M (poco importante)|Desplegable|
|Tiempo estimado|Horas previstas para toda la historia|A mano|
|Tiempo total|Suma del «Tiempo total» de los objetivos de su página, en horas|Automático|
|Estado|En espera, En progreso, Finalizada o Sin página|Automático|
|Entrega|Entrega en la que se trabaja la historia (E1, E2…), en la columna H|Desplegable, con la lista de la hoja «Tiempos»|

Arriba a la derecha, «Próxima ref.» muestra la siguiente referencia libre.

**Tiempos.** La hoja «Tiempos» tiene dos partes:

1. La tabla «Entregas», con las entregas en orden y sin fechas: E1 «Acceso y perfil», E2 «Círculo social», E3 «Parte visual y BBDD online»… Es la lista del desplegable «Entrega» del Índice.
2. Las horas de cada persona (filas) en cada entrega (columnas, hasta diez): suma el Tiempo total de los objetivos que tiene como responsable en las historias de esa entrega. La fila «Otros» recoge los objetivos sin responsable o con un nombre fuera de la lista del equipo, y la fila «Total» coincide con la suma del Tiempo total de esas historias en el Índice. Todo se calcula solo.

Para ver solo las historias de una entrega se filtra la columna «Entrega» del Índice.

El estado se calcula a partir de los objetivos de la página:

* **En espera:** ningún objetivo tiene responsable ni está finalizado, o la página aún no tiene objetivos.
* **En progreso:** al menos un objetivo tiene responsable o está finalizado.
* **Finalizada:** la página tiene objetivos y todos están en «Sí».
* **Sin página:** la fila tiene título, pero no existe ninguna hoja con su referencia.

**Páginas.** Cada página tiene dos niveles:

1. **Cabecera de la historia:** Ref, Título, Estado, Prioridad, Riesgo, Tiempo estimado, Tiempo total, Propietario, Fecha, Prior Reference, Task Description y Criterio de Validación. Las celdas con fondo gris se calculan solas: Título, Estado, Prioridad, Riesgo y Tiempo estimado se copian del Índice, y Tiempo total suma los objetivos. Para cambiarlas se edita el Índice. El enlace «↑ Índice» de la banda superior vuelve al Índice.
2. **Task Tracking:** tabla de objetivos con las columnas Objetivo (número automático), Descripción, Finalizado (Sí o No), Responsable, Tiempo estimado y Tiempo total. Responsable ofrece la lista del equipo (Joaquin, Matthew, Jorge, Flavia, Lucia y José) y admite otros nombres tras un aviso. La última fila, «Total», suma el Tiempo estimado y el Tiempo total de los objetivos en minutos; no cuenta como objetivo y el Índice no la incluye en sus cálculos.

**Unidades.** Los tiempos de la historia (Índice y cabecera de la página) están en horas y los de los objetivos, en minutos. Se escribe solo el número, por ejemplo `0,5` horas o `30` minutos: la unidad la añade el formato de la celda, y los campos de tiempo no aceptan texto ni números negativos. La fecha se muestra como `DD/MM/AAAA`.

## Esquema de colores y formatos

Los colores de prioridad, riesgo, estado y finalizado se aplican solos con formato condicional. Un valor que no está en su lista se queda sin color, lo que ayuda a detectarlo.

|Campo|Valor|Fondo|Texto|
|-|-|-|-|
|Prioridad|I|`#FFC7CE` rojo claro|`#9C0006`|
|Prioridad|N|`#FFEB9C` amarillo|`#9C5700`|
|Prioridad|M|`#C6EFCE` verde claro|`#006100`|
|Riesgo|Bajo|`#C6EFCE` verde claro|`#006100`|
|Riesgo|Medio bajo|`#E2EFDA` verde pálido|`#375623`|
|Riesgo|Medio|`#FFEB9C` amarillo|`#9C5700`|
|Riesgo|Alto|`#F8CBAD` naranja|`#843C0C`|
|Riesgo|Muy alto|`#FFC7CE` rojo claro|`#9C0006`, negrita|
|Estado|En progreso|`#FFD966` amarillo intenso|`#7F6000`, negrita|
|Estado|En espera|`#EDEDED` gris|`#595959`|
|Estado|Finalizada|`#C6EFCE` verde claro|`#006100`|
|Estado|Sin página|`#FFC7CE` rojo claro|`#9C0006`|
|Finalizado (objetivos)|Sí|`#C6EFCE` verde claro|`#006100`|
|Finalizado (objetivos)|No|`#FFC7CE` rojo claro|`#9C0006`|

Además, en el Índice la fila completa de una historia **En progreso** se resalta con fondo `#FFF2CC` y negrita, y la de una historia **Finalizada** pasa a texto gris `#808080`. Así destacan las historias en las que se está trabajando.

|Elemento|Formato|
|-|-|
|Tipografía|Arial 11. Título del Índice en 16, banda de título de cada página en 14 y banda «Task Tracking» en 12|
|Bandas de título y cabeceras de tabla|Fondo azul oscuro `#1F4E78`, texto blanco en negrita|
|Etiquetas de la cabecera de página|Fondo azul claro `#DCE6F1`, negrita|
|Celdas calculadas de la cabecera|Fondo gris `#F2F2F2`|
|Enlaces|Azul `#0563C1`, subrayado|
|Textos de ayuda|Cursiva gris: `#595959` en el Índice y `#7F7F7F` en las páginas|
|Bordes|Línea fina gris `#A6A6A6`|
|Pestaña «Plantilla»|Gris `#808080`|
|Horas|Con decimales y la unidad «h», por ejemplo `4,0 h` o `1,25 h`; el cero se muestra como «—»|
|Minutos|Con la unidad «min», por ejemplo `30 min`; el cero se muestra como «—»|
|Número de objetivo|«Objetivo 1», «Objetivo 2»...|

Los desplegables y los colores cubren hasta la fila 500 del Índice y hasta 300 objetivos por página.

## Añadir historias y objetivos

**Historia nueva.**

1. Escribir el título en la fila vacía que hay justo debajo de la tabla del Índice. La tabla crece sola y la fila muestra «Sin página».
2. Pulsar el botón «Crear páginas». El botón pone la referencia, crea la página copiando «Plantilla» con la referencia y la fecha del día, enlaza el título y abre la página nueva.
3. Rellenar Riesgo, Prioridad, Tiempo estimado y Entrega en el Índice, y Propietario, Prior Reference, Task Description y Criterio de Validación en la página.

Si el botón no está disponible, la página se crea a mano: clic derecho en «Plantilla» → «Duplicar», renombrar la copia con la referencia que indica «Próxima ref.» y escribir esa referencia en la celda B2 de la página y en la columna Ref de su fila del Índice.

**Objetivo nuevo.** Hacer clic en la última celda de la tabla de objetivos (columna Tiempo total, justo encima de la fila «Total») y pulsar Tab: aparece una fila nueva encima del total. También sirve clic derecho en una fila de la tabla → Insertar → Filas de tabla encima. Después se escribe la descripción, y el número, los desplegables y los colores se aplican solos. Escribir debajo de la fila «Total» no añade el objetivo a la tabla. Al poner un responsable o marcar «Sí», el estado y el tiempo total del Índice se actualizan.

**Instalación del botón (una sola vez).** Con el libro en OneDrive y abierto en Excel para la web: Automatizar → Nuevo script → pegar `documentacion/office-scripts/crearPaginas.ts` → guardar como «Crear páginas» → en el panel del script, «…» → «Agregar en el libro». El botón queda en el libro para todas las personas con permiso de edición. Requiere una cuenta de Microsoft 365 con Office Scripts: si no aparece la pestaña «Automatizar», no están disponibles.

**Enlaces que no funcionan.** Pulsar «Crear páginas» vuelve a crear los enlaces de todos los títulos del Índice y el «↑ Índice» de cada página, con el título actual como texto. Si se sube a OneDrive un archivo editado fuera de Excel, Excel puede repararlo al abrirlo y quitar el botón («Removed Part: Data store»). En ese caso, volver a agregarlo desde el panel del script y pulsarlo.

**Entrega nueva.** Añadir una fila al final de la tabla «Entregas» de la hoja «Tiempos», con la siguiente referencia (E4, E5…) y su nombre. Aparece en el desplegable del Índice y como columna en las horas por persona. Como la entrega se asigna por historia, el trabajo de organización del equipo va en una historia «Organización interna · EX» por entrega: CS-60 es la de E1, CS-68 la de E2 y CS-69 la de E3.

La hoja «Tiempos» y la columna «Entrega» se crearon con `documentacion/office-scripts/prepararEntregas.ts`, de un solo uso. Si se vuelve a ejecutar, no duplica ni sobrescribe nada.


## Precauciones

* No escribir en las celdas grises de las páginas ni en las columnas Tiempo total y Estado del Índice: contienen fórmulas y se perderían.
* No escribir a mano en la columna Objetivo de las páginas: el número lo pone una fórmula, y el Índice cuenta los objetivos por ese número. Un «Objetivo 3» escrito a mano no cuenta, y la historia no llega a «Finalizada».
* No renombrar las páginas: el Índice las encuentra por su nombre, que debe coincidir con la referencia.
* No insertar ni mover columnas en las páginas. El Índice lee de cada página las columnas A (número de objetivo), C (Finalizado), D (Responsable) y F (Tiempo total).
* No insertar filas en la cabecera de «Plantilla»: el botón escribe la referencia en B2 y la fecha en B10.
* En la hoja «Tiempos» solo se escribe en la tabla «Entregas»; el resto son fórmulas.
* El Índice se puede ordenar y filtrar. En Excel para la web, un filtro lo ven todas las personas que tienen el libro abierto; para filtrar solo para uno mismo se usa Vista → Vista de hoja → Nueva.

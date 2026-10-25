# Arte de PlanB: cómo se ve

> Colores, tipografía, bordes y componentes, para que todas las pantallas sean consistentes. La estructura de cada pantalla está en [diseno.md](diseno.md).
> Estado: **sin decisiones tomadas todavía**. Cada línea que se acuerde se apunta aquí y se aplica a todas las pantallas a la vez.

## Cómo se usa este documento

- Aquí se recoge **qué se decide**, no cómo se implementa. Cuando el equipo apruebe algo, se traduce a variables CSS en `frontend/css/styles.css`.
- Si una pantalla necesita algo que no figura aquí, se propone aquí primero y después se usa.

## Reglas de consistencia

- Mismo tipo de borde en botones, campos y tarjetas.
- Un solo botón principal por pantalla; el resto, secundarios.
- Los mismos avisos, con los mismos colores, en todas las pantallas.
- Contraste mínimo **AA** en texto y botones.
- Todo se comprueba en 375, 768 y 1280 px.

## Paleta

| Rol | Uso | Valor | Contraste AA |
|---|---|---|---|
| Principal | Botón principal, enlaces | _por decidir_ | _por comprobar_ |
| Secundario | Botones secundarios | _por decidir_ | |
| Éxito | Avisos de éxito, «Aceptar» | _por decidir_ | |
| Error | Avisos de error, acciones destructivas | _por decidir_ | |
| Aviso | Información importante | _por decidir_ | |
| Fondo y texto | Página, tarjetas, texto | _por decidir_ | |

## Tipografía y espaciado

| Elemento | Decisión |
|---|---|
| Familia de fuente | _por decidir_ |
| Tamaños (título, cuerpo, pequeño) | _por decidir_ |
| Espaciados | _por decidir_ |

## Componentes

| Componente | Qué hay que decidir | Decisión |
|---|---|---|
| Botones | Redondeados o rectos, jerarquía, tamaño táctil | _por decidir_ |
| Campos de formulario | Borde, estado de error, etiquetas | _por decidir_ |
| Tarjetas | Borde o sombra, relleno | _por decidir_ |
| Barra superior | Fondo, enlace activo | _por decidir_ |
| Avisos | Colores e icono | _por decidir_ |
| Lista con «Cargar más» | Separación, estado vacío | _por decidir_ |
| Foto de perfil | Forma y foto por defecto | _por decidir_ |
| Diálogos | Fondo, botones | _por decidir_ |
| Iconos | Qué conjunto, y si se usan | _por decidir_ |

## Tono de los textos

- Frases cortas en un idioma (castellano), con la primera letra en mayúscula y sin punto final en botones.
- Los avisos de error dicen qué pasó y qué hacer.

## Aplicación pantalla por pantalla

| Pantalla | ¿Se ha aplicado esta guía? |
|---|---|
| index, registro, recuperar, restablecer | No |
| bienvenida | No (será la página piloto) |
| perfil, personas, usuario, experiencia | No |

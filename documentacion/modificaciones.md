# Modificaciones — PlanB

Registro diario de los cambios del proyecto: qué cambió, por qué y quién lo decidió. Lo más reciente va arriba. Las reglas están en `AGENTS.md`, sección 9.1.

Plantilla de una sección (las secciones `###` vacías se omiten, salvo «Cambios»):

```markdown
# AAAA-MM-DD

## CS-XX: título breve de la tarea

**Autor:** nombre completo, con <agente> si lo hubo
**Historia:** CS-XX, objetivos N a M (o «sin historia») · **Commits:** `abc1234`, `def5678`

### Cambios
- Qué cambió, por capa o archivo.

### Decisiones
#### Título de la decisión
- **Contexto:** problema, criterio o petición que la motivó.
- **Decisión:** qué se hizo.
- **Alternativas:** opciones consideradas y por qué no se eligieron; «ninguna» si no las hubo.
- **Consecuencias:** qué implica: migraciones, límites, trabajo pendiente, lo que deja de valer.
- **Decidió:** persona responsable («…, a propuesta de <agente>» si la propuesta fue del agente).

### Comprobación
- TDD: qué prueba falló primero y por qué, y qué la hizo pasar. Batería completa.
- Comprobación manual, si la hubo.

### Para quien continúe
- Pasos tras el `git pull` (migraciones, `.env`, dependencias) y avisos.

### Pendiente
- Lo que queda sin hacer o sin comprobar.
```

Las entradas anteriores al 09/10/2026 se han pasado a este formato sin cambiar su contenido: el autor y los commits salen de Git (`git blame` y `git log`), el agente solo figura si consta en el registro de prompts de su autor y una decisión solo aparece si la entrada original ya contaba su motivo.

# 2026-10-27

## CS-66: documentación del frontend y cierre de la auditoría visual

**Autor:** Joaquín de Vicente Abad, con Claude (aplicación de escritorio)
**Historia:** CS-65 y CS-66

### Cambios
- `documentacion/frontend.md` reescrito con las diez pantallas, la cabecera común, `shared/cabecera.js` y `shared/pestanas.js`, `personas.html?q=`, los CSS nuevos y la regla de las variables `--color-*`.
- `README.md`: diez pantallas, raíz como landing e `iniciar-sesion.html`. `arte.md` («Aplicación pantalla por pantalla») y `diseno.md` («Estado del código hoy») al día.

### Comprobación
- `enlaces-md.mjs` sin enlaces rotos; hay diez páginas en `frontend/`.

## CS-66: auditoría visual y correcciones

**Autor:** Joaquín de Vicente Abad, con Claude (aplicación de escritorio)
**Historia:** CS-66

### Cambios
- `personas.html`: «Cargando…» y el aviso de error salen del panel de Personas y valen para cualquier pestaña; la etiqueta del campo pasa de «Nombre de usuario» a «Texto a buscar».
- `personas.test.js`: cinco pruebas nuevas (dos en rojo por el cambio de HTML; tres fijan comportamiento ya existente: se vacían los resultados al buscar de nuevo, el error de una búsqueda atrasada no se muestra y `entrando` se retira tras el fundido).

### Comprobación
- `npm test`: 58 suites, 725 pruebas, 0 fallos. Auditoría de las diez páginas a 1024, 1280 y 1440 px con clics: R2 a R6 en cero.

### Pendiente
- No se forzaron los estados (vacío, error, 404) con navegador: solo los cubren las pruebas jsdom. Ver el informe final.

## CS-66: integración del trabajo de Matthew en el diseño aplicado

**Autor:** Joaquín de Vicente Abad, con Claude (aplicación de escritorio)
**Historia:** CS-65 y CS-66

### Cambios
- Se mezcla `origin/main` (tres commits de Matthew: pantallas de acceso, experiencia y pantallas sociales con la guía provisional) con el diseño de escritorio aplicado en esta rama. Sus entradas del registro y su archivo de prompts se conservan tal cual.
- De su trabajo se toman en `frontend/js/experiencia.js`: sin emojis en «Útil» y «Reportar» (tono de `arte.md`), `type="button"` en los botones de las valoraciones y `role="alert"` en el aviso de error.

### Decisiones
#### Prevalece el diseño de escritorio aprobado; se descartan el móvil y la estructura propia de Matthew
- **Contexto:** Matthew aplicó de forma provisional la guía a las mismas pantallas, con barra inferior en móvil, experiencia en dos columnas, una barra de sesión y una cabecera distintas, y sus pruebas `diseno.*` comprueban ese marcado. Sus propias notas dicen que su batería quedaba en rojo (13 suites) y que la guía no estaba aprobada. El diseño aprobado el 26/10/2026 es solo escritorio, con cabecera común, experiencia en una columna y un solo botón principal por pantalla.
- **Decisión:** en HTML, CSS, JavaScript de pantallas y `arte.md` se conserva la versión de esta rama; se eliminan sus tres pruebas `diseno.*` (comprobaban un marcado que ya no existe y quedan cubiertas por `cabecera`, `landing`, `iniciar-sesion` y las pruebas de cada pantalla); se adoptan sus mejoras pequeñas de `experiencia.js`.
- **Alternativas:** partir de su CSS y su marcado y adaptarlos al diseño de escritorio (más conflictos y retrabajo, y arrastra el móvil descartado); o rechazar la mezcla.
- **Consecuencias:** su trabajo de estilos y estructura no queda en el código; las funciones y las pruebas de comportamiento no cambian. Conviene comentarlo con Matthew.
- **Decidió:** Joaquín.

## CS-66: páginas con el diseño aplicado

**Autor:** Joaquín de Vicente Abad, con Claude (aplicación de escritorio)
**Historia:** CS-66

### Cambios
- `index.html`: landing estática con cabecera sin sesión, portada con marco de captura, tres bloques, «Cómo funciona», cierre y pie (`css/landing.css`).
- Acceso (`iniciar-sesion`, `registro`, `recuperar`, `restablecer`): pantalla dividida sin barra de cabecera, con la marca en la columna izquierda (`css/acceso.css`). Botones de envío con «Entrando…», «Creando cuenta…», «Enviando…», «Guardando…» y `aria-busy`.
- `bienvenida.html`: «Tus experiencias» como `h1`, rejilla de 4 columnas con la tarjeta «+», tarjetas con etiqueta de visibilidad y «Ver detalle» como botón; «Guardar» pasa a «Guardando…».
- `experiencia.html`: una columna de 720 px, formulario compacto y pestañas «De amigos y seguidores | Todas» (`css/experiencia.css`).
- `perfil.html` y `usuario.html`: cabecera de perfil con contadores, banda de solicitudes, secciones apiladas, «Ajustes» plegado con «Cerrar sesión»; las tarjetas de experiencia de `shared/experiencias.js` son las mismas que las de Inicio (`css/perfil.css`).
- `personas.html`: «Buscar» con campo grande, pestañas Personas y Experiencias, «Buscando…» con ayuda que desaparece, fundido de 150 ms, `?q=` desde la cabecera y descarte de respuestas atrasadas; `buscarExperiencias` devuelve vacío (`css/buscar.css`).
- Pruebas nuevas en `landing`, `bienvenida`, `iniciar-sesion`, `registro`, `recuperacion`, `experiencia`, `personas`, `perfil.cabecera`, `usuario.cabecera` y `shared/experiencias`.

### Decisiones
#### Perfil sin pestañas y sin botón principal
- **Contexto:** el perfil tiene «Aceptar», «Rechazar», «Guardar cambios» y «Cambiar contraseña», y la regla de diseño es un solo botón principal por pantalla.
- **Decisión:** secciones apiladas, sin pestañas; todos esos botones son secundarios (`btn-outline-*`); en `usuario.html` solo es principal «Añadir amigo» o «Aceptar», según la relación.
- **Alternativas:** pestañas de Instagram; se descartan por trabajar de más.
- **Consecuencias:** el perfil no tiene una acción principal destacada.
- **Decidió:** Joaquín, a propuesta de Claude.

#### «Experiencias» de Buscar vacía por una función única
- **Contexto:** la búsqueda de experiencias depende de CS-23, CS-24 y CS-26.
- **Decisión:** la pestaña se ve y `buscarExperiencias` devuelve `Promise.resolve([])`, con «Todavía no hay experiencias que mostrar.»; CS-24 la sustituirá por la llamada real.
- **Alternativas:** ocultar la pestaña o simular datos; se descartan para no inventar contenido.
- **Consecuencias:** hueco conocido hasta CS-24.
- **Decidió:** Joaquín.

#### Landing como concepto con marcos de captura
- **Contexto:** acabará con capturas reales.
- **Decisión:** marco con el rótulo «Captura de PlanB», sin cifras ni testimonios; el único botón principal es el «Crear cuenta» de la portada.
- **Alternativas:** capturas o cifras inventadas; se descartan.
- **Consecuencias:** hay que sustituir el marco cuando haya capturas.
- **Decidió:** Joaquín.

### Comprobación
- TDD: pruebas nuevas en rojo antes de implementar en cada página (p. ej. `personas.test.js` 5 de 11 en rojo, `perfil.cabecera` y `usuario.cabecera` 16 de 21, `landing.test.js` 5 de 9), después en verde. `npm test`: 58 suites, 720 pruebas, 0 fallos.
- Auditoría visual de las diez páginas a 1024, 1280 y 1440 px con clics: R2 a R6 en cero.
- Revisión de la oleada: dos graves (marca de la landing a la derecha y tarjetas de perfil y usuario) corregidos; tres menores de Buscar sin corregir.

### Pendiente
- Menores de Buscar: «Cargando…» y el aviso dentro del panel Personas, pruebas de cuatro comportamientos y la etiqueta «Nombre de usuario» en la pestaña Experiencias.

## CS-66: base visual compartida y cabecera

**Autor:** Joaquín de Vicente Abad, con Claude (aplicación de escritorio)
**Historia:** CS-66

### Cambios
- `frontend/css/styles.css`: tema con las variables `--color-*` de `arte.md`, reasignadas sobre Bootstrap, y los componentes comunes (cabecera, botones, campos, avisos, tarjetas, etiquetas de visibilidad, pestañas, pantalla dividida, rejilla, foco, transiciones de 120 y 150 ms con `prefers-reduced-motion`).
- Cabecera común en `bienvenida`, `perfil`, `personas`, `usuario` y `experiencia`: marca, «Inicio», buscador con botón «Buscar», menú «Cuenta» con «Mi perfil» y «Cerrar sesión», y «Saltar al contenido». `js/shared/cabecera.js` cierra sesión (`POST /api/auth/logout`) y gestiona el menú; `js/shared/pestanas.js` activa pestañas con teclado.
- El login pasa de `index.html` a `iniciar-sesion.html` (`js/iniciar-sesion.js`); `index.html` es una landing provisional; los 401 y `irAlLogin` llevan a `iniciar-sesion.html`.
- Pruebas: `cabecera.test.js`, `pestanas.test.js` y `enlaces.test.js` nuevas; `navegacion.test.js` sustituida por `cabecera.test.js`; `login.test.js` renombrada a `iniciar-sesion.test.js`; `app.test.js`, `recuperacion.test.js`, `usuario.test.js` y `estados.test.js` apuntan a las rutas nuevas.

### Decisiones
#### Cabecera repetida con prueba de igualdad, no pintada por JavaScript
- **Contexto:** la cabecera está en cinco páginas y debe ser idéntica.
- **Decisión:** el mismo bloque HTML en cada página y una prueba que compara su `outerHTML` sin `aria-current`.
- **Alternativas:** inyectarla con JavaScript (parpadeo, y sin JS no hay navegación) o plantillas en el servidor (cambia la arquitectura estática).
- **Consecuencias:** un cambio de cabecera se hace en cinco archivos; la prueba avisa si alguno se queda atrás.
- **Decidió:** Joaquín, a propuesta de Claude.

#### Menú de cuenta con `<details>` y `cabecera.js`
- **Contexto:** la regla del repo prohíbe el JavaScript de Bootstrap.
- **Decisión:** `<details>` nativo; `cabecera.js` lo cierra con clic fuera, Escape o al elegir una opción, devolviendo el foco al resumen. «Cerrar sesión» usa `api()` y, si falla, muestra un aviso `role="alert"` tras la cabecera.
- **Alternativas:** dropdown de Bootstrap; se descarta por la regla.
- **Consecuencias:** cualquier `button[data-cerrar-sesion]` (el de «Ajustes») se enlaza solo.
- **Decidió:** Joaquín, a propuesta de Claude.

### Comprobación
- TDD: T2.1 dejó 7 suites (45 pruebas) en rojo por lo esperado (cabecera sin `aria-label`, `cabecera.js` y `pestanas.js` inexistentes, `iniciar-sesion.html` inexistente); T2.3 las pasó a verde. `npm test`: 55 suites, 658 pruebas, 0 fallos (línea base 53 y 590).
- Auditoría visual a 1024, 1280 y 1440 px: R2, R3 y R5 en cero; R6 solo en `perfil.html` (dos botones principales, se corrige al rediseñar la página). Revisión de la fase sin hallazgos graves.

### Pendiente
- Aplicar el diseño al resto de páginas (fases siguientes). La landing es provisional.

## CS-65: auditoría y SVG de concepto

**Autor:** Joaquín de Vicente Abad, con Claude (aplicación de escritorio)
**Historia:** CS-65, objetivos 1 a 4

### Cambios
- `documentacion/diseno.md` reescrito solo para escritorio, con diez pantallas (se añaden la landing `index.html` e `iniciar-sesion.html`), la cabecera común y las interacciones; `arte.md` con los componentes nuevos (cabecera con sesión y sin ella, pantalla dividida, pestañas, fila de resultado, rejilla de tarjetas con etiqueta de visibilidad, cabecera de perfil, marco de captura, botón con estado de espera) y la sección «Interacciones».
- `inventario-pantallas.md` y `sitemap.mmd` al día: landing, `iniciar-sesion`, «Cerrar sesión», búsqueda desde la cabecera y los 401 hacia el login.
- `documentacion/diseno/`: 11 SVG de concepto en blanco y negro, solo escritorio (`index`, `iniciar-sesion`, `registro`, `recuperar`, `restablecer`, `cabecera`, `bienvenida`, `personas`, `experiencia`, `perfil`, `usuario`) y `guia-estilo.svg` regenerada (única hoja con color). Se borran `navegacion-movil.svg`, `usuario-a.svg` y `usuario-b.svg`.

### Decisiones
#### Landing en `/` y login en `iniciar-sesion.html`
- **Contexto:** la decisión del 26/10/2026 era «sin landing page»; Joaquín pidió una página de presentación con acceso a iniciar sesión y registrarse.
- **Decisión:** `index.html` pasa a ser la landing, estática y sin JavaScript, con marcos de captura; el login se mueve a `iniciar-sesion.html` y los 401 llevan allí. El libro y el sitemap pasan de 9 a 10 pantallas.
- **Alternativas:** dejar el login en `/` y poner la landing aparte (`presentacion.html`); se descarta porque la raíz es lo primero que ve cualquiera.
- **Consecuencias:** cambian las referencias a `/` del frontend y cuatro archivos de pruebas (fase de implementación). Los textos y capturas de la landing son un concepto que se sustituirá con capturas reales.
- **Decidió:** Joaquín.

#### Solo escritorio; móvil aparcado
- **Contexto:** Joaquín pidió quitar de momento todo lo de móvil.
- **Decisión:** los SVG, `diseno.md` y `arte.md` quedan sin barra inferior ni medidas de 375 px; se comprueba a 1024, 1280 y 1440 px.
- **Alternativas:** mantener móvil como segunda hoja; se descarta por alcance.
- **Consecuencias:** el móvil queda sin diseño hasta que se retome.
- **Decidió:** Joaquín.

#### Cabecera B, experiencia A, búsqueda unificada y perfil sin pestañas
- **Contexto:** variantes probadas durante el diseño.
- **Decisión:** cabecera con buscador en píldora (botón «Buscar» dentro) y menú «Cuenta»; experiencia en una columna con pestañas «De amigos y seguidores | Todas»; Buscar unificado con pestañas Personas y Experiencias (esta última vacía por diseño hasta CS-24); perfil con secciones apiladas, sin pestañas; usuario en la variante A.
- **Alternativas:** cabecera A con pestañas, experiencia B con portada, perfil con pestañas; se descartan por no seguir el patrón de las webs de referencia o por trabajar de más.
- **Consecuencias:** «Experiencias» de Buscar, «Útil» y «Reportar» quedan como huecos conocidos.
- **Decidió:** Joaquín, a propuesta de Claude.

#### Un solo botón principal por pantalla
- **Contexto:** el diseño ponía «Crear cuenta» como principal tres veces en la landing y «Aceptar» y «Guardar» en el perfil, contra la regla de un único `.btn-primary` por pantalla y estado.
- **Decisión:** en la landing solo es principal el «Crear cuenta» de la portada; el perfil no tiene botón principal (Aceptar, Rechazar y los de «Ajustes» son secundarios); las pantallas de acceso van sin barra de cabecera.
- **Alternativas:** dejar varios principales; se descarta por R6.
- **Consecuencias:** `perfil.js` aún usa `btn-success` y `btn-primary` en esos botones; se alinea en la fase de implementación.
- **Decidió:** Joaquín, a propuesta de Claude.

### Comprobación
- Sin TDD (documentación y dibujos). Hay 12 SVG; sin «móvil» ni «375» fuera de la guía; solo `#000`, `#fff` y `#999`; XML válido; Chrome los renderiza y se revisaron los PNG. `enlaces-md.mjs` sin enlaces rotos. Contrastes de `arte.md` recalculados con la fórmula WCAG. Revisión de la oleada en dos ciclos sin hallazgos graves.
- El sitemap no se validó con Mermaid (sin red); se revisó nodo a nodo.

### Pendiente
- Implementar el diseño en el frontend (CS-66).
- Landing con capturas reales; el móvil, aparcado.

## CS-66: diseño provisional de las pantallas de acceso

**Autor:** Matthew Puente Villegas Michavil, con Codex (GPT-5)
**Historia:** CS-66, objetivo 1 · **Commits:** pendiente (esta entrada se incluirá en el mismo commit)

### Cambios
- `frontend/css/styles.css` incorpora las variables de color, tipografía, bordes, botones, campos, avisos y foco de teclado de la guía actual para las pantallas de acceso.
- `index.html`, `registro.html`, `recuperar.html` y `restablecer.html` pasan a usar una tarjeta de formulario común, una barra de acceso, controles de 44 px y el enlace «Saltar al contenido». El inicio de sesión añade la frase de presentación y el botón secundario «Crear cuenta».
- `backend/tests/frontend/diseno.acceso.test.js` comprueba la estructura y reglas visuales compartidas, la ausencia de manejadores en línea y de JavaScript de Bootstrap.
- `documentacion/frontend.md` explica el alcance y que la guía aplicada es provisional.

### Decisiones
#### Aplicar temporalmente la guía actual solo al flujo de acceso
- **Contexto:** `arte.md` sigue marcada como propuesta pendiente de aprobación, pero Matthew pidió avanzar con el objetivo 1 de CS-66 usando esa guía de forma temporal.
- **Decisión:** aplicar sus variables y componentes únicamente a inicio de sesión, registro y recuperación/restablecimiento de contraseña; no extender el cambio a las demás pantallas ni modificar JavaScript.
- **Alternativas:** esperar la aprobación definitiva de la guía, que retrasaría la tarea; o aplicar una identidad nueva distinta, que ampliaría el alcance y contradiría el diseño disponible.
- **Consecuencias:** una aprobación posterior que cambie la guía exigirá ajustar estos estilos. Las funciones, las peticiones a la API, `textContent`, la CSP y el uso de Bootstrap sin su JavaScript se conservan.
- **Decidió:** Matthew, a propuesta de Codex.

### Comprobación
- **TDD:** `diseno.acceso.test.js` se escribió antes. Falló porque no existían las variables, los controles de 44 px, el enlace de salto ni la presentación del inicio de sesión. Tras el cambio pasa (2 pruebas).
- **Manual:** se abrió el servidor local y se revisaron inicio de sesión, registro, recuperación y restablecimiento en el navegador integrado, sin desbordamiento en su ancho móvil. Queda comprobar explícitamente 375, 768 y 1280 px.
- **Batería:** `npm test` no termina en verde por un bloqueo de la infraestructura de pruebas no atribuible al CSS o HTML modificados: 13 suites de pantalla no resuelven `frontend/js/shared/api.js` desde `backend/tests/helpers/pantalla.js`, aunque el archivo existe. Resultado: 41 suites y 465 pruebas correctas; 13 suites y 127 pruebas fallidas.

### Para quien continúe
- Antes de ampliar el diseño, confirmar si el equipo aprueba la guía actual de `arte.md` y comprobar las cuatro páginas a 375, 768 y 1280 px.
- Resolver primero el problema de resolución de módulos de Jest antes de usar una batería completa como evidencia de regresión del frontend.

## CS-66: diseño provisional del detalle de experiencia y sus valoraciones

**Autor:** Matthew Puente Villegas Michavil, con Codex (GPT-5)
**Historia:** CS-66, objetivo 2 · **Commits:** pendiente (esta entrada se incluirá en el mismo commit)

### Cambios
- `frontend/experiencia.html` adopta una barra de navegación accesible, enlace para saltar al contenido y una rejilla de dos columnas que reúne el detalle, el formulario de valoración, las listas y la ventana de reporte.
- `frontend/css/styles.css` añade los componentes de sesión, tarjetas, acciones de valoración, diálogo de reporte y la adaptación móvil para esta pantalla.
- `frontend/js/experiencia.js` conserva las llamadas y reglas existentes, pero asigna las clases visuales de las valoraciones creadas dinámicamente y anuncia los errores con `role="alert"`.
- `backend/tests/frontend/diseno.experiencia.test.js` comprueba la estructura adaptable, los controles y la ausencia de scripts o manejadores en línea. `documentacion/frontend.md` describe el nuevo alcance.

### Decisiones
#### Extender de forma acotada la guía temporal al detalle de experiencia
- **Contexto:** Matthew seleccionó el objetivo 2 de CS-66 después de aplicar temporalmente la guía vigente al flujo de acceso. `arte.md` sigue siendo una propuesta, no una norma definitiva para todo el producto.
- **Decisión:** aplicar sus componentes únicamente a `experiencia.html`: dos columnas en escritorio, contenido apilado y navegación inferior en móvil, y la misma jerarquía de botones para valorar o reportar.
- **Alternativas:** esperar al diseño definitivo, que dejaría este objetivo incompleto; o rediseñar también las páginas sociales, que corresponde al objetivo 3 y ampliaría el alcance.
- **Consecuencias:** una aprobación distinta de la guía exigirá revisar estos estilos. Las rutas, la API, las reglas de autorización y las acciones provisionales «Útil» y «Reportar» no cambian.
- **Decidió:** Matthew, a propuesta de Codex.

### Comprobación
- **TDD:** `diseno.experiencia.test.js` se escribió antes. Falló porque aún no existían la estructura de sesión, la rejilla ni los componentes de valoración y reporte. Tras el cambio pasa (2 pruebas). Al hacerlo pasar se ajustó una expectativa para reconocer una clase entre varias clases CSS, sin reducir el comportamiento comprobado.
- **Batería:** `npm test -- --runInBand` no termina en verde: las suites de pantalla que cargan scripts siguen sin resolver `frontend/js/shared/api.js` desde `backend/tests/helpers/pantalla.js`, aunque el archivo existe. La prueba nueva no usa ese cargador y pasa; el bloqueo impide usar la batería completa como evidencia de regresión.
- **Manual:** no se creó ni se usó una cuenta de prueba sin autorización. Para ver el detalle real hace falta una sesión iniciada; queda comprobarlo a 375, 768 y 1280 px y recorrer con teclado los controles y el diálogo.

### Para quien continúe
- Iniciar sesión en el entorno local y abrir una experiencia visible con valoraciones para revisar los dos estados del formulario (autor y visitante), las listas y el diálogo de reporte en los tres anchos.
- Resolver el cargador de scripts de Jest antes de volver a ejecutar las pruebas dinámicas existentes de `experiencia.html` como regresión completa.

## CS-66: diseño provisional de las pantallas sociales

**Autor:** Matthew Puente Villegas Michavil, con Codex (GPT-5)
**Historia:** CS-66, objetivo 3 · **Commits:** pendiente (esta entrada se incluirá en el mismo commit)

### Cambios
- `perfil.html`, `usuario.html` y `personas.html` comparten la barra de sesión, el enlace «Saltar al contenido», controles de 44 px y componentes de aviso. La barra marca con `aria-current` la sección activa cuando corresponde.
- El perfil propio presenta solicitudes, datos y relaciones en bloques; el cambio de contraseña se repliega con `<details>`. El perfil ajeno usa una columna lateral para los datos en escritorio y contenido apilado en móvil. El buscador agrupa formulario y resultados en una tarjeta.
- `perfil.js`, `usuario.js`, `personas.js` y `shared/experiencias.js` aplican clases visuales a las filas y acciones que crean dinámicamente, sin cambiar sus peticiones ni sus reglas.
- `backend/tests/frontend/diseno.social.test.js` protege la estructura común, la adaptación CSS, la navegación y la ausencia de código en línea. `documentacion/frontend.md` documenta el alcance y `arte.md` refleja qué pantallas aplican temporalmente la guía.

### Decisiones
#### Aplicar la estructura aprobada y mantener la guía visual como temporal
- **Contexto:** la estructura de las tres pantallas sociales está aprobada en `diseno.md`, mientras que `arte.md` conserva el estado de propuesta. Matthew pidió ejecutar el objetivo 3 de CS-66 después de los objetivos de acceso y detalle.
- **Decisión:** aplicar la distribución de los esquemas aprobados y reutilizar temporalmente la paleta y componentes ya incorporados. No se cambia la API, la autorización ni el significado de las acciones sociales.
- **Alternativas:** esperar a la aprobación final de `arte.md`, que detendría el objetivo; o rediseñar las pantallas sin respetar los esquemas aprobados, que contradice la documentación del equipo.
- **Consecuencias:** si el equipo modifica la guía visual habrá que ajustar las clases CSS, pero los identificadores y comportamientos de JavaScript permanecen estables. La comprobación visual autenticada sigue siendo necesaria.
- **Decidió:** Matthew, a propuesta de Codex.

### Comprobación
- **TDD:** `diseno.social.test.js` se escribió antes y falló en sus dos casos porque las páginas no tenían la estructura ni los componentes sociales. Tras el cambio pasa (2 pruebas). Las expectativas se hicieron tolerantes a `aria-current` y a clases combinadas, sin disminuir lo que comprueban.
- **Pruebas específicas:** `diseno.social.test.js` y `navegacion.test.js` pasan (10 pruebas). Las pruebas dinámicas existentes de perfil, perfil público y búsqueda no llegan a ejecutar sus casos porque el cargador compartido de Jest no resuelve `frontend/js/shared/api.js`, aunque el archivo existe.
- **Manual:** no se inició sesión ni se creó una cuenta de prueba sin autorización. Queda comprobar las tres pantallas y las acciones dinámicas con una sesión local a 375, 768 y 1280 px.

### Para quien continúe
- Con una sesión local autorizada, revisar solicitudes, foto, cambio de contraseña, relaciones, experiencias, botones de amistad/seguimiento y resultados de búsqueda a los tres anchos.
- Resolver el cargador de scripts de Jest antes de tomar las pruebas dinámicas existentes como regresión completa.

## CS-65: vista renderizable del sitemap

**Autor:** Matthew Puente Villegas Michavil, con Codex (GPT-5)
**Historia:** CS-65, objetivo 2 · **Commits:** pendiente (esta entrada se incluirá en el mismo commit)

### Cambios
- `documentacion/frontend.md` incorpora una copia del diagrama Mermaid de `sitemap.mmd` dentro de un bloque `mermaid`, para que los visores compatibles lo rendericen al leer la documentación.
- `documentacion/sitemap.mmd` se conserva como archivo independiente; el comentario del bloque recuerda actualizar las dos copias cuando cambie el mapa.

### Comprobación
- Se contrastó el contenido del bloque con `sitemap.mmd`: mantiene las nueve páginas, los enlaces y las dos agrupaciones originales. No se ejecutan pruebas de la aplicación porque solo cambia documentación.

# 2026-10-26

## CS-67: base de datos en Aiven y conexión de PlanB

**Autor:** Lucía Alexandra Guzmán Álvarez, con Claude (aplicación de escritorio)
**Historia:** CS-67, objetivo 2

### Cambios
- Servicio `planb-mysql` en Aiven (plan Free-1-1gb, MySQL 8.4, región Europa) con las 12 migraciones aplicadas y las 201 ciudades del catálogo.
- `backend/.env.example` explica cómo conectarse a la base online con un archivo propio, `backend/.env.online`, que no se sube a Git. El README remite a esas instrucciones.

### Decisiones
#### Un archivo `.env.online` aparte, sin tocar `.env`
- **Contexto:** `npm run dev` y `npm run test:mysql` leen `.env`, y las pruebas con MySQL borran datos: nunca deben apuntar a la base online.
- **Decisión:** `.env` sigue apuntando a Docker. La base online se usa con `backend/.env.online`, que el `.gitignore` ya excluye (`.env.*`), y los comandos llevan `node --env-file=.env.online`.
- **Alternativas:** cambiar `DATABASE_URL` en `.env` para usar la online. Se descarta porque es fácil olvidarlo y lanzar después las pruebas contra la base compartida.
- **Consecuencias:** todavía no hay un script de npm para la base online, y las pruebas no se protegen solas si alguien cambia `.env`; ambas cosas quedan para el objetivo 4.
- **Decidió:** Lucía, a propuesta de Claude.

#### Conexión cifrada sin verificar el certificado en macOS
- **Contexto:** el criterio exige TLS. Con `sslaccept=strict` y el certificado del proyecto, Prisma responde en macOS «P1011: Error opening a TLS connection: The certificate was not trusted». Con `openssl`, el certificado del servidor se verifica bien, incluido el nombre del host, pero no lleva la extensión «Extended Key Usage» de servidor, que macOS exige.
- **Decisión:** en macOS se usa `sslaccept=accept_invalid_certs`: la conexión va cifrada, pero no se comprueba la identidad del servidor.
- **Alternativas:** `sslaccept=strict` con el certificado, que no funciona en macOS y en Windows y Linux debería funcionar, aún sin comprobar; conectar Prisma mediante un adaptador de Node que verifique con OpenSSL, que cambia código compartido y queda como posible mejora; no usar la base online desde Mac, que deja fuera a parte del equipo.
- **Consecuencias:** desde Mac no hay protección frente a la suplantación del servidor. El certificado se conserva en `backend/prisma/aiven-ca.pem`, sin subirlo a Git, por si se adopta la verificación completa.
- **Decidió:** Lucía, a propuesta de Claude.

### Comprobación
- `prisma migrate deploy` contra Aiven: 12 migraciones aplicadas. `prisma/seed.js`: 201 ciudades creadas.
- PlanB arrancado con `.env.online`: registro de una cuenta y creación de una experiencia. Con `npm run dev` (base local) esa cuenta no existe, lo que confirma que son bases distintas.

### Para quien continúe
- Desde `backend/`, con `.env.online` ya creado: `node --env-file=.env.online node_modules/prisma/build/index.js migrate deploy` aplica las migraciones a la base online y `node --env-file=.env.online src/server.js` arranca PlanB conectado a ella. La línea `Datasource … at` debe mostrar la dirección de aivencloud.
- Aiven puede apagar el servicio si no se usa; se vuelve a encender desde su consola.

### Pendiente
- Dar acceso al resto del equipo y comprobar desde dos ordenadores (objetivo 3).
- Proteger las pruebas con MySQL frente a la base online, copia de seguridad y procedimiento de trabajo compartido (objetivo 4).

## CS-67: elección del servicio de base de datos online

**Autor:** Lucía Alexandra Guzmán Álvarez, con Claude (aplicación de escritorio)
**Historia:** CS-67, objetivo 1

### Cambios
- Ninguno en el código: se elige el servicio donde estará la base de datos online de PlanB.

### Decisiones
#### Aiven, plan gratuito de MySQL
- **Contexto:** CS-67 pide un servicio online compatible con MySQL y Prisma, con conexión cifrada (TLS) y accesible para todo el equipo, comparando opciones gratuitas y documentando sus límites, su caducidad y los requisitos de cuenta.
- **Decisión:** Aiven, plan gratuito de MySQL. Según su documentación, consultada el 26/10/2026: 1 CPU, 1 GB de RAM y 1 GB de almacenamiento; hasta 76 conexiones a la vez; un servicio de cada tipo por organización; copias de seguridad incluidas; sin tarjeta y sin fecha de caducidad. Aiven puede apagar el servicio si no se usa (avisa antes y se vuelve a encender desde su panel) y puede cambiar el proveedor o la región.
- **Alternativas:**
  - Azure para estudiantes: MySQL gratis 12 meses (750 horas al mes) y 100 $ de crédito, con el correo de la universidad y sin tarjeta. Se descarta porque caduca al año y obliga a autorizar en su cortafuegos las direcciones desde las que se conecta cada integrante.
  - TiDB Cloud Starter: el plan gratuito más amplio (25 GiB), pero es compatible con MySQL, no MySQL. Se descarta por el riesgo de diferencias con las migraciones de Prisma.
  - PlanetScale: ya no tiene plan gratuito.
- **Consecuencias:** la base online es pequeña y puede apagarse por inactividad, suficiente para un proyecto de clase. La copia de seguridad propia del objetivo 4 no depende de la de Aiven. Las pruebas con MySQL (`npm run test:mysql`) siguen usando la base local de Docker, porque borran datos. Al crearla (objetivo 2) queda por confirmar que la conexión exige TLS y cómo se comparte el acceso con el equipo.
- **Decidió:** Lucía, a propuesta de Claude; el equipo dio su conformidad en el grupo el 26/10/2026.

### Pendiente
- Objetivos 2 a 4 de CS-67.

# 2026-10-26

## CS-65: estados que faltaban en las pantallas (lagunas del inventario)

**Autor:** Flavia Méndez Tsutsumi, con Claude Code (Claude Sonnet 5.5)
**Historia:** CS-65, objetivo 5 (cubrir las lagunas detectadas en el inventario de pantallas)

### Cambios
- **«Cargando…»:** `bienvenida`, `perfil`, `personas` y `usuario` muestran un texto `#cargando` mientras llegan los datos y lo quitan al terminar o al fallar. `shared/pantalla.js` ofrece `mostrarCargando()` y `ocultarCargando()`.
- **Bienvenida sin experiencias:** `#sin-experiencias` dice «Todavía no has publicado experiencias.» junto a la tarjeta «+», y desaparece al crear la primera.
- **`personas` antes de buscar:** `#ayuda-busqueda` dice «Escribe parte de un nombre.» y se oculta tras la primera búsqueda.
- **Avisos de error:** los ocho avisos que no lo tenían llevan `role="alert"` (`index`, `registro`, `bienvenida` ×2, `perfil` ×2, `usuario` y `experiencia`).
- **`usuario.html`** no enseña datos de relleno («0 amigos · 0 seguidores», foto vacía) hasta que llega el perfil.
- `listaConCargarMas` cuenta como elementos solo los que llevan `data-id-elemento`. Las tarjetas de la bienvenida creadas o editadas a mano también lo llevan.
- Nuevo `backend/tests/frontend/estados.test.js` (22 pruebas). `frontend.md`, `inventario-pantallas.md` y `diseno.md` reflejan los cambios.

### Decisiones
#### Un texto «Cargando…» común en lugar de un componente por página
- **Contexto:** cuatro pantallas con datos quedaban vacías mientras llegaban, y solo `experiencia` tenía estado de carga.
- **Decisión:** un `<p id="cargando" role="status">` en cada página y dos funciones comunes en `pantalla.js` que lo muestran y lo ocultan. La página con sesión lo oculta en un `finally`, así que también desaparece si la carga falla.
- **Alternativas:** una rueda de carga de Bootstrap o esqueletos de contenido; se descartaron porque añaden más HTML y estilo por página sin aportar información, y un texto con `role="status"` ya se anuncia a lectores de pantalla.
- **Consecuencias:** la apariencia final del texto se decidirá con la guía de estilo. Una página nueva que cargue datos debe llevar su `#cargando` y llamar a `ocultarCargando()`.
- **Decidió:** Flavia, a propuesta de Claude.

#### `usuario.html` oculta el contenido hasta que llega el perfil
- **Contexto:** la página mostraba «0 amigos · 0 seguidores» y la foto por defecto mientras cargaba, lo que es engañoso si luego la persona tiene 30 amigos.
- **Decisión:** el contenedor `#perfil-usuario` parte oculto y se muestra cuando el perfil llega y no es el propio. El aviso «Usuario no encontrado» y la redirección al propio perfil siguen igual.
- **Alternativas:** dejar los datos de relleno visibles con «Cargando…» encima; se descartó porque mezcla información falsa con el aviso de carga.
- **Consecuencias:** la página queda en blanco, con «Cargando…», un instante más largo en conexiones lentas.
- **Decidió:** Flavia, a propuesta de Claude.

#### Una lista está vacía cuando no tiene elementos propios
- **Contexto:** la rejilla de la bienvenida contiene la tarjeta «+», así que `listaConCargarMas` nunca la veía vacía.
- **Decisión:** contar solo los hijos con `data-id-elemento`. Para que las tarjetas creadas o editadas a mano cuenten, también llevan ese atributo.
- **Alternativas:** sacar la tarjeta «+» fuera de la rejilla, que cambiaría su diseño; o comprobar el vacío a mano en la bienvenida, que duplicaba la regla.
- **Consecuencias:** además, una experiencia recién creada ya no se repite si luego se pulsa «Cargar más».
- **Decidió:** Flavia, a propuesta de Claude.

#### `role="alert"` en el HTML y una prueba que lo vigila
- **Contexto:** ocho avisos de error no se anunciaban a lectores de pantalla.
- **Decisión:** añadir el atributo a cada aviso y una prueba que revisa las nueve páginas: todo elemento cuyo `id` empieza por `error-` debe llevarlo.
- **Alternativas:** ponerlo desde `mostrarMensaje`; se descartó porque no cubre los avisos que se muestran por otro camino y porque la prueba sobre el HTML detecta cualquier aviso nuevo que lo olvide.
- **Consecuencias:** quien añada un aviso de error con ese prefijo debe incluir el rol, o la prueba fallará.
- **Decidió:** Flavia, a propuesta de Claude.

### Comprobación
- **Rojo:** se escribieron primero las 22 pruebas y fallaron 19, por no existir `#cargando`, `#sin-experiencias`, `#ayuda-busqueda` ni los `role="alert"`. Las 3 que ya pasaban son las páginas que sí tenían el rol (`recuperar`, `restablecer` y `personas`) y quedan como caracterización.
- **Verde:** los cambios mínimos hicieron pasar las 22. No hubo refactorización.
- `npm test`: 53 suites y 590 pruebas. `npm run test:cobertura`, con las pruebas de MySQL real: 68 suites y 651 pruebas, con 96,36 % de líneas y 94,95 % de ramas, por encima de los mínimos.
- No se ha comprobado el aspecto en un navegador con los textos nuevos ni con un lector de pantalla real.

### Para quien continúe
- Una página nueva que cargue datos necesita su `<p id="cargando" role="status">` y llamar a `ocultarCargando()` al terminar.
- Un aviso de error nuevo debe tener un `id` que empiece por `error-` y `role="alert"`.

### Pendiente
- «Útil» y «Reportar» siguen sin guardar nada: dependen de CS-02 y CS-04, que son de otras historias. Es la única laguna abierta del inventario.

## CS-65: inventario de las nueve pantallas (objetivo 5)

**Autor:** Flavia Méndez Tsutsumi, con Claude Code (Claude Sonnet 5.5)
**Historia:** CS-65, objetivo 5 (inventario de las nueve pantallas con sus estados y flujos, a partir de `frontend.md`, la identidad visual y el sitemap). Con él se cierra el trabajo de la historia: según Flavia, los objetivos 1 a 4 están dados por buenos.

### Cambios
- Nuevo `documentacion/inventario-pantallas.md` con cinco apartados: las nueve pantallas con su esquema, una matriz de estados (cargando, vacío, error y «Contenido no disponible», más los propios de cada pantalla), los flujos tomados del sitemap, los componentes de la guía de estilo y el botón principal de cada pantalla, y las lagunas detectadas.
- `README.md` y `documentacion/diseno.md` enlazan el documento.

### Decisiones
#### El inventario se hace revisando el código, no copiando la documentación
- **Contexto:** el objetivo pide los estados de cada pantalla «a partir de `frontend.md`». Ese documento describe cómo está hecho hoy, pero no dice qué estados faltan.
- **Decisión:** partir de `frontend.md` y el sitemap, y comprobar cada estado en el HTML y el JavaScript de cada pantalla. En el inventario cada estado se marca como existente (✔), ausente (✗) o no aplicable (—).
- **Alternativas:** resumir `frontend.md` sin revisar el código; se descartó porque habría dado por hecho estados que no existen y no habría encontrado las lagunas.
- **Consecuencias:** el inventario recoge cinco lagunas que el diseño ya contempla y que hay que implementar: no hay estado «Cargando» salvo en `experiencia`, la bienvenida vacía no explica nada, `personas` no tiene texto antes de buscar, cuatro pantallas no anuncian sus errores a lectores de pantalla, y «Útil» y «Reportar» no guardan nada.
- **Decidió:** Flavia, a propuesta de Claude.

#### Un documento propio, no un apartado de `frontend.md`
- **Contexto:** el inventario compara lo que hay con lo diseñado; `frontend.md` describe solo lo que hay.
- **Decisión:** `inventario-pantallas.md` como documento propio, enlazado desde `frontend.md`, `diseno.md` y el README, sin duplicar los diagramas de estados que ya están en `frontend.md`.
- **Alternativas:** ampliar `frontend.md`; se descartó para no mezclar la descripción del estado actual con las propuestas.
- **Consecuencias:** cuando cambie una pantalla hay que actualizar dos documentos, `frontend.md` y este; la sección «Para quien continúe» lo recuerda.
- **Decidió:** Flavia, a propuesta de Claude.

### Comprobación
- No hay código nuevo, así que no hay ciclo rojo, verde y refactorización.
- Estados revisados en las nueve páginas con `grep` sobre su HTML y su JavaScript, y comprobados a mano los textos de «Cargando experiencia…», «Creando cuenta…», «Subiendo foto…», «No se ha especificado ninguna experiencia.» y el botón de cada formulario. Flujos comparados con las flechas de `sitemap.mmd`.
- No se ha abierto cada pantalla en el navegador para comprobar los estados: es una revisión del código.
- Los enlaces del documento apuntan a archivos existentes y `npm test` sigue en verde.

### Para quien continúe
- Al añadir o cambiar una pantalla, actualizar las tablas de este documento, su esquema en `documentacion/diseno/` y su flecha en el sitemap.
- Cuando se implemente un estado de la sección de lagunas, cambiar su ✗ por ✔ en la matriz de estados.

### Pendiente
- Implementar las cinco lagunas, que forma parte de la historia de implementación del diseño.
- Marcar el objetivo 5 en el libro de historias, y la historia como terminada cuando todos sus objetivos lo estén.

## CS-65: guía de estilo e identidad visual (arte.md)

**Autor:** Flavia Méndez Tsutsumi, con Claude Code (Claude Sonnet 5.5)
**Historia:** CS-65, objetivo 3 (identidad visual y guía de estilo). La tarjeta del libro sitúa la guía en `diseno.md`; aquí está en `arte.md` (ver la decisión de los dos archivos).

### Cambios
- `documentacion/arte.md` pasa de esqueleto vacío a **propuesta completa**: identidad, reglas de consistencia, paleta con sus variables CSS y el contraste calculado de cada par, tipografía, espaciado, bordes, componentes base (botones, campos, tarjeta, barras de navegación, avisos, lista con «Cargar más», etiquetas de visibilidad, diálogo, anillo de foco e iconos), tono de los textos y qué cambia respecto a hoy.
- Nuevo `documentacion/diseno/guia-estilo.svg`: lámina con los colores, la escala tipográfica y los componentes dibujados.
- `documentacion/diseno.md` indica que el equipo ha dado por buenos los esquemas y enlaza la guía. El README describe `arte.md` como propuesta para aprobar.

### Decisiones
#### Paleta: un verde azulado como único color principal
- **Contexto:** hoy PlanB usa los colores por defecto de Bootstrap. Con ellos, algunos textos y botones cumplen el contraste AA solo justo (4,50:1 y 4,53:1) y el borde de los campos de formulario no llega al 3:1 exigido (da 1,49:1).
- **Decisión:** principal `#0F766E` (verde azulado, asociado a ciudad y mapas), neutros grises, un color por significado (peligro, éxito, aviso e información) y un azul solo para el foco del teclado. Todos los pares se calcularon con la fórmula de WCAG: ninguno falla y el menor margen es 4,83:1 en el borde de campo y 4,97:1 en texto sobre superficie.
- **Alternativas:** mantener los colores de Bootstrap (se descartó por el contraste justo y el borde de campo, que incumple); un azul como el de Bootstrap (se descartó porque no da identidad propia).
- **Consecuencias:** al aplicarla hay que sustituir los colores de Bootstrap por estas variables. El color nunca es la única señal: lo activo lleva además línea y negrita, y los avisos, siempre texto.
- **Decidió:** Flavia, delegando la elección en Claude; el equipo la aprueba (es el objetivo 3).

#### Fuente del sistema y escala tipográfica fija
- **Contexto:** la guía debe fijar la tipografía y los tamaños.
- **Decisión:** pila de fuentes del sistema, cuerpo de 16 px con interlineado 1,5 y escala 28 / 22 / 18 / 16 / 14 px, solo en peso normal y negrita.
- **Alternativas:** una fuente descargada de un servicio externo; se descartó porque añade una dependencia, retrasa la carga y no se ha comprobado que la política de seguridad de la aplicación la permita.
- **Consecuencias:** el aspecto cambia un poco según el dispositivo, a cambio de carga inmediata y cero dependencias.
- **Decidió:** Flavia, delegando la elección en Claude; el equipo la aprueba.

#### Un solo estilo de borde redondeado y sin sombras
- **Contexto:** el equipo pidió consistencia; no tiene sentido que unos botones sean rectos y otros redondeados.
- **Decisión:** radio de 8 px en botones y campos, 12 px en tarjetas y diálogos, píldora en las etiquetas y sin sombras (solo un borde superior en la barra inferior del móvil).
- **Alternativas:** bordes rectos; se descartaron porque resultan más duros y no encajan con una red social. Sombras para dar profundidad; se descartaron para mantener la interfaz plana y ligera.
- **Consecuencias:** en la implementación hay que unificar los radios, hoy mezclados.
- **Decidió:** Flavia, delegando la elección en Claude; el equipo la aprueba.

#### Sin biblioteca de iconos
- **Contexto:** la tarjeta menciona iconos entre lo que debe fijar la guía.
- **Decisión:** no incorporar ninguna biblioteca. Los pocos iconos necesarios serán SVG en línea de 24 px y trazo de 2 px, siempre con su texto.
- **Alternativas:** una biblioteca de iconos; se descartó porque `AGENTS.md` pide no añadir dependencias sin una necesidad clara y la interfaz funciona con texto.
- **Consecuencias:** la barra inferior puede llevar solo texto o texto con un icono sencillo.
- **Decidió:** Flavia, delegando la elección en Claude; el equipo la aprueba.

### Comprobación
- No hay código nuevo, así que no hay ciclo rojo, verde y refactorización.
- Se calcularon 23 pares de color con la fórmula de contraste de WCAG: cumplen todos los exigibles. La lámina se revisó a la vista y se corrigieron textos de avisos más largos que su caja y una barra que casi tocaba otro elemento.
- El navegador integrado no abrió `guia-estilo.svg`, así que se revisó desde una copia mostrada en la conversación; el archivo es XML válido.

### Para quien continúe
- Aprobada la guía, se aplica a todas las pantallas a la vez en la historia de implementación, empezando por la bienvenida como página piloto.
- Las variables CSS de `arte.md` son propuestas: cómo se montan sobre Bootstrap se decide en esa historia.

### Pendiente
- Que el equipo apruebe la guía (objetivo 3).
- No se ha comprobado la apariencia real con estos colores en el navegador: solo hay láminas dibujadas.
- Cambiar en el libro de historias la ruta de la guía de estilo (de `diseno.md` a `arte.md`).

## CS-65: esquemas de las nueve pantallas, navegación en móvil y requisitos mínimos de diseño

**Autor:** Flavia Méndez Tsutsumi, con Claude Code (Claude Sonnet 5.5)
**Historia:** CS-65, objetivo 2 (bocetos y wireframes para móvil y escritorio, incluida la navegación en móvil)

### Cambios
- Siete esquemas SVG nuevos en `documentacion/diseno/`, en blanco y negro, en móvil (375 px) y escritorio (1280 px): `index.svg`, `registro.svg`, `recuperar.svg`, `restablecer.svg`, `bienvenida.svg` (con el diálogo de crear y editar), `experiencia.svg` y `navegacion-movil.svg`.
- Con los cuatro del 25/10 (`usuario-a`, `usuario-b`, `perfil` y `personas`) están dibujadas las nueve pantallas de PlanB.
- `navegacion-movil.svg` se rehace con la propuesta recomendada (barra inferior en móvil y barra superior desde 768 px), con sus medidas y reglas, y la alternativa descartada.
- Los esquemas de las pantallas con sesión (`bienvenida`, `perfil`, `personas`, `experiencia` y `usuario`) llevan ahora la barra inferior en su versión móvil en lugar del icono ≡, con la sección activa marcada.
- Nuevo `usuario.svg`: combina la variante A en móvil y la B en escritorio. `usuario-a.svg` y `usuario-b.svg` se conservan como alternativas.
- `documentacion/diseno.md` enlaza cada esquema desde su sección, con la idea, los estados y los enlaces del sitemap, y añade la sección «Requisitos mínimos de un buen diseño de frontend»: 11 requisitos, cómo los cumple el diseño y en qué estado está el código hoy.
- `documentacion/arte.md` recoge los dos datos de contraste que condicionan la paleta.
- `index.svg` añade una frase de presentación sobre el título del inicio de sesión (texto de ejemplo) y convierte «Crear cuenta» en un botón secundario visible.

### Decisiones
#### Navegación en móvil: barra inferior fija
- **Contexto:** el objetivo pide diseñar la navegación en móvil y su adaptación al escritorio. Hoy la barra superior lleva tres enlaces que en móvil no caben bien. El JavaScript de Bootstrap está bloqueado por la política de seguridad, así que un menú desplegable de Bootstrap no es una opción.
- **Decisión:** barra fija abajo con Inicio, Buscar y Perfil en móvil (menos de 768 px) y barra superior con los tres enlaces desde 768 px. La sección activa se marca con una línea gruesa y negrita, no solo con color, y el enlace lleva `aria-current="page"`. Cada zona mide al menos 44 × 44 px y la barra, 56 px de alto, y respeta la zona segura del móvil. Solo aparece en las cinco pantallas con sesión.
- **Alternativas:** menú ≡ desplegable con `<details>`. Se descartó porque esconde la navegación (hace falta un toque más para verla) y los tres destinos ya caben abajo. Se conserva dibujado como alternativa.
- **Consecuencias:** el contenido necesita un margen inferior igual a la altura de la barra. Afecta a las cinco pantallas con sesión y a `styles.css`. Las páginas de acceso no la llevan.
- **Decidió:** Flavia, delegando la elección en Claude; la recomendación es de Claude y el equipo la confirma en la revisión conjunta.

#### `usuario.html`: combinar las variantes A y B
- **Contexto:** había dos variantes: A (cabecera centrada) y B (persona en una tarjeta lateral fija en escritorio).
- **Decisión:** una sola maqueta que se adapta: la cabecera centrada y las experiencias apiladas en móvil (A), y la tarjeta lateral fija con las experiencias a la derecha en escritorio (B).
- **Alternativas:** quedarse con A o con B en los dos tamaños; se descartó porque la tarjeta lateral no aprovecha bien una pantalla estrecha y la cabecera centrada desaprovecha la anchura del escritorio.
- **Consecuencias:** `usuario.html` necesitará una cuadrícula de dos columnas desde 768 px. Las variantes originales quedan como referencia.
- **Decidió:** Flavia, delegando la elección en Claude; el equipo la confirma.

#### Revisar el diseño con una lista de requisitos mínimos
- **Contexto:** Flavia pidió asegurarse de que el diseño cumple los mínimos de un buen frontend.
- **Decisión:** fijar 11 requisitos, basados en WCAG 2.2 nivel AA y buenas prácticas, y comprobar contra ellos tanto los esquemas como el código actual. Se calculó el contraste con la fórmula de WCAG y se revisó el HTML con la herramienta `grep`.
- **Alternativas:** limitarse a dibujar los esquemas; se descartó porque dejaba sin señalar los fallos que ya tiene el código y que el diseño debe corregir.
- **Consecuencias:** quedan documentadas cinco correcciones para la historia de implementación: nombre y `aria-current` en la barra, enlace «Saltar al contenido», `role="alert"` en los avisos, borde de campos con contraste 3:1 y botones de 44 px en móvil.
- **Decidió:** Flavia, a propuesta de Claude.

#### Sin landing page: frase de presentación en el inicio de sesión
- **Contexto:** `index.html` es el inicio de sesión y quien llega no sabe qué es PlanB. El equipo planteó una landing page con una explicación y el botón de iniciar sesión arriba a la derecha. El libro de historias cubre las nueve pantallas actuales y ningún criterio pide una página nueva.
- **Decisión:** no crear una landing page. El inicio de sesión lleva una frase de presentación sobre el título, tomada de la descripción del README (texto de ejemplo: «Comparte y descubre planes por tu ciudad»), y mantiene el enlace «Crear cuenta».
- **Alternativas:** una landing completa; se descartó porque sería una décima pantalla con su diseño, su implementación y sus pruebas, sin ningún criterio que la exija, y el alcance de la práctica son las nueve pantallas. No añadir ninguna presentación; se descartó porque quien llega no sabría qué es la aplicación.
- **Consecuencias:** el sitemap no cambia. Si sobra tiempo, la landing puede añadirse después como mejora opcional. El texto definitivo de la frase lo decide el equipo.
- **Decidió:** Flavia, delegando la elección en Claude; el equipo la confirma.

#### Dos archivos: diseno.md (estructura) y arte.md (guía de estilo)
- **Contexto:** la tarjeta del objetivo 3 del libro sitúa la guía de estilo en `documentacion/diseno.md`, mientras que el equipo planteó dos archivos, uno de diseño y otro de arte.
- **Decisión:** mantener dos archivos. `diseno.md` recoge la estructura de las pantallas (objetivo 2) y `arte.md`, la guía de estilo (objetivo 3).
- **Alternativas:** un solo `diseno.md` con las dos partes, para no tocar la tarjeta; se descartó porque la estructura y el estilo se aprueban en momentos distintos y con criterios distintos, y mezclarlos obligaría a reabrir uno cada vez que se cambia el otro.
- **Consecuencias:** hay que cambiar en el libro de historias la ruta de la guía de estilo del objetivo 3, de `documentacion/diseno.md` a `documentacion/arte.md`. Si el equipo prefiere un solo archivo, `arte.md` pasa a ser un apartado de `diseno.md`.
- **Decidió:** Flavia, delegando la elección en Claude; el equipo la confirma.

#### Criterio de público joven para las decisiones de diseño
- **Contexto:** la aplicación se dirige a un público joven y universitario, que usa sobre todo el móvil, espera hacer las cosas en pocos pasos y conoce patrones de otras redes sociales.
- **Decisión:** se confirman con ese criterio la barra de navegación inferior en móvil, la cabecera de perfil con foto, contadores y botones de `usuario.html`, y la ausencia de landing page. Como consecuencia, «Crear cuenta» pasa de enlace de texto a botón secundario visible en el inicio de sesión. La guía añade el público como parte de la identidad.
- **Alternativas:** una landing page con más presentación, que alargaría el camino hasta registrarse; se descartó por alcance y por ese mismo motivo. Un registro más corto: no se estudia aquí, porque los requisitos de la contraseña y el CAPTCHA se fijaron en CS-59 y CS-64.
- **Consecuencias:** el inicio de sesión tiene dos acciones claras: «Entrar» (principal) y «Crear cuenta» (secundaria). Un modo oscuro, habitual en este público, queda como mejora opcional futura, sin implementar ahora.
- **Decidió:** Flavia, delegando la elección en Claude; el equipo la confirma.

#### Dibujar también las pantallas que tienen otro responsable
- **Contexto:** el reparto del equipo asigna cada pantalla a una persona (la bienvenida, a Matthew) y los esquemas se dibujan primero a mano, en papel.
- **Decisión:** completar las nueve pantallas con propuestas de Flavia a partir de `frontend.md` y el sitemap, marcadas como propuesta y sustituibles por el dibujo de quien tenga cada pantalla.
- **Alternativas:** dibujar solo las pantallas de Flavia; se descartó porque dejaba sin cubrir el objetivo 2 completo.
- **Consecuencias:** no son dibujos a mano de cada persona, que es lo que describe el reparto; si alguien dibuja la suya, sustituye a la propuesta.
- **Decidió:** Flavia, a propuesta de Claude.

### Comprobación
- No hay código nuevo, así que no hay ciclo rojo, verde y refactorización.
- Los doce SVG son XML válido (`xmllint`) y solo usan `#000` y `#fff`. Se revisaron a la vista: se corrigió el diálogo de la bienvenida, que se solapaba con el marco del móvil al alargarlo por la barra inferior, y dos notas largas que se salían del lienzo.
- Contraste calculado con los colores por defecto de Bootstrap: textos y botones cumplen AA (algunos con 4,50 y 4,53 frente al mínimo de 4,5) y el borde de los campos de formulario (`#ced4da`) da 1,49:1, por debajo del 3:1 exigido a los componentes de interfaz.
- Revisión del HTML de las nueve páginas: todas tienen `lang`, `viewport`, un `h1`, `main` e imágenes con `alt`; ninguna tiene `aria-current`, ningún `nav` tiene `aria-label`, no hay enlace «Saltar al contenido» y cuatro páginas no tienen ningún aviso con `role="alert"`.
- `npm test` desde `backend/` no se ha vuelto a ejecutar porque no hay código nuevo.

### Pendiente
- Aprobadas por Flavia el 26/10/2026, y reflejadas en los esquemas que el equipo dio por buenos: barra inferior en móvil, combinación de `usuario.html` y no crear landing page (con frase de presentación).
- Sigue pendiente decidir si se mantienen dos archivos de documentación: es la única recomendación que contradice algo ya escrito, porque la tarjeta del objetivo 3 del libro sitúa la guía en `diseno.md`.
- Cambiar en el libro de historias la ruta de la guía de estilo del objetivo 3 (de `diseno.md` a `arte.md`); lo edita quien tenga el libro.
- No está dibujado el diálogo de «Reportar» de `experiencia.html`.
- Los esquemas son propuestas generadas a partir de la documentación, no dibujos a mano de cada persona.
- Todo el contenido de `arte.md` sigue sin decidir, salvo los dos datos de contraste.
- Aplicar el diseño y corregir los cinco puntos de accesibilidad es trabajo de la historia de implementación.
- El objetivo 2 del libro de historias no debe marcarse como finalizado hasta que el equipo revise los esquemas.

# 2026-10-25

## CS-65: borradores de diseño y arte, y esquemas de las pantallas sociales

**Autor:** Flavia Méndez Tsutsumi, con Claude Code (Claude Sonnet 5.5)
**Historia:** CS-65, aportación a los objetivos 3 y 4 (borrador, sin cerrar) *(numeración de esa fecha; tras reordenarse el libro son los objetivos 2 y 3)*

### Cambios
- Nuevo `documentacion/diseno.md`: estructura de las pantallas. Explica cómo se lee un esquema, las reglas que lo condicionan, los elementos comunes y una sección por pantalla con responsable, esquemas, estados y enlaces del sitemap. Termina con las decisiones abiertas.
- Nuevo `documentacion/arte.md`: cómo debe verse PlanB. Tiene las reglas de consistencia y las tablas de paleta, tipografía y componentes **vacías a propósito**, porque el equipo aún no ha decidido nada.
- Nueva carpeta `documentacion/diseno/` con cuatro esquemas en blanco y negro, en móvil (375 px) y escritorio (1280 px): `usuario-a.svg`, `usuario-b.svg` (dos variantes para elegir), `perfil.svg` y `personas.svg`.
- `README.md` enlaza los dos documentos nuevos.

### Decisiones
#### Separar la estructura (diseno.md) del aspecto (arte.md)
- **Contexto:** el equipo quiere que todas las pantallas sean consistentes y que los esquemas en blanco y negro no se mezclen con decisiones de color o de forma. La tarjeta del libro de historias habla de un único `diseno.md` con la guía de estilo.
- **Decisión:** dos archivos: `diseno.md` para la colocación de los elementos y `arte.md` para colores, tipografía, bordes y componentes. Los nombres son provisionales.
- **Alternativas:** un solo `diseno.md`, como dice la tarjeta; no se eligió porque mezcla estructura y estilo, que se deciden en momentos distintos.
- **Consecuencias:** hay que acordar con el equipo si se mantienen dos archivos y cómo se llaman. Si se vuelve a uno solo, `arte.md` pasa a ser un apartado de `diseno.md`.
- **Decidió:** Flavia, a propuesta de Claude, a falta de que el equipo lo confirme.

#### Esquemas como SVG en blanco y negro dentro del repositorio
- **Contexto:** los esquemas se dibujan primero a mano y luego hay que guardarlos de forma que todo el equipo los vea y los revise.
- **Decisión:** SVG (vectorial, texto editable y versionable en Git) con solo negro y blanco, en `documentacion/diseno/`. Sin colores ni imágenes, para hablar solo de la colocación.
- **Alternativas:** capturas en PNG (no se pueden editar ni comparar bien en Git) o una herramienta externa de diseño (obligaría a todos a tener cuenta y los esquemas no vivirían junto al código).
- **Consecuencias:** los SVG se editan como texto o se regeneran; los colores, cuando se decidan, irán en `arte.md` y no en los esquemas.
- **Decidió:** Flavia, a propuesta de Claude.

### Comprobación
- No hay código nuevo, así que no hay ciclo rojo, verde y refactorización.
- Los cuatro SVG son XML válido (`xmllint`) y solo usan los colores `#000` y `#fff`. Se abrió `perfil.svg` en el navegador y se vio bien.
- Se comprobó que los enlaces de `diseno.md` y `arte.md` apuntan a archivos que existen. En Git el sitemap se llama `sitemap.mmd`, en minúscula.

### Para quien continúe
- Para añadir un esquema: dibujarlo en papel, pasarlo a SVG en `documentacion/diseno/` con el mismo estilo (solo negro y blanco) y enlazarlo desde su sección de `diseno.md`.
- Cuando el equipo decida un color, una forma de borde o una fuente, se apunta en `arte.md` antes de usarlo en las pantallas.

### Pendiente
- Elegir entre las variantes A y B de `usuario.html` en la revisión conjunta.
- Decidir si hay una landing page antes del inicio de sesión (hoy `index.html` es el login), si la barra de navegación en móvil va abajo o arriba, y si los archivos son dos o uno.
- Esquemas del resto de pantallas: `index`, `registro`, `recuperar`, `restablecer`, `bienvenida` (la hace Matthew) y `experiencia`. Los de Flavia son todavía una propuesta, no un dibujo a mano suyo.
- Todo el contenido de `arte.md`: paleta con contraste AA, tipografía y componentes.

# 2026-10-16

## CS-65: sitemap de páginas y navegación

**Autor:** Matthew Puente Villegas Michavil, con Codex (GPT-6)
**Historia:** CS-65, objetivo 2

### Cambios
- Nuevo `documentacion/sitemap.mmd` con las nueve páginas actuales de PlanB, agrupadas en acceso y páginas con sesión, y sus enlaces y redirecciones.
- `documentacion/frontend.md` enlaza el sitemap como referencia en lugar de duplicar el diagrama. Explica la navegación común, el retorno por sesión no válida y los parámetros de las URL.
- Interacción y acuerdos registrados en `documentacion/prompts/matthew.md`.

### Decisiones
#### Un sitemap centrado en páginas y navegación
- **Contexto:** Matthew aportó un dibujo de su exploración manual para preparar el diseño visual de CS-65 y pidió convertirlo en Mermaid. El frontend ya tenía un mapa de navegación en su documentación.
- **Decisión:** representar solo las nueve páginas implementadas y sus recorridos; omitir parámetros de URL en las cajas y expresar la barra común y la sesión no válida mediante notas. Conservar una sola fuente del mapa en `sitemap.mmd`, enlazada desde `frontend.md`.
- **Alternativas:** incluir acciones internas como bucles; mostrar los parámetros en las cajas; conectar grupos completos; mantener otro mapa en Markdown. Se descartaron para reducir ruido visual, puntos de conexión confusos y duplicación documental.
- **Consecuencias:** los formularios, diálogos y estados internos siguen documentados en `frontend.md` y `flujos.md`. Quien añada una página o cambie su navegación deberá actualizar el sitemap y sus notas.
- **Decidió:** Matthew, a propuesta de Codex, tras revisar y ajustar dos bocetos.

### Comprobación
- Contrastadas las páginas y los recorridos con los HTML y scripts actuales: acceso, recuperación por correo, perfiles y detalle de experiencias.
- Comprobados los archivos representados y el enlace local al sitemap; `git diff --check` sin errores de espacios.
- TDD y batería de la aplicación no aplican: solo cambia documentación. El boceto Mermaid se revisó en la conversación; el archivo final queda pendiente de comprobar en un visor Mermaid, ya que no hay un renderizador instalado en este entorno.

# 2026-10-10

## Libro de historias: entregas, tiempos por persona e historias de la entrega 3

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** sin historia (feedback de la entrega 2)

### Cambios
- **Libro online:**
  - hoja «Tiempos», detrás del Índice, con la tabla «Entregas» (E1 «Acceso y perfil», E2 «Círculo social» y E3 «Parte visual y BBDD online», sin fechas) y las horas de cada persona por entrega, más «Otros» y «Total»;
  - columna «Entrega» en el Índice (H), con desplegable. E1: CS-47, CS-49, CS-57, CS-59 y CS-60. E2: CS-01, CS-22, CS-30, CS-44, CS-45, CS-48, CS-61, CS-62, CS-63, CS-64 y CS-68. E3: CS-65, CS-66, CS-67 y CS-69;
  - la ayuda de «Plantilla» y de las 64 páginas (A14) incluye la guía de macrotareas;
  - historias nuevas: CS-65 «Diseño visual de PlanB» (4 objetivos), CS-66 «Aplicar el diseño al frontend» (5) y CS-67 «Migrar la base de datos a online» (3), sin responsable ni tiempo estimado;
  - CS-60 se queda con sus objetivos de E1. Los objetivos 3 a 5 pasan a CS-68 «Organización interna · E2» y el 6, a CS-69 «Organización interna · E3», con su responsable y sus tiempos;
  - correcciones según Git, sin tocar tiempos: CS-30, objetivos 5 a 10 hechos (Matthew el 5 y el 6, Joaquín del 7 al 10); CS-63, objetivos 1 a 11 hechos (José donde no había responsable); CS-44, dos objetivos hechos por Joaquín, que no tenía ninguno.
- **Repositorio:** `documentacion/office-scripts/prepararEntregas.ts`; `metodologia.md` §3.1 (columna «Entrega» y hoja «Tiempos»), §3.3 (entrega nueva e historias de organización por entrega), §3.4 nueva «Cómo escribir los objetivos» y §3.5; `AGENTS.md` §3; `README.md`; entrada de esta tarea en `prompts/joaquin.md`.

### Decisiones
#### La entrega se asigna por historia
- **Contexto:** el feedback de la entrega 2 pide «Tiempos totales por entregas» y ver el trabajo de cada integrante en cada una.
- **Decisión:** columna «Entrega» en el Índice; las horas de una persona en una entrega suman sus objetivos de las historias de esa entrega.
- **Alternativas:** una entrega por objetivo, exacta aunque una historia cruce entregas, pero con un dato más que rellenar en cada objetivo.
- **Consecuencias:** una historia que cruce entregas cuenta entera en una. Por eso la organización interna va en una historia por entrega.
- **Decidió:** Joaquín (Claude había propuesto la entrega por objetivo).

#### Entregas sin fechas
- **Contexto:** las fechas de las entregas pueden ir variando.
- **Decisión:** cada entrega tiene solo su orden (E1, E2…) y un nombre.
- **Alternativas:** fechas de inicio y fin en cada entrega, que según Joaquín solo añaden carga.
- **Consecuencias:** ninguna fórmula depende de fechas.
- **Decidió:** Joaquín.

#### Horas por persona en una hoja aparte
- **Contexto:** hacía falta ver el tiempo de cada persona por entrega.
- **Decisión:** hoja «Tiempos» con la tabla persona × entrega, más el filtro de la columna «Entrega» del Índice para ver las historias de una entrega.
- **Alternativas:** un bloque en el Índice con un desplegable para elegir la entrega, o las dos cosas a la vez.
- **Consecuencias:** se ven todas las entregas a la vez. Las fórmulas recorren las páginas con `INDIRECT`, como el Tiempo total del Índice.
- **Decidió:** Joaquín, a propuesta de Claude.

#### Una historia de organización interna por entrega
- **Contexto:** CS-60 tenía objetivos de E1 (metodología y libro), de E2 (asignación de tareas) y de E3 (alcance de la entrega 3), y con la entrega por historia contaría entera en una.
- **Decisión:** CS-60 se queda en E1 y sus objetivos de E2 y E3 pasan a CS-68 y CS-69.
- **Alternativas:** una columna «Entrega» opcional en los objetivos que mandara sobre la de la historia, o CS-60 entera en una entrega.
- **Consecuencias:** cada entrega nueva tiene su «Organización interna · EX».
- **Decidió:** Joaquín.

#### Objetivos como macrotareas
- **Contexto:** el feedback de la entrega 2 pide «más macrotareas que microtareas». Por ejemplo, CS-61 se planificó en 16 objetivos, uno por modelo, repositorio, ruta o tipo de prueba.
- **Decisión:** de 3 a 6 objetivos por historia, cada uno un resultado comprobable de 1 a 4 horas que incluye sus pruebas; nunca uno por capa, archivo o paso de TDD.
- **Alternativas:** ninguna registrada.
- **Consecuencias:** `AGENTS.md` pide a los agentes seguir la guía. No se reescriben historias antiguas: ninguna de las pendientes tenía objetivos.
- **Decidió:** Joaquín, a propuesta de Claude (las cifras de la guía).

#### Historias nuevas para la entrega 3
- **Contexto:** el feedback de la entrega 2 pide migrar la base de datos a online y una historia nueva para la parte visual, porque el frontend es mínimo y solo muestra las funcionalidades.
- **Decisión:** CS-65 cierra el diseño (inventario, wireframes, guía de estilo y maquetas), CS-66 lo aplica a las 9 pantallas y CS-67 migra la base de datos. Las tres van en E3, sin responsable ni estimación: los pone quien se ofrezca.
- **Alternativas:** dejar CS-66 para una entrega posterior.
- **Consecuencias:** el criterio de CS-67 obliga a que las pruebas con MySQL sigan usando la base local, porque borran datos.
- **Decidió:** Joaquín, a propuesta de Claude.

### Comprobación
- Las horas por persona y entrega se recalcularon en Python sobre una exportación del libro descargada el 10/10. «Tiempos» dio los mismos valores antes y después de mover los objetivos de CS-60 (al final, E1 9,63 h, E2 13,59 h y E3 0,83 h).
- Un script de solo lectura confirmó los estados y objetivos de CS-30, CS-44, CS-60, CS-63 y CS-65 a CS-69, y las 20 historias con entrega (5 en E1, 11 en E2 y 4 en E3).
- Revisión visual del Índice, de «Tiempos» y de CS-65. «Crear páginas» creó CS-65 a CS-69 con la columna nueva en el Índice.

### Para quien continúe
- Al crear una historia, elegir su «Entrega» en el Índice: sin ella, sus horas no aparecen en «Tiempos».
- Poner Responsable y Tiempo total en cada objetivo terminado: sin responsable, sus horas van a «Otros».

### Pendiente
- Tiempo total de CS-30 (objetivos 6 a 10), CS-63 (1 a 11) y CS-44 (1 y 2): los pone quien hizo cada objetivo.
- 6,38 h de E1 en «Otros»: objetivos sin responsable de CS-47, CS-49, CS-57 y CS-59.
- CS-63, objetivos 5 y 6: el responsable es Matthew, pero según Git los hizo José. No se ha cambiado.
- Responsable y estimación de CS-65, CS-66 y CS-67.

# 2026-10-09

## Registro de prompts: todas las entradas con los campos de la plantilla

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** sin historia

### Cambios
- `prompts/matthew.md`: «Decisiones y alcance» pasa a «Decisiones» y «Corrección relevante» a «Correcciones relevantes», en el orden de la plantilla. Los campos propios («Decisiones posteriores de Matthew», «Solicitud posterior de registro», «Restricciones relevantes», «Texto de contexto incluido en el mismo prompt») quedan como subapartado, con su nombre, dentro del campo de la plantilla que les corresponde. En la entrada del objetivo 16 de CS-61, el primer prompt de «Prompts relevantes» pasa a «Prompt inicial» y los otros dos a «Correcciones relevantes». Los campos que faltaban se añaden como «no registrado». El texto no cambia.
- `prompts/jose.md`: su reporte de implementación de CS-63 se conserva tal cual dentro de una entrada con los campos de la plantilla. Como el reporte no cita prompts, agente ni entorno, esos campos quedan como «no registrado».
- El resto de archivos ya seguían la plantilla.
- `prompts/joaquin.md`: entrada de esta tarea (libro de historias online y registro del trabajo con decisiones ADR).

## Registro diario: formato común y entradas anteriores reordenadas

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** sin historia

### Cambios
- Todo el archivo sigue la plantilla de la cabecera: un título `# AAAA-MM-DD` por día, de lo más reciente a lo más antiguo, y una sección `##` por tarea y autor. Antes había entradas con `#` y con `##`, fechas desordenadas (el 25/09 aparecía debajo del 06/10 y el 07/10 al final) y secciones con nombres distintos según el autor («Qué se ha hecho», «Qué hace esto», «Archivos que he tocado», «Cambios realizados»…).
- Las entradas que reunían varias tareas se dividen en una sección por tarea; las de un mismo autor, tarea y día se juntan en una.
- Las historias se citan como CS-XX, con el código antiguo entre paréntesis (LUC01 → CS-49, LUC09 → CS-57, FLA05 → CS-47 y MAT16 → CS-59, según la tabla de la entrada del 02/10).
- Cada sección indica su autor y sus commits, sacados de `git blame` (sin contar `bcddd0f`, que reescribió el archivo entero el 08/10 al cambiar los finales de línea) y de `git log`. El agente figura solo si consta en el registro de prompts de su autor.
- Las secciones «Decisiones tomadas» que ya existían (metodología del 02/10, CS-45 y CS-49) pasan al formato ADR con el mismo texto.
- La entrada de Matthew titulada «CS-48: valoraciones de amigos y seguidores» (06/10) describía `obtenerExperiencia` y su commit es `14f459f` «CS-30 Tarea 4» del 07/10: se mueve a su sección de CS-30 de ese día. Así deja de haber dos entradas con el mismo título de CS-48.

### Decisiones
#### Reordenar sin añadir lo que no está escrito
- **Contexto:** Joaquín pidió que cualquier persona o agente pueda saber por qué se tomó una decisión o quién la tomó, también en las entradas anteriores.
- **Decisión:** se cambia solo el formato. El autor y los commits salen de Git, y una decisión se escribe solo si la entrada o el commit ya contaban su motivo; si no, el cambio queda en «Cambios» sin decisión.
- **Alternativas:** poner en todas las tareas una sección de decisiones con «no registrado» donde no hubiera fuente; se descartó porque llenaba el registro de huecos.
- **Consecuencias:** muchas tareas antiguas no tienen decisiones; las nuevas sí, porque `AGENTS.md` §9.1 lo pide.
- **Decidió:** Joaquín, a propuesta de Claude.

## Registro del trabajo con decisiones justificadas

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** sin historia · **Commits:** `9f6f75a`

### Cambios
- `AGENTS.md` §9 pasa a «Registro del trabajo»: el registro diario y el de prompts, con reglas comunes para cualquier persona o agente. Las decisiones se escriben en formato ADR en este archivo; la documentación técnica describe el sistema sin justificarlo. §8 y §10 remiten al registro diario.
- Plantilla del registro en la cabecera de este archivo; campo «Decisiones» en `prompts/plantilla.md`; el índice de prompts enlaza `jose.md` (antes, `integrante-6.md`, que no existe).
- `metodologia.md` §4.3, §5 y §8: el registro diario forma parte de la revisión y del criterio de finalización.

### Decisiones
#### Decisiones en formato ADR dentro de cada tarea
- **Contexto:** el registro contaba qué cambió y cómo se probó, pero casi nunca por qué ni quién lo decidió. Un agente o un compañero que no entendiera una decisión no tenía dónde encontrarla.
- **Decisión:** cada sección del registro lleva sus decisiones con contexto, decisión, alternativas, consecuencias y quién decidió. Un título por día en formato `AAAA-MM-DD`, lo más reciente arriba, y una sección por tarea y autor.
- **Alternativas:** un `decisiones.md` aparte con ADR numerados (D-001…), enlazados desde el registro; se descartó por tener dos archivos y el riesgo de que dos compañeros usen el mismo número. Fechas `DD/MM/AAAA` como antes; se eligió `AAAA-MM-DD`, igual que el registro de prompts.
- **Consecuencias:** cada tarea nueva escribe sus decisiones aquí y el registro de prompts solo las enlaza.
- **Decidió:** Joaquín, a propuesta de Claude.

#### La documentación técnica describe; el registro justifica
- **Contexto:** `arquitectura.md`, `api.md`, `flujos.md`, `frontend.md` y `glosario.md` describen el sistema tal como es, sin «usamos X y no Y».
- **Decisión:** siguen así; los motivos van en este registro.
- **Alternativas:** justificar cada sección importante dentro del propio documento técnico.
- **Consecuencias:** para saber por qué algo es así, se busca aquí por historia, archivo o título, o desde el código con `git blame`.
- **Decidió:** Joaquín.

## Libro de historias: la copia del repositorio queda obsoleta

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** sin historia · **Commits:** `6d59885`

### Cambios
- `AGENTS.md` §3, `metodologia.md` §3, `README.md` y `arquitectura.md`: la copia de `documentacion/customer-stories/Customer_Stories_PlanB.xlsx` está obsoleta y no se consulta. Los criterios se leen y los cambios se hacen en el libro online. Un agente con acceso a Excel para la web trabaja sobre él y confirma cada cambio con el integrante; los cambios en muchas celdas se hacen con un Office Script. Un agente sin acceso pide los criterios al integrante y entrega los cambios como una lista.

### Decisiones
#### Trabajar sobre el libro online, sin copias
- **Contexto:** el libro se edita a la vez en OneDrive y hacía falta que un agente trabajara en él en vivo, sin pasos de sincronización. Con la copia del repositorio, los cambios se entregaban como lista y había que pasarlos a mano.
- **Decisión:** el agente edita el libro en Excel para la web a través del navegador del integrante, y los cambios en muchas celdas se hacen con Office Scripts (pestaña «Automatizar»). La copia del repositorio queda obsoleta, pero no se borra.
- **Alternativas:** el conector de Microsoft 365, que solo permite buscar y leer; la API Microsoft Graph, que exige registrar una aplicación en Azure con permisos que la universidad suele bloquear; y pasar el libro a Google Sheets, que cambia la herramienta de todo el equipo.
- **Consecuencias:** un cambio del agente lo ve el equipo al momento, así que se confirma antes con el integrante. Un agente sin navegador sigue entregando una lista.
- **Decidió:** Joaquín, a propuesta de Claude.

## Documentación: API, flujos, pantallas y glosario

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** sin historia (plan de auditoría del 08/10, fase 2) · **Commits:** `01823e4`, `f949fde`, `874fe41`, `b0e9c96`, `54ba32c`, `b9473ac`, `46c7f6a`, `5d28ef8`, `22d43fe`, `97e1b2c`, `16c2a67`, `fb1cb1c`, `443023e`

### Cambios
- **`arquitectura.md`** al día, con diagramas Mermaid: contexto del sistema, capas y archivos por área, modelo de datos (ER) con sus restricciones, regla de visibilidad y mapa de pruebas.
- **Documentos nuevos** en `documentacion/`:
  - `api.md`: las 31 rutas, cada una con su servicio, lo que recibe, lo que devuelve y sus errores con el mensaje exacto;
  - `flujos.md`: diagramas de secuencia de 12 flujos (registro, login, foto, crear y editar, abrir una experiencia, valorar, amistad, seguir, «Cargar más», perfil de otro usuario, recuperar y cambiar la contraseña) y de estados de la amistad, la relación en `usuario.html`, la valoración y el enlace de recuperación;
  - `frontend.md`: mapa de navegación, archivos y llamadas de cada página, estados de una pantalla, módulos de `js/shared/`, reglas y pruebas de cada página;
  - `glosario.md`: los términos técnicos del proyecto, cada uno con dónde aparece en PlanB.
- **README:** estado por historias, comandos de pruebas, los documentos nuevos y dónde está el libro de historias: el que se usa es el de OneDrive; la copia de `documentacion/customer-stories/` es solo una guía y no se marca en ella ningún progreso.
- **AGENTS.md:** piezas compartidas que hay que reutilizar (`leerId`, paginación, contraseñas, `USUARIO_PUBLICO`), convenciones de la API, dónde va cada tipo de prueba y dos reglas nuevas: `npm test` y la comprobación de marcadores de conflicto antes de cada push, y actualizar la documentación en el mismo commit que el código.
- **metodologia.md:** el libro de historias, la misma regla antes del push y José en la tabla de integrantes (el código queda pendiente de que lo confirme).
- **Pruebas nuevas:** `tests/frontend/login.test.js` para la pantalla de inicio de sesión, que no tenía ninguna.

### Decisiones
#### Diagramas Mermaid de lo que existe
- **Contexto:** Joaquín pidió una documentación más completa y diagramas más detallados.
- **Decisión:** diagramas Mermaid dentro de los `.md`, siempre de lo que ya existe: contexto, capas con cada archivo, modelo de datos (ER), secuencia de cada flujo, estados y navegación, más los documentos `api.md`, `frontend.md`, `flujos.md` y `glosario.md`.
- **Alternativas:** una matriz de trazabilidad y una guía de contribución, que Joaquín no quiso.
- **Consecuencias:** la regla de `AGENTS.md` §8 obliga a actualizar los diagramas con cada cambio; no hay comprobación automática.
- **Decidió:** Joaquín, con Claude (plan de auditoría del 08/10).

#### Una regla antes del push en lugar de una comprobación automática
- **Contexto:** el 08/10 llegó a `main` un merge con marcadores de conflicto y el servidor dejó de arrancar.
- **Decisión:** `AGENTS.md` y `metodologia.md` piden `npm test` y comprobar que no quedan marcadores antes de cada push y después de cada merge.
- **Alternativas:** integración continua o una prueba que busque marcadores; no se hacen (el plan no registra el motivo).
- **Consecuencias:** que se cumpla depende de cada integrante.
- **Decidió:** Joaquín, con Claude (plan de auditoría del 08/10).

### Comprobación
- Todos los diagramas se han comprobado con Mermaid CLI, y los enlaces entre documentos con un script: ninguno roto, salvo el de `prompts/README.md`, que tiene un cambio local pendiente.

## Pruebas: nueva estructura, MySQL real y cobertura del frontend

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** sin historia (plan de auditoría del 08/10, fase 2) · **Commits:** `3f252a0`, `960d9c7`, `2845fd6`, `b30b5d6`, `2ca0428`, `f206f16`, `d34caed`

### Cambios
- **Estructura:** `backend/tests/` copia la de `src/` y `frontend/js/`.
  - `routes/`, `services/` (con `shared/`) y `middlewares/`: una prueba por archivo, que se llama como él (`archivo.tema.test.js` si tiene varias).
  - `criterios/`: una por historia, de principio a fin por HTTP (`cs45Relaciones`, `cs47Perfil`, `cs61Interacciones`, `cs62PerfilPublico`).
  - `frontend/`: una por página, y `frontend/shared/` para los módulos comunes.
  - `mysql/`: con MySQL real, y `mysql/repositories/` para los repositorios.
  - `helpers/`: ayudas que no son pruebas, `pantalla.js` y `datosMysql.js`.
  - Los archivos se movieron con `git mv` y conservan su historial.
- **Sin pruebas que solo repiten el código:** las que comprobaban la consulta de Prisma con `toHaveBeenCalledWith` y las que leían `schema.prisma` como texto se sustituyen por pruebas con MySQL real. Comprueban el resultado: sin email, orden, los dos sentidos de una amistad, recuentos, valores por defecto y claves únicas.
- **Cobertura:**
  - Las pruebas de pantallas cargan los scripts con `require` (`helpers/pantalla.js`) en lugar de `eval`, y los módulos compartidos dejan sus funciones en `window` de forma explícita. Así Jest mide también `frontend/js`.
  - `npm run test:cobertura` ejecuta todas las pruebas, también las de MySQL (Docker en marcha), y falla si la cobertura baja del 94 % de instrucciones, el 93 % de ramas o el 95 % de funciones.
  - El informe se guarda en `backend/coverage/`.
- Los comentarios citan las historias como CS-XX: LUC01 → CS-49, LUC09 → CS-57, FLA05 → CS-47 y MAT16 → CS-59.

### Decisiones
#### Repositorios probados con MySQL real
- **Contexto:** una prueba que comprueba con `toHaveBeenCalledWith` la consulta que se envía a Prisma solo repite el código: no detecta una consulta que devuelve datos de más o en otro orden.
- **Decisión:** los repositorios y el esquema se prueban contra MySQL real (`tests/mysql`).
- **Alternativas:** ninguna registrada.
- **Consecuencias:** esas pruebas necesitan Docker (`npm run test:mysql`); `npm test` sigue funcionando sin él.
- **Decidió:** Joaquín, con Claude (plan de auditoría del 08/10).

#### Cobertura también del frontend
- **Contexto:** las pruebas de pantallas cargaban los scripts con `eval`, y Jest no medía `frontend/js`.
- **Decisión:** los scripts se cargan con `require` y las funciones globales se hacen explícitas; `npm run test:cobertura` falla por debajo de un mínimo.
- **Alternativas:** ninguna registrada.
- **Consecuencias:** quien baje la cobertura por debajo de los mínimos de `package.json` ve fallar ese comando.
- **Decidió:** Joaquín, con Claude (plan de auditoría del 08/10).

## Código: flujos fáciles de seguir y sin duplicados

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** sin historia (plan de auditoría del 08/10, fase 2) · **Commits:** `1ea299f`, `1ca6aaf`, `3f70169`, `d3761f4`, `f87d38f`, `8ad0937`, `0b86e3c`, `57e8150`, `9c30a84`

### Cambios
- **Rutas:**
  - cada `xRoutes.js` llama solo a su `xService.js`; el perfil público de otro usuario pasa a `usuarioService`;
  - cada ruta lleva el comentario `// MÉTODO /api/ruta → servicio.función`, y `routes/index.js` tiene la tabla de prefijos.
- **Sesión:** `requiereSesion` comprueba también que el usuario de la sesión sigue existiendo, para todas las rutas protegidas.
- **Bienvenida:** usa el listado paginado de CS-44, con «Cargar más». Se eliminan `GET /api/experiencias/mias`, `listarExperienciasPropias` y `listarPorAutor`.
- **Duplicados del backend:**
  - crear y editar una experiencia comparten las reglas de cada campo;
  - los campos públicos de un usuario se definen una vez (`repositories/shared/camposPublicos.js`);
  - `amistadRepository` usa `deUsuario()` y busca la pareja por su clave;
  - todo usuario que devuelve la API lleva la foto por defecto si no tiene (`services/shared/fotoPorDefecto.js`);
  - las consultas independientes del perfil se lanzan en paralelo.
- **Frontend:**
  - `js/shared/pantalla.js` reúne lo que repetían las páginas: el listado con «Cargar más» por cursor (`listaConCargarMas`, que usan los cinco listados), el enlace a un perfil, mostrar y ocultar avisos e ir al login;
  - la ventana de reporte es un `<dialog>`;
  - `usuario.js` reconoce el 404 por su código;
  - todas las pantallas con sesión tienen la misma barra: PlanB, Inicio, Buscar personas y Mi perfil.
- Cabeceras de los archivos y comentario de `Amistad` en `schema.prisma` al día.

### Decisiones
#### `requiereSesion` comprueba que el usuario sigue existiendo
- **Contexto:** la comprobación estaba copiada en diez funciones de servicio y faltaba en el resumen y los listados del perfil y en la búsqueda.
- **Decisión:** la hace `requiereSesion`, una vez, para todas las rutas protegidas; los servicios no la repiten.
- **Alternativas:** ninguna registrada.
- **Consecuencias:** una ruta protegida nueva ya la tiene al usar `requiereSesion`.
- **Decidió:** Joaquín, con Claude (plan de auditoría del 08/10).

## Perfiles: experiencias al aceptar una amistad y personas enlazadas

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** sin historia · **Commits:** `ae031cf`

### Cambios
- En el perfil de otra persona (`usuario.html`), al aceptar su solicitud de amistad (o al eliminar la amistad), «Sus experiencias» se vuelve a cargar: aparecen al momento las que solo ven sus amigos, sin recargar la página (`recargarExperiencias` de `js/shared/experiencias.js`).
- En «Mi perfil», cada amigo y cada seguidor enlaza a su perfil (`usuario.html?nombre=…`).

### Comprobación
- Pruebas jsdom en `tests/frontend/shared/experiencias.test.js` y `tests/frontend/perfil.relaciones.test.js`, que fallaron primero.
- Recorrido completo en un navegador real con dos usuarios: registro y requisitos de la contraseña, experiencias de cada visibilidad, búsqueda, amistad, valoraciones (también en móvil), «Útil» y «Reportar», «Contenido no disponible», cambio y recuperación de la contraseña. Sin fallos. El CAPTCHA de Cloudflare no se resuelve en un navegador sin ventana, así que en ese recorrido los usuarios se crearon directamente en la base de datos.

# 2026-10-08

## Reparación de `main` tras el merge de CS-63

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-63, CS-30 y CS-48 (plan de auditoría del 08/10, paso 0A) · **Commits:** `7467de7`, `7820451`, `a88c740`

### Cambios
El merge de la rama `CS-63` (`9f7b2f3`) llegó a `main` con marcadores de conflicto (`<<<<<<<`, `=======`, `>>>>>>>`) en `experienciaService.js`, `experiencia.html` y `experiencia.js`. El servidor no arrancaba y fallaban 22 de los 50 archivos de prueba. Queda resuelto conservando el trabajo de CS-30 y el de CS-63.

- **Backend:**
  - `experienciaService` vuelve a tener una sola `obtenerExperiencia(usuarioId, experienciaId)`, la de CS-30. Comprueba la sesión y el identificador y responde 404 «Contenido no disponible» si la experiencia no existe o no se puede ver.
  - Se quitan la segunda versión de esa función, la segunda ruta `GET /api/experiencias/:id` (Express nunca llegaba a usarla, porque atiende la primera que coincide) y la importación de errores que no existen.
  - `experienciaRepository.buscarPorId` vuelve a recibir el identificador ya validado por el servicio.
- **`experiencia.html` y `js/experiencia.js` (CS-63):**
  - Queda la versión completa de la rama: lista de valoraciones con aviso de error, «Útil» y «Reportar», y autor y ciudad que funcionan también con experiencias sin autor.
  - «Útil» y «Reportar» funcionan solo en la pantalla: no guardan nada hasta que existan CS-02 y CS-04.
  - Sin el script de Bootstrap desde el CDN, que la política de seguridad de contenidos (CSP) bloquea. La ventana de reporte se abre sin él.
  - Se quitan un `id` repetido, un `</div>` sobrante y un `console.log`.
- **Bienvenida:**
  - «Ver detalle» es un enlace a `experiencia.html?id=…`.
  - Se elimina el diálogo de detalle, con su sección de valoraciones de amigos y seguidores (CS-48), al que ya no se llegaba.
- **Pruebas:**
  - Las 4 pruebas de pantalla del diálogo se sustituyen por una que comprueba el enlace.
  - La prueba de API de una experiencia que no se puede ver espera 404 «Contenido no disponible».
- **Datos privados del autor:** `GET /api/experiencias/:id` enviaba el `email` y el `passwordHash` del autor a cualquiera que pudiera ver la experiencia. `experienciaRepository.buscarPorId` trae ahora el autor solo con `id`, `nombreUsuario` y `foto`. Lo comprueba `tests/mysql/experienciaRepository.test.js`, con MySQL real, porque con el repositorio simulado no se ve qué columnas trae la consulta.
- **`backend/.env.example`:** el merge lo había borrado. Se recupera sin cambios: es la plantilla de `cp .env.example .env` de la puesta en marcha.

### Decisiones
#### Una sola página de detalle: `experiencia.html`
- **Contexto:** tras el merge había dos detalles de una experiencia: el diálogo de la bienvenida (CS-48) y `experiencia.html` (CS-63).
- **Decisión:** `experiencia.html` reúne CS-63, CS-48 y CS-30; se quita el diálogo de la bienvenida y «Ver detalle» enlaza a la página.
- **Alternativas:** ninguna registrada.
- **Consecuencias:** la sección de CS-48 queda sin pantalla hasta añadirla a `experiencia.html` (hecho el mismo día, ver «CS-63, CS-48 y CS-30 (objetivo 9)»).
- **Decidió:** Joaquín, con Claude (plan de auditoría del 08/10).

#### «Útil» y «Reportar» solo en la pantalla
- **Contexto:** José dejó «Útil» y «Reportar» (CS-63, objetivos 7 y 8) funcionando en la pantalla, sin backend.
- **Decisión:** se quedan así y los objetivos cuentan como hechos; el backend llegará con CS-02 y CS-04.
- **Alternativas:** ninguna registrada.
- **Consecuencias:** no se guarda nada al pulsarlos; la documentación lo dice.
- **Decidió:** Joaquín, con Claude (plan de auditoría del 08/10).

### Comprobación
- Resolver los marcadores no cambia el comportamiento: la batería pasó de 22 archivos en rojo a todo en verde.
- Enlace de «Ver detalle»: la prueba falló primero por el motivo esperado (`Expected "A"`, `Received "BUTTON"`) y pasó tras convertir el botón en enlace.
- Autor público: las dos pruebas de MySQL fallaron primero porque la respuesta incluía `email` y `passwordHash`, y pasaron tras limitar los campos del autor. `npm run test:mysql` queda con 4 pruebas en verde.

```bash
cd backend
npm test            # todas las pruebas, sin base de datos
npm run test:mysql  # con Docker en marcha: autor público y peticiones simultáneas
npm run dev     # bienvenida → «Ver detalle» abre experiencia.html
```

### Pendiente
- CS-48 no tiene pantalla mientras su sección no se añada a `experiencia.html`.
- En CS-63:
  - la lista general usa la ruta de CS-48, así que solo muestra valoraciones de amigos y seguidores;
  - el comentario admite 255 caracteres y no los 1000 acordados;
  - el autor de cada valoración enlaza a `perfil.html?id=`;
  - la fecha no se muestra, porque se lee `creadoEn` y el campo se llama `creadaEn`.

## Limpieza del repositorio

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** sin historia (plan de auditoría del 08/10, paso 0B) · **Commits:** `124a584`

### Cambios
- `backend/cookies.txt` deja de estar en Git (era una cookie de sesión de pruebas con curl) y `.gitignore` ignora cualquier `cookies.txt`. Quien lo tenga en local lo conserva.
- Se borran `scripts/inspect_cs30_planning.py` (leía un archivo temporal de un equipo concreto), el `package-lock.json` vacío de la raíz (el del backend sigue en `backend/`) y el archivo de bloqueo de Word `~$-Joaquin.docx`.
- `.gitignore` deja de mencionar `customer-stories/Customer_Stories_PlanB.xlsx`, una ruta que ya no existe.

## CS-61: identificadores y respuesta a solicitudes

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-61 · **Commits:** `bcddd0f`

### Cambios
- **Identificadores:** `services/shared/identificadores.js` (`leerId`) comprueba que un id de la URL o del cuerpo es un entero entre 1 y 2147483647. Si no, responde 400 «El identificador de … no es válido». Antes, `/api/amistades/abc` llegaba a Prisma y respondía 500. La usan los servicios de amistad, seguimiento, experiencia y valoración, que ya no repiten esa comprobación.
- **`aceptar`:** `PATCH /api/amistades/:id` exige `{ "aceptar": true }` o `{ "aceptar": false }`. Cualquier otro valor responde 400 «Indica si aceptas la solicitud con true o false» y la solicitud sigue pendiente. Antes `"si"` la aceptaba, y `1` o la ausencia del campo la borraban.

### Decisiones
#### Corregir los fallos encontrados en CS-61
- **Contexto:** la auditoría encontró cuatro fallos en CS-61: un id no numérico acababa en 500, `aceptar` admitía cualquier valor, dos peticiones simultáneas podían crear relaciones duplicadas y la búsqueda sin texto devolvía usuarios cualesquiera.
- **Decisión:** se corrigen los cuatro (esta sección y las dos siguientes).
- **Alternativas:** ninguna registrada.
- **Consecuencias:** cambia lo que responde la API con datos no válidos; las pruebas de CS-61 lo recogen.
- **Decidió:** Joaquín, con Claude (plan de auditoría del 08/10).

### Comprobación
- `tests/identificadores.test.js`, y en `tests/interaccionesCriterio.test.js` los ids no válidos de cada ruta y tres valores de `aceptar` que no son booleanos. Fallaron primero (404 y 200) y pasaron tras el cambio.

## CS-61: peticiones simultáneas

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-61 · **Commits:** `8a383f3`

### Cambios
- **Una sola relación por pareja:** `Amistad` tiene el campo nuevo `parejaClave`, la pareja sin orden (`"3-7"` tanto si 3 envió la solicitud a 7 como al revés), único en MySQL. Lo calcula `amistadRepository.crear`. Así, dos solicitudes cruzadas que llegan a la vez dejan una sola relación: la segunda responde 400 «Ya existe una solicitud o amistad entre estos usuarios».
- **Migración `20261008160000_amistad_pareja_clave`:** añade la columna, rellena las filas existentes y, si una base local tuviera ya dos relaciones cruzadas entre la misma pareja, conserva la aceptada o, si están en el mismo estado, la más antigua. Se probó aparte con parejas cruzadas en una base de datos temporal.
- **Sin errores 500 por carreras:** `repositories/shared/carreras.js` (`nullSi`) convierte en `null` los errores de Prisma que solo indican que otra petición se adelantó: P2002 (ya existe) y P2025 (ya no existe). Los servicios responden con un 400 o un 404 claros. Lo usan al seguir, dejar de seguir, crear, aceptar, rechazar y eliminar amistades.

### Decisiones
#### Clave única de la pareja (`parejaClave`)
- **Contexto:** la comprobación «ya existe una relación» se hacía en el servicio, antes de crear. Dos solicitudes cruzadas que llegan a la vez pasan las dos la comprobación y crean dos relaciones.
- **Decisión:** la pareja sin orden se guarda en una columna única y es MySQL quien rechaza la segunda.
- **Alternativas:** ninguna registrada.
- **Consecuencias:** migración nueva que rellena las filas existentes y, si hay parejas cruzadas, conserva una sola relación.
- **Decidió:** Joaquín, con Claude (plan de auditoría del 08/10).

#### Errores de carrera como 400 o 404
- **Contexto:** cuando otra petición se adelantaba, Prisma lanzaba P2002 o P2025 y la API respondía 500.
- **Decisión:** `nullSi` convierte esos dos errores en `null` y el servicio responde con un 400 o un 404 claros.
- **Alternativas:** ninguna registrada.
- **Consecuencias:** es la convención de `AGENTS.md` §4 para cualquier repositorio nuevo.
- **Decidió:** Joaquín, con Claude (plan de auditoría del 08/10).

### Comprobación
- unitarias de cada caso en `amistadService.test.js` y `seguimientoService.test.js`;
- con MySQL real, `tests/mysql/interaccionesConcurrencia.test.js`: pareja cruzada, dos solicitudes cruzadas simultáneas, diez «seguir» simultáneos (uno 201 y nueve 400, ningún 500) y aceptar o borrar algo que ya no existe.
- Todas fallaron primero: se creaba la segunda relación, uno de los «seguir» acababa en 500 y P2025 lanzaba un error.

### Para quien continúe
- Aplicar la migración nueva tras el `git pull` (ver «CS-64: recuperar la contraseña por email» de este mismo día).

## CS-61: búsqueda de personas

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-61 · **Commits:** `e1a9990`

### Cambios
- `GET /api/usuarios?texto=…` exige texto: vacío, con solo espacios o ausente responde 400 «Escribe un nombre de usuario para buscar». Antes devolvía 20 usuarios cualesquiera. El texto se busca sin los espacios de los extremos.
- Los resultados salen ordenados por nombre de usuario (`usuarioRepository.buscarPorNombre`).

### Comprobación
- `usuarioService.test.js` (texto recortado y cuatro textos no válidos), `interaccionesCriterio.test.js` (búsqueda sin texto por HTTP) y `tests/mysql/usuarioBusqueda.test.js` (orden con MySQL real). Fallaron primero y pasaron tras el cambio.

## CS-22: descripción de la visibilidad y prueba con MySQL

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-22 · **Commits:** `1bf3a36`

### Cambios
- Debajo del selector de visibilidad del formulario de la bienvenida aparece una frase que explica la opción elegida («Solo tú puedes verla.», «Solo la ven tus amigos (con la amistad aceptada) y tú.» o «Cualquier usuario puede verla.»). Cambia al elegir otra y, al editar, corresponde a la visibilidad actual.
- `tests/mysql/experienciaVisibilidad.test.js` recorre el criterio con MySQL real. Una experiencia creada como privada solo la ve su autor. Al editarla a pública, el cambio se conserva al recargar y la ve cualquiera. En «amigos», otro usuario no la ve hasta que la amistad está aceptada.

### Comprobación
- Frase de la visibilidad: probado con jsdom: falló primero porque el texto no existía.
- La validación ya existía (trabajo de Matthew): para comprobar que la prueba detecta el fallo, se quitó a propósito la visibilidad de `experienciaRepository.crear`, la prueba falló (`Expected "PRIVADA"`, `Received "PUBLICA"`) y se deshizo el cambio.

### Pendiente
- Queda fuera de CS-22: «aparece en mi perfil» depende del listado de CS-44, y «se puede encontrar buscándola», de la búsqueda de experiencias, que todavía no existe.

## CS-44: listado de experiencias de un usuario (backend)

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-44 · **Commits:** `78a2525`

### Cambios
- **Ruta:** `GET /api/experiencias?autor=<nombreUsuario>&despuesDe=<id>&limite=<n>`, con sesión. Responde `{ experiencias, siguiente }`, de la más reciente a la más antigua y con su ciudad.
  - El autor ve todas las suyas, también las privadas. Un amigo con la amistad aceptada ve las de amigos y las públicas. Cualquier otro (también un seguidor o alguien con la solicitud pendiente) ve solo las públicas.
  - Un usuario sin experiencias recibe una lista vacía; uno que no existe, 404 «Usuario no encontrado».
- **Paginación por cursor** (`services/shared/paginacion.js`): el cliente pide los siguientes `limite` (de 1 a 50; 10 por defecto) después del id `despuesDe`. `siguiente` es el valor que debe enviar para la próxima página, o `null` si no hay más.
- **Visibilidad en una sola consulta:** `nivelesVisibles(usuarioId, autorId)` (`services/shared/visibilidad.js`) devuelve los niveles que puede ver el usuario, con la misma regla que `puedeVerExperiencia`, y el repositorio filtra con ellos.

### Decisiones
#### Paginación por cursor en todas las listas
- **Contexto:** con páginas numeradas, si se publica algo entre dos peticiones la lista se desplaza y se repiten o se saltan elementos. Además, con OFFSET MySQL recorre todas las filas anteriores.
- **Decisión:** todas las listas se paginan por cursor (`?despuesDe=<id>&limite=<n>`, con `siguiente` en la respuesta) y «Cargar más». Así no se repite ni se salta nada aunque se publique otra experiencia entre dos peticiones. Además, MySQL no recorre las filas anteriores, como haría con OFFSET.
- **Alternativas:** páginas numeradas (`?pagina=`), como las que tenía CS-45.
- **Consecuencias:** CS-45 pasa a cursor (ver su sección de este día); la convención queda en `AGENTS.md` §4.
- **Decidió:** Joaquín, con Claude (plan de auditoría del 08/10).

### Comprobación
- `paginacion.test.js`, `visibilidad.test.js` (también la verificación cruzada de las dos funciones) y `experienciasAutor.test.js` (servicio);
- con MySQL real, `tests/mysql/experienciasAutor.test.js`: el criterio completo con autor, amigo, seguidor, solicitud pendiente y desconocido, y todas las páginas con una publicación entre medias.
- Fallaron primero. Se comprobó además que detectan el fallo: sin el filtro de visibilidad fallan 4 pruebas, y sin el cursor, 1.

## CS-44 y CS-62 (objetivo 8): experiencias en los perfiles

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-44 y CS-62, objetivo 8 · **Commits:** `9f2de20`

### Cambios
- `usuario.html` muestra «Sus experiencias» (las que puedo ver) y `perfil.html`, «Mis experiencias» (también las privadas). Cada una enlaza a `experiencia.html?id=…` y muestra su ciudad y su visibilidad. «Cargar más» añade las siguientes sin repetir ninguna. Sin experiencias se indica la lista vacía, y si la carga falla se ve el error.
- El código común está en `js/shared/experiencias.js` (`mostrarExperienciasDe`). Las dos páginas lo cargan después de `api.js`. En «Mi perfil», si se cambia el nombre de usuario, las páginas siguientes se piden con el nombre nuevo.

### Comprobación
- `experienciasPerfilPantalla.test.js` (jsdom), que falló primero porque el módulo no existía. Las pruebas de pantalla de `usuario.html` y `perfil.html` cargan ahora también ese script. En `usuarioPantalla.test.js`, el listado es la segunda petición al abrir la página, así que las peticiones de las acciones pasan a la posición siguiente.

### Pendiente
- Pendiente de comprobar a mano en el navegador, en escritorio y móvil.

## CS-45: listas de amigos y seguidores por cursor

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-45 · **Commits:** `8f64958`

### Cambios
- **Ahora:** `GET /api/perfil/amigos` y `/api/perfil/seguidores` aceptan `?despuesDe=<id>&limite=<n>` (20 por defecto, de 1 a 50) y responden `{ personas, siguiente }`, con la misma paginación común que CS-44. Ya no devuelven `pagina`, `limite` ni `total`: los contadores siguen saliendo de `/api/perfil/resumen`. `perfil.js` pide «Cargar más» con el `siguiente` de la página anterior.
- **Al aceptar una solicitud** en «Mi perfil», el contador de amigos y la lista de amigos se actualizan en la misma página. Antes había que recargarla.

### Decisiones
#### Adaptar las listas de Lucía al cursor
- **Contexto (por qué):** con páginas numeradas (`?pagina=2`), si llegaba un amigo o un seguidor entre la carga de la primera página y «Cargar más», la lista se desplazaba y una persona salía repetida. Se comprobó con MySQL real: con 26 seguidores, la segunda página traía 6 personas y repetía la última de la primera. Eso incumple «sin repetir personas» del criterio.
- **Decisión:** las dos listas usan la paginación por cursor común; se adaptan el código y las pruebas de Lucía conservando su estructura.
- **Alternativas:** ninguna registrada.
- **Consecuencias:** la respuesta cambia de forma (sin `pagina`, `limite` ni `total`).
- **Decidió:** Joaquín, con Claude (plan de auditoría del 08/10).

### Comprobación
- `tests/mysql/relacionesPerfil.test.js`: todas las páginas, con un alta entre medias, sin repetir ni saltar a nadie, para amigos y para seguidores. Falló primero porque la respuesta no traía `siguiente`.
- Las pruebas de CS-45 (servicio, rutas, repositorio, criterio y pantalla) usan ahora la forma nueva de pedir y de responder. Siguen protegiendo lo mismo: ceros sin error, pendientes y rechazadas que no cuentan, subidas y bajadas de uno, sin emails y sin repetidos.
- En `relacionesPantalla.test.js`, una prueba nueva de los contadores tras aceptar, que falló primero (se quedaba en 0). En `solicitudesPantalla.test.js`, la petición de aceptar se busca por su ruta, porque ya no es la última.

## CS-01 y CS-48: «Contenido no disponible» y comentario de hasta 1000 caracteres

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-01 y CS-48 · **Commits:** `7e44719`

### Cambios
- Valorar (`PUT /api/experiencias/:id/valoracion`) y consultar las valoraciones de amigos y seguidores responden 404 «Contenido no disponible» si la experiencia no existe o no se puede ver, igual que su detalle (CS-30). Antes respondían «La experiencia no existe» o un 403 «No tienes permiso…», que revelaba que existía. Las dos pasan por `experienciaService.obtenerExperiencia`.
- El comentario se guarda sin los espacios de los extremos y normalizado a NFC (una letra con tilde se guarda siempre como un solo carácter). Solo con espacios cuenta como sin comentario, y más de 1000 caracteres responden 400 «El comentario no puede superar los 1000 caracteres». Antes no tenía límite.

### Decisiones
#### 404 «Contenido no disponible» en todo lo que cuelga de una experiencia
- **Contexto:** un 403 para una experiencia que no se puede ver revela que existe. CS-30 ya respondía 404 «Contenido no disponible» en el detalle.
- **Decisión:** detalle, valorar, mi valoración, valoraciones y CS-48 responden lo mismo, pasando por `experienciaService.obtenerExperiencia`.
- **Alternativas:** mantener el 403 para las experiencias que existen pero no se pueden ver (lo que había antes del 08/10).
- **Consecuencias:** las pruebas que esperaban 403 o «La experiencia no existe» pasan al 404; la convención queda en `AGENTS.md` §4.
- **Decidió:** Joaquín, con Claude (plan de auditoría del 08/10).

### Comprobación
- Cuatro casos nuevos del comentario en `valoracionService.test.js`. Los mensajes y el 403 de las pruebas de CS-01 y CS-48 pasan al 404 acordado. Fallaron primero y pasaron tras el cambio.

## CS-63 y CS-48: rutas de las valoraciones de una experiencia

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-63 y CS-48 · **Commits:** `162cd1f`

### Cambios
- Las rutas de valoraciones se montan en `/api/experiencias/:id` y cada una está escrita entera en `valoracionRoutes.js`:
  - `GET /valoracion`: mi valoración, o `null` si todavía no he valorado. Sustituye a `/valoracion/mia`, que respondía 404.
  - `PUT /valoracion`: valorar, sin cambios.
  - `GET /valoraciones?despuesDe=&limite=`: todas, por páginas (10 por defecto), con el autor público y la fecha.
  - `GET /valoraciones/amigos?despuesDe=&limite=`: las de amigos (amistad aceptada, en cualquier sentido) y de quienes me siguen. Sustituye a `GET /valoracion?pagina=…`, que era la ruta de CS-48.
- Las tres consultas responden 404 «Contenido no disponible» si la experiencia no existe o no se puede ver, y los listados responden `{ valoraciones, siguiente }` con la paginación por cursor común.
- **CS-48 en una sola consulta:** el filtro de amigos y seguidores va dentro de la consulta de valoraciones (`valoracionRepository.listarDeRelacionados`). Ya no se cargan en memoria todos los ids de amigos y seguidores para luego buscar con un `IN`. Se eliminan `listarAmigosIds`, `listarSeguidoresIds` y `listarDeUsuarios`, que se quedan sin uso.

### Decisiones
#### Sustituir la prueba en memoria de CS-48 por una con MySQL
- **Contexto:** `valoracionesRelacionadasCriterio.test.js` simulaba en memoria ese mismo filtro, y repetirlo en la simulación no demostraría nada.
- **Decisión:** `valoracionesRelacionadasCriterio.test.js` se elimina. Sus escenarios están en la prueba de MySQL.
- **Alternativas:** ninguna registrada.
- **Consecuencias:** el criterio de CS-48 solo se comprueba con Docker en marcha (`npm run test:mysql`).
- **Decidió:** Joaquín, con Claude (plan de auditoría del 08/10).

### Comprobación
- El criterio de CS-48 y CS-63 se prueba con MySQL real en `tests/mysql/valoracionesExperiencia.test.js`. Ahí está el filtro: amigos en los dos sentidos y seguidores sí; a quien sigo, solicitudes pendientes y desconocidos no. También sección vacía, valoración nueva, páginas, lista general sin emails, mi valoración y el 404.
- `valoracionService.test.js` y `valoraciones.test.js` prueban las reglas y las rutas nuevas con repositorios simulados.
- Las pruebas nuevas fallaron primero. Quitando a propósito la condición «me sigue» del filtro, la prueba de MySQL falla.

## CS-63, CS-48 y CS-30 (objetivo 9): página de una experiencia

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-63, CS-48 y CS-30, objetivo 9 · **Commits:** `9f735e6`

### Cambios
Sobre la página de José (`experiencia.html` y `js/experiencia.js`):
- **Cabecera:** el autor enlaza a su perfil (`usuario.html?nombre=…`, o «Mi perfil» si es el mío; CS-62, objetivo 10).
- **«Valoraciones y comentarios»:** se piden a `GET /valoraciones`, así que salen todas y no solo las de amigos. Cada una lleva el autor enlazado, la puntuación, el texto y la fecha, que antes no aparecía porque el campo es `creadaEn`. «Cargar más» usa el cursor y no repite ninguna.
- **«Valoraciones de amigos y seguidores» (CS-48):** sección propia con su «Cargar más» y su aviso de lista vacía.
- **Formulario:**
  - comentario de hasta 1000 caracteres, con el contador «n / 1000» que avisa al acercarse;
  - mi valoración se precarga con `GET /valoracion`;
  - no se envía sin una puntuación entera del 1 al 5;
  - si falla la red, se muestra el error y no se borra lo escrito.
- **«Contenido no disponible»:** se reconoce por el código 404 y no por el texto del mensaje. Se borran el título, el autor, la ciudad, la descripción y las listas, también si la experiencia deja de estar disponible mientras se ve (CS-30, objetivo 9).
- **«Útil» y «Reportar»** se quedan como estaban: funcionan solo en la pantalla hasta CS-02 y CS-04.
- **`js/shared/api.js`:** el error que lanza lleva ahora el código HTTP en `status`.

### Comprobación
- `experienciaDetallePantalla.test.js` (jsdom), una por cada frase del criterio de CS-63, más la sección de CS-48 y el objetivo 9 de CS-30. Fallaron primero 19 de 21. Las dos pruebas de José (`experienciaPantalla.test.js`) siguen pasando.

### Pendiente
- La comprobación manual en el navegador, en escritorio y móvil, con dos usuarios.

## CS-30: pruebas de acceso por API (objetivos 7 y 8)

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-30, objetivos 7 y 8 · **Commits:** `a3c59ca`

### Cambios
- `tests/mysql/accesoExperiencia.test.js` recorre con MySQL real los cinco casos del objetivo 7: pública de otro (200), privada propia (200), privada ajena (404 «Contenido no disponible», sin datos), de amigos con la solicitud pendiente (404) y con la amistad aceptada (200).
- Recorre también los tres cambios del objetivo 8, con la misma petición antes y después: una pública que pasa a privada, una amistad aceptada que se elimina y una solicitud pendiente que se acepta.

### Comprobación
- La regla ya estaba implementada (trabajo de Matthew). Para comprobar que las pruebas detectan un fallo, se hizo que una solicitud pendiente contara como amistad: fallaron 3 y se deshizo el cambio.

## CS-64: contraseña segura en el registro (objetivos 1 a 3)

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-64, objetivos 1 a 3 · **Commits:** `e2ada47`

### Cambios
- `services/shared/password.js` (`validarPassword`) exige entre 8 y 72 bytes, al menos una mayúscula, una minúscula y un número, y que no contenga el nombre de usuario (sin distinguir mayúsculas). Si falla, responde 400 con los requisitos que no se cumplen, por ejemplo «La contraseña no cumple estos requisitos: al menos un número.». Se aplica en el registro y se aplicará igual al cambiarla y al restablecerla.
- `registro.html` muestra los cinco requisitos debajo de la contraseña y los marca (✓) mientras se escribe, también al cambiar el nombre de usuario. El código está en `js/shared/password.js`, para reutilizarlo en las otras pantallas de CS-64.

### Comprobación
- `password.test.js`: cada requisito, varios a la vez y los límites de 7, 8, 72 y 73 bytes, también con letras de dos bytes;
- en `validacion.test.js`, tres contraseñas débiles en el registro;
- en `registroPantalla.test.js`, la lista y su marcado.
- Las pruebas que registraban usuarios con `secreta123`, que ya no es válida porque no tiene mayúscula, usan `Secreta123`; las de inicio de sesión no cambian.
- `tests/setup.js` añade `TextEncoder` al navegador simulado (jsdom no lo trae, pero los navegadores sí).

## CS-64: cambiar la contraseña desde el perfil (objetivos 4 a 7)

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-64, objetivos 4 a 7 · **Commits:** `b573ac8`

### Cambios
- **API:** `PUT /api/perfil/password` con `{ actual, nueva }` y sesión. Si la actual no es correcta, responde 400 «La contraseña actual no es correcta» y no cambia nada. La nueva cumple las mismas reglas que en el registro. Si todo va bien, responde 204 y solo se guarda el hash (`usuarioRepository.actualizarPassword`). Tiene su propio límite de 10 intentos fallidos cada 15 minutos (`limiteCambioPassword`).
- El cifrado con bcrypt está ahora en `services/shared/password.js` (`cifrarPassword`), común al registro y al cambio.
- **Pantalla:** «Mi perfil» tiene el formulario «Cambiar contraseña» (actual, nueva y repetida), con los requisitos marcados mientras se escribe. Si las dos nuevas no coinciden, se avisa sin enviar nada. Si el servidor la rechaza, se ve su mensaje y no se borra lo escrito.

### Comprobación
- `cambioPassword.test.js`, con repositorio en memoria y bcrypt real: el criterio completo, incluido que el login funciona con la nueva y falla con la antigua;
- `limiteCambioPassword.test.js`: 11 intentos fallidos → 429; va en su propio archivo para que el límite de login no le impida iniciar sesión;
- `cambioPasswordPantalla.test.js` (jsdom).
- Fallaron primero. Las pruebas que cargan `perfil.js` cargan también `js/shared/password.js`.

## CS-64: recuperar la contraseña por email (objetivos 8 a 15)

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-64, objetivos 8 a 15 · **Commits:** `8d41cb8`

### Cambios
- **Modelo `TokenRecuperacion`** (migración `20261008200000_token_recuperacion`): usuario, `tokenHash` (SHA-256 del token, único), `caducaEn`, `usadoEn` y `creadoEn`. En la base de datos nunca está el token del enlace, solo su hash.
- **Email:** `repositories/emailRepository.js` envía con Nodemailer (dependencia nueva) si `.env` tiene `SMTP_URL`. Si no, escribe el email con el enlace en la consola del servidor, que basta para desarrollo. `.env.example` explica `SMTP_URL`, `EMAIL_REMITENTE` y `URL_APP`.
- **`POST /api/auth/recuperar`** `{ email }`: responde siempre lo mismo, exista o no el email. Si existe, crea un token aleatorio de 32 bytes que caduca a los 30 minutos y envía el enlace `restablecer.html?token=…`. El envío no se espera, para que la respuesta no tarde más cuando el email existe.
- **`POST /api/auth/restablecer`** `{ token, nueva }`:
  - la nueva cumple las mismas reglas que en el registro; si no las cumple, no cambia nada y el enlace sigue sirviendo;
  - el enlace se consume en una transacción, con un UPDATE que solo funciona si sigue sin usar y sin caducar: con dos peticiones simultáneas, solo una cambia la contraseña;
  - un enlace usado, caducado o inventado responde 400 «El enlace no es válido o ha caducado».
- Las dos rutas comparten un límite de 10 peticiones cada 15 minutos por IP (`limiteRecuperacion`).
- **Pantallas:** `recuperar.html` y `restablecer.html` (con los requisitos marcados mientras se escribe), y el enlace «¿Has olvidado tu contraseña?» en el inicio de sesión.

### Decisiones
#### Email con Nodemailer y la consola como alternativa
- **Contexto:** CS-64 necesita enviar un enlace por email, y el equipo todavía no tiene proveedor.
- **Decisión:** Nodemailer con el SMTP configurado en `.env` (`SMTP_URL`). Sin SMTP, el enlace se escribe en la consola del servidor.
- **Alternativas:** ninguna registrada.
- **Consecuencias:** en desarrollo basta la consola; para usarlo de verdad hay que elegir proveedor.
- **Decidió:** Joaquín, con Claude (plan de auditoría del 08/10).

### Comprobación
- `tests/mysql/recuperacionPassword.test.js`: la misma respuesta con y sin cuenta, solo el hash en la base de datos, caducidad de 30 minutos, un solo uso (después el login funciona con la nueva y falla con la antigua), enlace caducado o inventado, contraseña débil y dos restablecimientos simultáneos;
- `recuperacionService.test.js`: no se espera al envío, y un fallo del envío no rompe la petición;
- `limiteRecuperacion.test.js`: 11 peticiones → 429;
- `recuperacionPantalla.test.js` (jsdom).
- Fallaron primero. Quitando a propósito la condición «sin usar» del consumo del enlace, fallan dos pruebas de MySQL.

### Para quien continúe
- Tras el `git pull`, desde `backend/`: `npm install` (llega `nodemailer`) y aplicar las migraciones nuevas con `npx prisma migrate deploy` y `npx prisma generate`.
- Para la recuperación de contraseña, añadir a `.env` las variables nuevas de `.env.example`. Sin `SMTP_URL`, el enlace aparece en la consola del servidor.

### Pendiente
- Falta que el equipo elija proveedor y ponga su `SMTP_URL`.

## CS-62: perfil de otro usuario (finalizada)

**Autor:** Flavia Méndez Tsutsumi, con Claude Code
**Historia:** CS-62, objetivos 1 a 7, 9, 11 y 12 · **Commits:** `df45061`, `0f1d24c`, `b2af2c4`, `3f18efd`, `af674d2`, `c82caa3`, `6bf68bf`, `065991a`, `003cc6c`, `1045751`

### Cambios
Se puede abrir el perfil de otra persona en `usuario.html?nombre=<nombreUsuario>`, ver su foto, nombre, ciudad y contadores de amigos y seguidores, y gestionar la amistad y el seguimiento sin recargar la página. Los objetivos 1 a 7, 9, 11 y 12 los hizo Flavia; el 8 y el 10 los cubrieron otras personas al construir sus historias (ver «Objetivos cubiertos por otras historias»).

- **Repositorios:** `usuarioRepository.obtenerPerfilPublico` busca por nombre de usuario y devuelve solo `id`, `nombreUsuario`, `foto` y `ciudad`, nunca el email. `amistadRepository.contarAmigos` cuenta solo las amistades aceptadas, en cualquier sentido. `seguimientoRepository.contarSeguidores` cuenta quién sigue a un usuario.
- **Servicio:** `perfilService.obtenerPerfilPublico(usuarioId, nombreUsuario)` devuelve `{ id, nombreUsuario, foto, ciudad, amigos, seguidores, esPropio, relacion }`. `foto` lleva la imagen por defecto si no hay ninguna. `esPropio` compara ids, así que escribir el propio nombre con otras mayúsculas también cuenta. `relacion.amistad` es `ninguna`, `enviada`, `recibida` o `amigos`; `relacion.amistadId` es el id de esa solicitud o amistad (`null` si no hay) y `relacion.siguiendo` indica si ya se sigue. Si el usuario no existe lanza un error 404 «Usuario no encontrado».
- **API:** nueva ruta `GET /api/usuarios/:nombreUsuario` en `usuarioRoutes.js` (archivo de CS-61), protegida por `requiereSesion`. El id del usuario sale siempre de la sesión.
- **Interfaz:** `usuario.html` y `js/usuario.js`. Según la relación muestra «Añadir amigo», «Solicitud enviada» (desactivado), «Aceptar» y «Rechazar», o «Eliminar amigo» (pide confirmación con `confirm()`), y aparte «Seguir» o «Dejar de seguir». Tras cada acción vuelve a pedir el perfil, por lo que botones y contadores se actualizan sin recargar. Los errores del servidor se muestran en una caja roja. Si el usuario no existe aparece «Usuario no encontrado» y, si es el propio usuario, se redirige a `perfil.html`. Los textos se insertan con `textContent`.
- **Pruebas:** `perfilPublicoRepository`, `contadoresRepository`, `perfilPublicoService`, `perfilPublicoRoutes`, `perfilPublicoApi` y `usuarioPantalla` (esta con jsdom). Cubren los campos devueltos, la ausencia del email, el 404, cada estado de la relación, cada botón y su efecto, los errores del servidor, la confirmación cancelada o aceptada, el usuario inexistente y el perfil propio.

**Objetivos cubiertos por otras historias:**

- **Objetivo 8** (listado de sus experiencias visibles para mí): lo resolvió Joaquín con CS-44 (`GET /api/experiencias?autor=`, `js/shared/experiencias.js` y la sección «Sus experiencias» de `usuario.html`). Respeta la visibilidad: las públicas las ve cualquiera, las de «amigos» solo quien tiene una amistad aceptada con el autor, y las privadas nunca.
- **Objetivo 10:** el enlace desde la búsqueda de personas lo hizo Matthew en CS-61 (`personas.js`), y el enlace desde el autor de cada experiencia lo hizo Joaquín en `experiencia.html` (CS-63).

### Comprobación
- **Comprobación manual:** con servidor, MySQL y navegador reales, y dos usuarios de prueba, se comprobaron todos los estados de los botones en escritorio (1280 px), tablet (768 px) y móvil (375 px), la persistencia al recargar y el recorrido desde «Buscar personas» hasta el perfil.
- Comprobado el 08/10/2026 con servidor y datos reales: sin relación con el autor solo se ve su experiencia pública; siendo amigos se ve también la de amigos, y la privada nunca. Desde una experiencia, el autor enlaza a su perfil.

```bash
cd backend
npm test
```

Resultado esperado el 08/10/2026: 61 suites y 561 pruebas correctas. Para la comprobación manual: `docker compose up -d`, `npm run dev`, iniciar sesión, abrir «Buscar personas», buscar a otro usuario y pulsar su nombre.

### Para quien continúe
- `GET /api/usuarios/:nombreUsuario` captura cualquier segmento. Si se añaden más rutas `GET` bajo `/api/usuarios`, hay que declararlas antes que ella.
- `js/shared/api.js` solo lanza el mensaje del error, no su código HTTP. `usuario.js` reconoce el 404 por el texto «Usuario no encontrado»; si se cambia el mensaje del servicio hay que cambiarlo también allí, o hacer que `api.js` añada el código al error.
- `contarAmigos` y `contarSeguidores` se pueden reutilizar en CS-45.
- Para añadir al perfil otras acciones, reutilizar `crearBoton` y `actuar` de `usuario.js`.
- Tras un `git pull` conviene ejecutar también `npm install` (CS-64 añadió `nodemailer`; sin él fallan 20 suites) y `npm run db:seed` si `/api/ciudades` devuelve una lista vacía (sin ciudades no se pueden crear experiencias).
- Tras un `git pull` que traiga migraciones hay que ejecutar `npx prisma migrate deploy` y `npx prisma generate` en `backend/`. Sin las migraciones de visibilidad y valoraciones, la bienvenida da «Error interno del servidor».

### Pendiente
- Sin comprobar: el aspecto visual de la ventana de `confirm()`, que el navegador integrado de la herramienta no muestra.

# 2026-10-07

## Excel de historias: cambios de OneDrive y CS-64 para José

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** sin historia · **Commits:** `7b13d35`, `261bd64`, `00ca483`, `2825536`, `05bbd99`

### Cambios
La copia de OneDrive descargada hoy no tenía las correcciones del 06/10 (fila «Total», números de objetivo con fórmula, tiempo total sin duplicar). Se ha partido del libro corregido del repositorio y se le han añadido los cambios que el equipo hizo en OneDrive desde la última descarga:

- **CS-45:** objetivos 1 a 5 finalizados, objetivo 2 a nombre de Flavia y sus tiempos.
- **CS-48:** objetivos 3 a 10 finalizados, objetivos 7 a 10 a nombre de Jorge y sus tiempos.
- **CS-61:** objetivos 12 a 16 finalizados y sus tiempos.
- **CS-62:** objetivo 12 finalizado, objetivos 8 y 11 marcados «No» y tiempos corregidos de los objetivos 5 y 12.
- **CS-64:** los 15 objetivos, a nombre de José, con su tiempo estimado (340 min en total). El Tiempo estimado de la historia en el Índice pasa de 0,5 h a 6 h. Aún no tienen tiempo real, porque ninguno está empezado.

Hay que subir esta versión a OneDrive para sustituir la actual.

Al subirla, Excel para la web reparó el libro («Removed Part: Data store»): quitó el vínculo con el botón «Crear páginas» y los enlaces del Índice y de las páginas dejaron de responder. Por eso:

- `documentacion/office-scripts/crearPaginas.ts` rehace ahora también el enlace «↑ Índice» de cada página y de la Plantilla, además de los del Índice. Pulsar el botón repara todos los enlaces. Después de crear el enlace vuelve a poner la letra en blanco y negrita, porque Excel la pone azul y no se leía sobre el fondo azul de la fila. Para aplicarlo hay que sustituir el código del script «Crear páginas» en Excel para la web y pulsar el botón otra vez.
- El enlace de CS-60 mostraba el título antiguo, «METODOLOGÍA». Ahora muestra el actual, «ORGANIZACIÓN INTERNA».
- `metodologia.md` (sección 3.3) explica cómo reparar los enlaces.

Se ha borrado `documentacion/customer-stories/~$Customer_Stories_PlanB.xlsx`. Era un archivo de bloqueo del 25/09: Excel lo crea mientras alguien tiene el libro abierto y lo borra al cerrarlo, pero este se había subido a Git y hacía parecer que el libro seguía abierto. `.gitignore` ignora ahora cualquier archivo de bloqueo de Office (`~$*`) o de LibreOffice (`.~lock.*#`) en cualquier carpeta. La regla anterior apuntaba a la ruta antigua `customer-stories/` y ya no tenía efecto.

### Decisiones
#### Partir del libro corregido del repositorio
- **Contexto:** la copia de OneDrive descargada hoy no tenía las correcciones del 06/10.
- **Decisión:** se parte del libro corregido del repositorio y se le añaden los cambios hechos en OneDrive desde la última descarga.
- **Alternativas:** ninguna registrada.
- **Consecuencias:** hay que subir esta versión a OneDrive para sustituir la actual.
- **Decidió:** Joaquín.

## CS-45: mi número de amigos y seguidores

**Autor:** Lucía Alexandra Guzmán Álvarez, con Claude (aplicación de escritorio, modo Cowork)
**Historia:** CS-45 · **Commits:** `b65abf4`, `2c7eb22`, `28c2441`, `60eb1d4`, `14a9b00`, `4a01b95`, `619c0f8`, `d49c0ac`

### Cambios
El perfil propio muestra cuántos amigos y seguidores tiene el usuario y el listado paginado de ambos.

- **Repositorios:** `amistadRepository.listarAmigos` y `seguimientoRepository.listarSeguidores` devuelven una página de personas con `id`, `nombreUsuario` y `foto`, sin email, ordenadas por fecha y, a igualdad, por `id`. Los contadores `contarAmigos` y `contarSeguidores` ya existían y se reutilizan.
- **Servicio:** `perfilService` añade `obtenerResumenRelaciones`, `listarAmigosPropios` y `listarSeguidoresPropios`. La paginación usa página 1 y 20 personas por defecto, con un máximo de 50; un valor no válido responde 400.
- **Rutas:** `GET /api/perfil/resumen` devuelve `{ amigos, seguidores }`; `GET /api/perfil/amigos` y `GET /api/perfil/seguidores` aceptan `pagina` y `limite` y devuelven `{ pagina, limite, total, personas }`. Las tres exigen sesión y usan siempre el usuario de la sesión.
- **Pantalla:** `perfil.html` incorpora la sección «Amigos y seguidores» y `perfil.js` la rellena al abrir la página. «Cargar más» pide la página siguiente y no repite a nadie.
- **Pruebas:** 40 pruebas nuevas en `relacionesListadoRepository`, `perfilRelacionesService`, `perfilRelacionesRoutes`, `perfilRelacionesCriterio` y `relacionesPantalla`. La batería tiene 49 suites y 402 pruebas, todas correctas.

### Decisiones
#### Código de pantalla en `perfil.js`
- **Contexto:** la sección «Amigos y seguidores» está en `perfil.html`.
- **Decisión:** El código de pantalla va en `perfil.js`, para mantener un único archivo JavaScript por página.
- **Alternativas:** no registradas.
- **Consecuencias:** no registradas.
- **Decidió:** Lucía.

#### Localizar la llamada de `fetch` por ser la última
- **Contexto:** el perfil hace ahora más llamadas al cargar.
- **Decisión:** En `solicitudesPantalla.test.js` y `perfilPantalla.test.js`, tres comprobaciones pasan de `fetch.mock.calls[2]` a `fetch.mock.calls.at(-1)`: localizan la llamada por ser la última y no por su posición, porque el perfil hace ahora más llamadas al cargar.
- **Alternativas:** no registradas.
- **Consecuencias:** no registradas.
- **Decidió:** Lucía. Acordado con Matthew y Joaquín.

### Comprobación
```bash
cd backend
npm test
```

Resultado esperado: 49 suites y 402 pruebas correctas. A mano, con dos cuentas (una en una ventana de incógnito): enviar una solicitud, aceptarla, seguir, dejar de seguir y eliminar la amistad, recargando «Mi perfil» tras cada paso para ver cambiar las cifras.

### Pendiente
- Los contadores y las listas se piden al abrir la página. Después de aceptar una solicitud en «Solicitudes recibidas» no cambian hasta recargar. Queda como posible mejora.
- Las personas de las listas todavía no enlazan a su perfil público.
- «Cargar más» solo se ha comprobado con pruebas automáticas, no con más de 20 personas reales.

## CS-22: visibilidad de experiencias (finalizada)

**Autor:** Matthew Puente Villegas Michavil, con Copilot SDK en VS Code
**Historia:** CS-22, objetivos 3 a 7 · **Commits:** `6dd5d4f`, `4357631`, `b2adc5b`, `f3c9b44`, `4f3c330`

### Cambios
Se ha trabajado de forma incremental en la historia CS-30 y en la validación del cierre de CS-22, manteniendo el alcance de un objetivo a la vez y dejando constancia de cada paso en la documentación y en las pruebas.

- **Objetivo 4:** se validó y persistió `visibilidad` en la creación y edición de experiencias, aceptando solo `PRIVADA`, `AMIGOS` y `PUBLICA` con valor por defecto `PUBLICA`.
- **Objetivo 5:** se añadió el selector visual de visibilidad al formulario de experiencia y se comprobó en pantalla que incluye las tres opciones y conserva el valor al editar.
- **Objetivo 6:** se validó que el valor seleccionado se envía junto con la petición de creación/edición.
- **Objetivo 7:** se confirmó que al abrir una experiencia en edición el selector se rellena con la visibilidad actual y que el valor se conserva al guardar.

Se ha completado la historia CS-22: cada experiencia puede declararse como `PRIVADA`, `AMIGOS` o `PUBLICA`, el valor por defecto queda en `PUBLICA` para conservar las experiencias existentes y la pantalla de creación/edición refleja y guarda ese valor.

- **Datos y migración (objetivo 3):** el enum `Visibilidad` y el campo `visibilidad` en `Experiencia` quedaron añadidos en el esquema de Prisma y la migración `20261006093106_visibilidad_experiencia` usa `DEFAULT 'PUBLICA'`, así que las experiencias ya creadas siguen visibles sin necesidad de limpieza manual.
- **Validación y persistencia (objetivo 4):** `validarCreacion` y `validarEdicion` de `experienciaService.js` aceptan solo los tres valores permitidos, normalizan a mayúsculas, devuelven 400 si el valor no es válido y el repositorio persiste `visibilidad` al crear o actualizar la experiencia.
- **Pruebas de pantalla (objetivo 5):** `bienvenidaPantalla.test.js` comprueba que el formulario de experiencia incluye el selector de visibilidad, con las tres opciones y el valor por defecto `PUBLICA`, y que al editar mantiene el valor actual.
- **Formulario y envío (objetivo 6):** el selector se añadió en `frontend/bienvenida.html` y el formulario envía el valor elegido en la petición `POST`/`PATCH`.
- **Edición y conservación (objetivo 7):** `abrirFormulario` en `frontend/js/bienvenida.js` rellena el selector con la visibilidad actual de la experiencia y conserva el valor al volver a abrir el formulario.
- **Pruebas automáticas:** `experienciaValidacion.test.js` cubre la validación del campo y `bienvenidaPantalla.test.js` cubre el flujo de pantalla; la batería final del backend queda en verde.

### Comprobación
Se siguió un flujo de prueba con rojo → verde:

- La validación inicial fallaba porque el servicio no aceptaba ni normalizaba `visibilidad`.
- La pantalla fallaba porque el selector no existía ni se rellenaba al editar.
- Tras los cambios, la suite completa del backend quedó en verde con 49 suites y 408 pruebas correctas.

Desde `backend/`:

```powershell
npm test -- --runInBand
```

## CS-30: acceso a experiencias según visibilidad (objetivos 1 a 5)

**Autor:** Matthew Puente Villegas Michavil, con Copilot SDK en VS Code
**Historia:** CS-30, objetivos 1 a 5 · **Commits:** `95e07e9`, `f66c405`, `14f459f`, `3cbac43`

### Cambios
- **Objetivo 1:** se fijó la matriz de acceso: la experiencia pública la ve cualquiera; la privada la ve solo el autor; la de amigos la ve solo quien tiene amistad aceptada.
- **Objetivo 2:** se reforzó la prueba unitaria que cubre los casos clave del servicio compartido.
- **Objetivo 3:** se verificó que la regla ya estaba implementada en `services/shared/visibilidad.js` y reutiliza `amistadService.sonAmigos` sin consultar Prisma directamente.
- **Objetivo 4:** se añadió `obtenerExperiencia(usuarioId, experienciaId)` en el servicio y la ruta `GET /api/experiencias/:id` con sesión requerida, devolviendo la experiencia solo si existe y es visible.
- **Objetivo 5:** se unificó el mensaje de respuesta para ocultar la causa real: si la experiencia no existe o no es visible, la API devuelve `Contenido no disponible` con estado 404.

**Objetivo 1.** Se ha dejado fijada la matriz de acceso a experiencias según visibilidad y amistad aceptada. La regla compartida ya existía en CS-22 y se ha consolidado con pruebas que describen los casos de negocio del objetivo 1.

- **Pruebas de acceso:** `backend/tests/visibilidad.test.js` añade la matriz de casos para `PUBLICA`, `AMIGOS` y `PRIVADA`, incluyendo el autor y el requisito de amistad aceptada.
- **Contrato del negocio:** la regla queda definida como: el autor siempre puede verla; pública la ve cualquiera; privada solo la ve el autor; de amigos solo la ve quien tiene amistad aceptada con el autor.

**Objetivo 2.** Se ha reforzado la especificación unitaria de la lógica de visibilidad con una prueba base que cubre los casos críticos del acceso a experiencias. La historia sigue centrada en el servicio compartido y no cambia la implementación existente.

- **Pruebas unitarias:** `backend/tests/visibilidad.test.js` incorpora la batería del objetivo 2 para `PUBLICA`, `AMIGOS` y `PRIVADA`, con el caso del autor y la necesidad de amistad aceptada.
- **Cobertura del contrato:** la prueba fija que la decisión de acceso depende tanto del nivel de visibilidad como de la relación con el autor.

**Objetivo 3.** El objetivo 3 ya estaba resuelto por la implementación compartida de CS-22. La lógica de acceso vive en `backend/src/services/shared/visibilidad.js` y delega la comprobación de amistad a `amistadService.sonAmigos`, sin tocar Prisma ni duplicar la regla en cada flujo.

- **Servicio compartido:** `puedeVerExperiencia(usuarioId, experiencia)` decide entre autor, pública, privada y amistades aceptadas.
- **Cobertura de prueba:** `backend/tests/visibilidad.test.js` sigue validando los mismos casos de acceso y quedó en verde con la suite actual.

No se necesita cambio funcional adicional porque la regla ya está implementada y reutilizada.

**Objetivo 4.** Se ha añadido la consulta por id de una experiencia con sesión validada y comprobación de visibilidad antes de devolver el dato. La ruta ya protegida reutiliza la regla compartida sin duplicar la lógica.

- **Servicio:** `backend/src/services/experienciaService.js` incorpora `obtenerExperiencia(usuarioId, experienciaId)` y valida sesión, identificador y acceso visible.
- **Ruta:** `backend/src/routes/experienciaRoutes.js` expone `GET /api/experiencias/:id` con `requiereSesion`.
- **Pruebas:** `backend/tests/experienciaObjetivos.test.js` cubre caso visible, inexistente y sin permiso.

Primera versión del objetivo 4 (entrada titulada originalmente «CS-48: valoraciones de amigos y seguidores — Finalizada (06/10/2026)», del commit `14f459f` «CS-30 Tarea 4»): Se ha añadido la consulta por id de una experiencia con comprobación de sesión y de visibilidad antes de devolver el dato. La ruta real requiere autenticación y reutiliza la regla compartida de `puedeVerExperiencia` sin duplicar la lógica de negocio.

- **Servicio:** `backend/src/services/experienciaService.js` incorpora `obtenerExperiencia(usuarioId, experienciaId)`, validando la sesión, el identificador y la existencia de la experiencia; si no se puede ver, responde 403 y si no existe, 404.
- **Ruta:** `backend/src/routes/experienciaRoutes.js` añade `GET /api/experiencias/:id` protegido por `requiereSesion` y devuelve la experiencia solo cuando pasa la autorización.
- **Pruebas:** `backend/tests/experienciaObjetivos.test.js` añade la regresión para una experiencia visible, una inexistente y una no autorizada.

**Objetivo 5.** Se ha unificado el mensaje de respuesta cuando la experiencia no existe o el usuario no puede verla. En ambos casos la API responde con el mismo texto `Contenido no disponible` y el mismo estado 404 para no revelar la causa real del bloqueo.

- **Servicio:** `backend/src/services/experienciaService.js` hace que la comprobación de ausencia o visibilidad insuficiente termine en `crearError('Contenido no disponible', 404)`.
- **Pruebas:** `backend/tests/experienciaObjetivos.test.js` exige el mismo mensaje tanto para la experiencia inexistente como para la no visible.

### Comprobación
- `backend/tests/visibilidad.test.js` quedó en verde con la matriz de acceso.
- `backend/tests/experienciaObjetivos.test.js` quedó en verde con la validación del detalle de experiencia y el mensaje unificado de acceso.
- Objetivo 1: se añadieron pruebas que caracterizan el comportamiento ya implementado y validan la matriz de acceso. `npm test -- --runInBand tests/visibilidad.test.js` quedó en verde sin cambiar la lógica de negocio del servicio compartido.
- Objetivo 2: se añadió la prueba como contrato del comportamiento esperado y quedó en verde. `npm test -- --runInBand tests/visibilidad.test.js` pasó correctamente.
- Objetivo 4: se escribió primero la prueba que fallaba por la ausencia de la función; luego se implementó la comprobación y quedó en verde con `npm test -- --runInBand tests/experienciaObjetivos.test.js`. En la primera versión: se escribió primero la prueba que fallaba porque la función de detalle no existía. Tras implantar la consulta y la comprobación de visibilidad, `npm test -- --runInBand tests/experienciaObjetivos.test.js` quedó en verde.
- Objetivo 5: se actualizó la prueba de los casos de acceso para reflejar el contrato del objetivo 5 y se ejecutó con éxito. La suite queda en verde con `npm test -- --runInBand tests/experienciaObjetivos.test.js`.

## Guía de aprendizaje atemporal

**Autor:** Matthew Puente Villegas Michavil, con Codex de ChatGPT
**Historia:** sin historia · **Commits:** `63a851f`

### Cambios
Se revisó `documentacion/hoja-ruta-aprendizaje.md` para que sirva a cualquier integrante y pueda seguirse sin un calendario ni una revisión concreta. Nueve módulos explican fundamentos de programación, Git, interfaz, HTTP, arquitectura, datos, seguridad, TDD y configuración/despliegue. Cada uno incluye un laboratorio independiente, una búsqueda del concepto en el PlanB vigente y una comprobación de comprensión. La práctica final recorre una funcionalidad desde el criterio actual hasta su prueba y resultado visible. Las herramientas actuales se presentan como ejemplos, con indicaciones para encontrar sus equivalentes si cambia la implementación. Se actualizó la descripción de la guía en el README y se registró el prompt de Matthew en `documentacion/prompts/matthew.md`.

# 2026-10-06

## CS-01: valorar una experiencia (con el objetivo 1 de CS-22)

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-01, objetivos 1 a 10, y CS-22, objetivo 1 · **Commits:** `fbca9ee`, `ecdec8b`, `22e5728`, `1376235`, `83ecd71`, `f8c193f`, `b3973b5`, `87d2e26`

### Cambios
Se ha empezado CS-01. Como necesita saber si quien valora puede ver la experiencia, primero se ha añadido la visibilidad de las experiencias, que es el único objetivo de CS-22 imprescindible para CS-01 (acordado con Matthew, propietario de CS-22).

- **Datos (CS-22, objetivo 1):** nuevo enum `Visibilidad` (`PRIVADA`, `AMIGOS`, `PUBLICA`) y campo `visibilidad` en `Experiencia`, con valor por defecto `PUBLICA`. La migración `visibilidad_experiencia` añade la columna y las experiencias que ya existían quedan públicas.
- **Datos (CS-01, objetivo 1):** nuevo modelo `Valoracion` (usuario, experiencia, puntuación entera, comentario opcional, fechas de creación y de última modificación). La restricción única por usuario y experiencia garantiza una sola valoración por pareja; el índice por experiencia acelera listar sus valoraciones. La migración `crear_valoracion` solo crea la tabla nueva.
- **Crear y modificar una valoración:** `PUT /api/experiencias/:id/valoracion` (con sesión), cuerpo `{ puntuacion, comentario? }`. Si el usuario aún no había valorado la experiencia se crea (201); si ya la había valorado se actualiza la misma (200), nunca se crea una segunda. El usuario sale siempre de la sesión. Capas: `valoracionRoutes.js` → `valoracionService.js` → `valoracionRepository.js`. El repositorio intenta crear la valoración y, si MySQL la rechaza por duplicada (error `P2002` de la restricción única), actualiza la existente. Como la comprobación la hace MySQL dentro del propio INSERT, con peticiones simultáneas solo una la crea y las demás la actualizan: nunca hay duplicados ni errores.
- **Validaciones de la valoración:** si algo falla no se guarda nada. 401 si el usuario de la sesión ya no existe; 400 si el id no es válido, la puntuación no es un entero del 1 al 5 o el comentario no es texto; 404 «La experiencia no existe» tanto si no existe como si quien valora no puede verla (así no se revela su existencia); 403 si el autor intenta valorar su propia experiencia.
- **Regla de visibilidad compartida:** `services/shared/visibilidad.js` (`puedeVerExperiencia`): el autor siempre; pública, cualquiera; amigos, solo con amistad aceptada (`sonAmigos` de CS-61); privada, nadie más. Pensada para reutilizarse en CS-02, CS-30 y CS-63.
- **Pruebas:** `tests/visibilidadModelo.test.js` comprueba el enum y el valor por defecto en el esquema; `tests/valoracionModelo.test.js`, los campos de `Valoracion` y su restricción única; `tests/valoracionService.test.js` y `tests/valoraciones.test.js`, crear, modificar y cada rechazo en el servicio y por HTTP, incluido que seguir al autor no da acceso a sus experiencias de amigos; `tests/visibilidad.test.js`, la regla de visibilidad; `tests/valoracionRepository.test.js`, que el repositorio crea, pasa a actualizar ante un duplicado y relanza cualquier otro error.
- **Prueba con MySQL real (objetivo 10):** `tests/mysql/valoracionConcurrencia.test.js` comprueba en la base de datos que la restricción única rechaza un duplicado y que 20 peticiones simultáneas del mismo usuario dejan una sola valoración (una respuesta 201 y diecinueve 200, sin errores). Crea sus propios datos y los borra al terminar. Nuevos comandos: `npm run test:mysql` (solo estas pruebas) y `npm run test:todo` (`npm test` y después estas). `npm test` no las incluye, así que sigue funcionando sin Docker.

### Decisiones
#### Adelantar el objetivo 1 de CS-22
- **Contexto:** CS-01 necesita saber si quien valora puede ver la experiencia, y la visibilidad aún no existía.
- **Decisión:** se añade solo el campo `visibilidad` (objetivo 1 de CS-22), con valor por defecto `PUBLICA`.
- **Alternativas:** ninguna registrada.
- **Consecuencias:** las experiencias que ya existían quedan públicas. El resto de CS-22 sigue siendo de Matthew.
- **Decidió:** Joaquín, a propuesta de Claude; acordado con Matthew, propietario de CS-22.

#### Crear o actualizar la valoración en MySQL
- **Contexto:** con peticiones simultáneas del mismo usuario, comprobar primero si ya ha valorado y después crear deja pasar duplicados.
- **Decisión:** el repositorio intenta crear y, si MySQL la rechaza por la restricción única (`P2002`), actualiza la existente.
- **Alternativas:** ninguna registrada.
- **Consecuencias:** nunca hay duplicados ni errores; lo comprueba la prueba con MySQL real.
- **Decidió:** Joaquín, a propuesta de Claude.

#### 404 si quien valora no puede ver la experiencia
- **Contexto:** responder distinto a «no existe» y a «no la puedes ver» revela que existe.
- **Decisión:** 404 «La experiencia no existe» en los dos casos.
- **Alternativas:** ninguna registrada.
- **Consecuencias:** el 08/10 el mensaje pasa a «Contenido no disponible» en todas las rutas de una experiencia.
- **Decidió:** Joaquín, a propuesta de Claude.

### Comprobación
```bash
cd backend
npm test
```

Resultado esperado: 33 suites y 277 pruebas correctas.

Con Docker en marcha, `npm run test:todo` ejecuta además las pruebas con MySQL real: 1 suite y 2 pruebas correctas.

### Para quien continúe
- Aplicar las migraciones desde `backend/` con `npx prisma migrate deploy` y después `npx prisma generate`.

### Pendiente
- Falta el evento de valoración creada o modificada para CS-12 y CS-07. La longitud máxima y el saneado del comentario son de CS-02.
- Del resto de CS-22 todavía no hay nada: crear y editar no aceptan `visibilidad` y el formulario no tiene selector, así que toda experiencia nueva es pública.

## Excel de historias corregido

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** sin historia · **Commits:** `5a7eaf8`, `d1f472a`

### Cambios
Se ha sustituido el libro de `documentacion/customer-stories/` por la copia actual de OneDrive con estas correcciones:

- **Fila «Total» en todas las páginas y en la Plantilla:** suma el Tiempo estimado y el Tiempo total de los objetivos. Las páginas nuevas creadas con «Crear páginas» ya la traen.
- **Tiempo total sin duplicar:** el Tiempo total del Índice y de la cabecera de cada página suma solo las filas con número de objetivo. Antes también sumaba la fila «Total», y en CS-01, CS-22, CS-48, CS-61 y CS-62 el tiempo salía doble (CS-01 pasa de 1,7 h a 0,85 h).
- **Estado:** en CS-01, CS-22, CS-30, CS-45, CS-48 y CS-60 el número de objetivo estaba escrito a mano y el Índice no contaba esos objetivos, así que esas historias no podían llegar a «Finalizada». Se ha vuelto a poner la fórmula que los numera. CS-01 pasa a «Finalizada», porque tiene todos sus objetivos en «Sí».
- **Cómo añadir objetivos:** la ayuda de cada página y la sección 3.3 de `metodologia.md` explican el método nuevo: pulsar Tab en la última celda de la tabla, encima de «Total».
- **José** se ha añadido a la lista de responsables de todas las páginas y a `metodologia.md`.
- **Cambios hechos en OneDrive después de la primera descarga, incorporados:** tiempos de CS-48 (objetivo 3) y CS-62 (objetivos 9 y 10, ahora finalizados).
- **Datos:** títulos de CS-37 a CS-42 en mayúsculas, como el resto; prioridad de CS-06 corregida de «IM» a «N»; Tiempo estimado de CS-60 en 3 h, y su página vuelve a copiarlo del Índice.

### Para quien continúe
- El libro oficial sigue en OneDrive: hay que subir allí esta versión para que el equipo la use.
- El botón «Crear páginas» se conserva. Al abrir el libro, Excel recalcula todas las fórmulas.

## CS-61: base de amistades y seguidores (finalizada)

**Autor:** Matthew Puente Villegas Michavil, con Codex de ChatGPT
**Historia:** CS-61, objetivos 1 a 16 · **Commits:** `5f6ee02`, `cd0c569`, `0905a68`, `603e563`, `a66ad6e`, `aa00dcf`, `319f8e1`, `c782204`, `6b9ed44`, `6246ccd`, `7440fe9`, `73b12ca`, `a01b6cd`, `08c60fb`, `cbc104d`

### Cambios
Se ha completado la base de datos, la API y la interfaz de búsqueda, solicitudes, amistades y seguimientos. La historia cumple sus criterios de validación y ha sido comprobada manualmente por Matthew en escritorio y móvil.

- **Datos:** nuevos modelos `Amistad` y `Seguimiento`, con sus migraciones de Prisma. Las relaciones guardan quién inicia cada acción, la fecha y las claves foráneas a Usuario. Las restricciones únicas impiden repetir la misma solicitud o seguimiento.
- **Repositorios:** `amistadRepository` crea, busca en ambos sentidos o por identificador, acepta, borra y lista solicitudes pendientes recibidas. `seguimientoRepository` permite seguir, dejar de seguir y comprobar un seguimiento. La búsqueda de usuarios en `usuarioRepository` encuentra nombres que contienen el texto, excluye a quien busca, limita a 20 resultados y no devuelve emails.
- **Servicios:** las solicitudes solo se envían a otro usuario existente y sin relación previa; solo el destinatario puede aceptarlas o rechazarlas; cualquiera de los dos puede eliminar una amistad aceptada. Los seguimientos no permiten seguirse a uno mismo ni duplicarse. `sonAmigos` devuelve true exclusivamente para amistades aceptadas, de modo reutilizable para otras historias.
- **API:** nuevas rutas protegidas por sesión para búsqueda de usuarios, solicitudes recibidas, enviar/responder/eliminar amistades y seguir/dejar de seguir. Las creaciones responden 201, las eliminaciones 204 y las consultas o respuestas 200.
- **Interfaz:** `personas.html` permite buscar usuarios y enlaza cada resultado a `usuario.html` sin exponer emails ni insertar nombres como HTML. `perfil.html` muestra las solicitudes recibidas y permite aceptarlas o rechazarlas sin recargar. Las barras de bienvenida, perfil propio y perfil público incluyen «Buscar personas».
- **Pruebas:** se añadieron pruebas de esquema, repositorios, servicios, rutas, API y pantallas con jsdom. Cubren búsqueda, ausencia de resultados, solicitudes pendientes, duplicados, permisos de respuesta, rechazo, eliminación, seguimiento y navegación. La batería actual tiene 354 pruebas en 43 suites, todas correctas.
- **Registro de IA:** `documentacion/prompts/matthew.md` incorpora las entradas de los objetivos 1 a 16 de CS-61.

### Comprobación
- **Comprobación manual:** Matthew confirmó en escritorio y móvil la búsqueda, los enlaces al perfil, el envío y la respuesta de solicitudes y la navegación.

```powershell
cd backend
npm test
```

Resultado esperado: 43 suites y 354 pruebas correctas.

### Para quien continúe
- Al reutilizar las amistades, conservar la comprobación de relación en ambos sentidos del servicio para no crear duplicados.
- Las pantallas que necesiten estas funciones deben reutilizar `js/shared/api.js` y mantener la separación rutas → servicios → repositorios.

## CS-48: valoraciones de amigos y seguidores (finalizada)

**Autor:** Jorge Delgado Castellanos, con ChatGPT (GPT-5.6 Sol)
**Historia:** CS-48, objetivos 1 a 10 · **Commits:** `8822291`, `1d3f216`, `e4db6d7`, `d715051`, `699f011`, `73313fd`, `90d93aa`, `667ef6c`, `9f4fb51`, `005aae2`

### Cambios
Se ha implementado la consulta y presentación diferenciada de las valoraciones realizadas por amigos o seguidores del usuario que consulta una experiencia. La funcionalidad reutiliza las relaciones de CS-61 y la regla compartida de visibilidad de experiencias.

- **Consulta de valoraciones:** `valoracionRepository.listarDeUsuarios(experienciaId, usuarioIds, pagina, limite)` filtra por experiencia y por los usuarios relacionados, devuelve únicamente datos públicos del autor de cada valoración, calcula el total y pagina con un orden estable por última actualización e identificador. Si no hay usuarios relacionados devuelve una lista vacía sin consultar MySQL.
- **Amigos y seguidores:** `amistadRepository.listarAmigosIds` obtiene solo amistades aceptadas, independientemente de quién inició la solicitud. `seguimientoRepository.listarSeguidoresIds` obtiene a quienes siguen al solicitante (registros donde el solicitante es el usuario seguido).
- **Servicio:** `valoracionService.listarValoracionesRelacionadas` valida sesión, identificador de experiencia y paginación; devuelve 404 si la experiencia no existe y 403 si existe pero no es visible; obtiene amigos y seguidores en paralelo, elimina duplicados con un `Set` y delega la consulta paginada al repositorio.
- **API:** `GET /api/experiencias/:id/valoracion`, protegido por sesión, acepta `pagina` y `limite` opcionales y devuelve `{ valoraciones, total, pagina, limite }`.
- **Pantalla:** `frontend/bienvenida.html` y `frontend/js/bienvenida.js` incorporan «Ver detalle» junto a «Editar». El detalle abre un `<dialog>` con una sección propia «Valoraciones de amigos y seguidores», muestra nombre, puntuación y comentario, presenta un mensaje vacío cuando no hay resultados y permite avanzar o retroceder por páginas cuando existen más de diez valoraciones.
- **Actualización al recargar:** cada vez que se vuelve a abrir el detalle se consulta de nuevo la API, por lo que una valoración recién añadida aparece sin conservar una copia obsoleta en el navegador.
- **Pruebas:** se ampliaron las pruebas de repositorios, servicio y API; `bienvenidaPantalla.test.js` comprueba la sección, estado vacío, edición separada, paginación y recarga; `valoracionesRelacionadasCriterio.test.js` ejecuta rutas y servicios reales con repositorios en memoria y demuestra que aparecen amigos y seguidores, se excluyen terceros, se respeta el 403 de visibilidad, el vacío no da error, una nueva valoración aparece en la siguiente consulta y sin sesión se responde 401.

### Comprobación
- **Comprobación manual:** la sección se revisó en Chrome tanto en escritorio como en vista móvil de 375 px. Durante la primera ejecución real se detectó que el cliente Prisma local no estaba regenerado y `prisma.amistad` era `undefined`; tras `npx prisma generate` la pantalla funcionó sin modificar el código.
- **TDD y trazabilidad:** Las pruebas finales cubren los criterios de CS-48, pero durante esta implementación no se siguió de forma estricta el orden rojo → verde en todos los objetivos. En particular, algunos objetivos del Excel que indicaban «crear primero las pruebas» terminaron con pruebas añadidas después de la implementación. No se reconstruye una evidencia de fallo inicial que no se conservó. El detalle del trabajo asistido por IA y de esta desviación queda registrado en `documentacion/prompts/jorge.md`.
- Los commits principales son `8822291`, `1d3f216`, `e4db6d7`, `d715051`, `699f011`, `73313fd`, `90d93aa`, `667ef6c` y `9f4fb51`. Los dos primeros se hicieron antes de acordar la convención de incluir `CS-48 - Objetivo X` en el mensaje.

Desde `backend/`:

```powershell
npm.cmd test -- bienvenidaPantalla.test.js valoracionesRelacionadasCriterio.test.js --runInBand
npm.cmd test -- --runInBand
```

Para la comprobación manual, arrancar MySQL y PlanB, iniciar sesión, abrir «Ver detalle» en una experiencia y revisar la sección de valoraciones. Comprobar también la vista móvil desde las herramientas de desarrollo del navegador.

### Para quien continúe
- La unión considera **amigos aceptados** y **seguidores del solicitante**; un mismo usuario presente en ambos grupos solo se consulta una vez.
- Mantener el filtrado y la autorización en backend. La sección del frontend no debe decidir por sí sola quién puede ver una experiencia.
- La sección visual está integrada actualmente en el detalle abierto desde `bienvenida.html`. Si otra historia crea un detalle general de publicaciones o experiencias, debe reutilizar la misma API y no duplicar la regla de negocio.
- Después de recibir cambios de Prisma mediante `git pull`, ejecutar desde `backend/` tanto `npx prisma migrate deploy` como `npx prisma generate` antes de probar la aplicación.
- La configuración local utilizada por Jorge para evitar un conflicto de puerto MySQL no forma parte del repositorio ni debe trasladarse a `docker-compose.yml`.

# 2026-10-05

## Nuevas historias en el Excel (CS-61 a CS-64)

**Autor:** Joaquín de Vicente Abad
**Historia:** sin historia · **Commits:** `1cef900`

### Cambios
`documentacion/customer-stories/Customer_Stories_PlanB.xlsx` se sustituye por la versión más reciente, que añade cuatro historias, todavía sin propietario y en espera:

- CS-61 — Amistades y seguidores.
- CS-62 — Perfil de otro usuario.
- CS-63 — Pantalla de valoraciones y comentarios.
- CS-64 — Contraseña segura.

## Libro de historias en OneDrive

**Autor:** Matthew Puente Villegas Michavil, con Codex de ChatGPT
**Historia:** sin historia · **Commits:** `4627d16`, `a3fbc77`

### Cambios
`Customer_Stories_PlanB.xlsx` ya tiene su versión oficial en el OneDrive compartido y deja de mantenerse en Git. Cada tarea registra responsable voluntario, tiempo estimado y tiempo real. El integrante facilita una copia actual para consulta y traslada manualmente al libro online las tareas acordadas. Se actualizan `README.md`, `AGENTS.md`, la metodología y `.gitignore` para reflejar este flujo.

# 2026-10-02

## CS-49 y CS-57 (LUC01, LUC09): experiencias desde la bienvenida

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-49 (LUC01) y CS-57 (LUC09) · **Commits:** `c957303`

### Cambios
La pantalla de bienvenida muestra ahora las experiencias del usuario en una rejilla. La primera casilla es un «+» grande para crear una experiencia; al guardarla aparece justo detrás del «+». Al pulsar una tarjeta se abre el mismo formulario con sus datos para editarla.

- API: dos lecturas nuevas que usa la pantalla.
  - `GET /api/experiencias/mias` — las experiencias del usuario de la sesión, de la más nueva a la más antigua, cada una con su ciudad. Responde 401 sin sesión. Archivos: `routes/experienciaRoutes.js`, `services/experienciaService.js` (`listarExperienciasPropias`) y `repositories/experienciaRepository.js` (`listarPorAutor`).
  - `GET /api/ciudades` — el catálogo `[{ id, nombre, pais }]` ordenado por nombre, para el desplegable de ciudades. Es público. Archivos: `routes/ciudadRoutes.js` (nuevo), `routes/index.js`, `services/ciudadService.js` (`listarCiudades`) y `repositories/ciudadRepository.js` (`listar`).
  - `tests/listados.test.js` (nuevo) — sin sesión, sesión de un usuario que ya no existe, solo las experiencias del autor de la sesión y el catálogo de ciudades.
- Frontend:
  - `frontend/bienvenida.html` — rejilla de Bootstrap (2 columnas en móvil, 3 en tablet y 4 en escritorio) y formulario dentro de un `<dialog>`: título, descripción, ciudad (desplegable), tipo y momento adecuado.
  - `frontend/js/bienvenida.js` — carga a la vez las ciudades y las experiencias. El «+» abre el formulario vacío (`POST /api/experiencias`) y cada tarjeta lo abre con sus datos (`PATCH /api/experiencias/:id`). Al guardar, la tarjeta nueva se coloca detrás del «+» y la editada se sustituye en su sitio, sin recargar. Los errores del backend se muestran dentro del formulario, y el botón «Guardar» se desactiva mientras se envía.
  - `frontend/css/styles.css` — estilos del «+», de las tarjetas (descripción cortada a tres líneas) y del `<dialog>`.
- `README.md` y `documentacion/arquitectura.md` — estado del proyecto y selección de ciudad en la interfaz.

### Decisiones
#### Formulario en un `<dialog>` del navegador
- **Contexto:** La política de contenido de helmet solo deja cargar scripts propios, así que el JavaScript de Bootstrap (modales, desplegables...) no está disponible.
- **Decisión:** El formulario usa el elemento `<dialog>` del navegador con `showModal()`.
- **Alternativas:** el modal de Bootstrap, que necesita su JavaScript.
- **Consecuencias:** las ventanas nuevas usan `<dialog>`, no los componentes de Bootstrap que dependen de su JavaScript.
- **Decidió:** Joaquín.

### Comprobación
```bash
cd backend
npm install       # instala jest-environment-jsdom
npm test          # 182 pruebas, todas en verde
npm run dev
```

Abrir http://localhost:3000, iniciar sesión y, en la bienvenida:

1. Pulsar «+», rellenar el formulario y pulsar «Guardar»: la experiencia aparece justo detrás del «+».
2. Pulsar una tarjeta, cambiar algún dato y guardar: la tarjeta se actualiza en su sitio.
3. Escribir solo espacios en el título: el formulario muestra «El título es obligatorio» y no se cierra.
4. Recargar la página: las experiencias siguen ahí, de la más nueva a la más antigua.

Con curl (sesión iniciada con `-c cookies.txt` en el login):

```bash
curl -b cookies.txt http://localhost:3000/api/experiencias/mias
curl http://localhost:3000/api/ciudades
```

### Para quien continúe
- Las tarjetas se construyen con `textContent`, nunca metiendo el texto del usuario como HTML. Mantenerlo así en las tarjetas nuevas.
- `GET /api/experiencias/mias` sirve también para FLA02 (mis experiencias publicadas en el perfil).

## CS-57 (LUC09): pruebas de la edición, objetivos 6 y 7

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-57 (LUC09), objetivos 6 y 7 · **Commits:** `f26267b`

### Cambios
- Pruebas de la edición (LUC09, objetivos 6 y 7): `tests/edicionExperiencia.test.js` (nuevo), contra `PATCH /api/experiencias/:id`. El repositorio simulado guarda la experiencia en memoria para comprobar cómo queda después de cada petición.
  - Objetivo 6: la experiencia de otro usuario responde 403 y no cambia; una experiencia antigua sin autor tampoco se puede editar; sin sesión, 401.
  - Objetivo 7: los campos enviados sustituyen a los anteriores y los demás se conservan; al volver a consultar aparecen los datos nuevos; vaciar un opcional lo deja sin valor; no se puede cambiar el autor ni el id; si algún dato no es válido no se cambia nada.

## CS-47 (FLA05): pruebas del criterio del perfil, objetivo 10

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-47 (FLA05), objetivo 10 · **Commits:** `aae42d0`

### Cambios
- Pruebas del criterio de validación del perfil (FLA05, objetivo 10): `tests/perfilCriterio.test.js` (nuevo). Cada caso edita el perfil y después lo vuelve a consultar con `GET /api/perfil`: con un nombre válido y una foto permitida aparecen los dos; un nombre en uso por otra persona o con caracteres no permitidos se rechaza y sigue el anterior (sin guardar nada de esa petición); una foto GIF o de más de 5 MB se rechaza y sigue la anterior. Las pruebas de cada regla por separado ya estaban en `perfil.test.js` y `fotoPerfil.test.js`.

## CS-59 (MAT16): avisos del CAPTCHA en el registro, objetivos 5 a 7

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-59 (MAT16), objetivos 5, 6 y 7 · **Commits:** `2e4416e`

### Cambios
- Registro (MAT16, objetivos 5, 6 y 7):
  - `frontend/js/registro.js` — avisos visibles cuando el CAPTCHA no está disponible: si el script de Turnstile no carga (sin red o bloqueado), si no se puede pedir la clave pública al servidor o si falta en `.env` («No se ha podido cargar el CAPTCHA...»), y si Turnstile informa de un error («No se ha podido verificar el CAPTCHA...»; desaparece al resolverlo). Mientras se envía, el botón muestra un spinner y «Creando cuenta...»; tras cualquier error vuelve a «Crear cuenta» y queda disponible.
  - `tests/registroPantalla.test.js` (nuevo) — prueba la pantalla en un navegador simulado (jsdom) con el servidor (`fetch`) y Turnstile simulados: registro correcto, envío en curso sin envíos duplicados, datos inválidos, email y nombre duplicados, CAPTCHA rechazado, fallo de red con reintento y los casos de CAPTCHA no disponible. El registro en el backend ya lo probaban `auth.test.js` y `captcha.test.js`.
  - `backend/package.json` — nueva dependencia de desarrollo `jest-environment-jsdom`. El archivo de pruebas lo activa con el comentario `@jest-environment jsdom` de su cabecera; el resto de pruebas siguen en el entorno de Node.
  - `documentacion/arquitectura.md` y `README.md` — jsdom en la tabla de herramientas y en la sección de pruebas.

### Decisiones
#### Turnstile simulado en las pruebas
- **Contexto:** Turnstile real no se puede automatizar (Cloudflare rechaza los navegadores automatizados).
- **Decisión:** en las pruebas de pantalla, Turnstile siempre va simulado, igual que `fetch`.
- **Alternativas:** ninguna registrada.
- **Consecuencias:** el CAPTCHA real solo se comprueba a mano.
- **Decidió:** Joaquín.

### Comprobación
Registro: en http://localhost:3000/registro.html, con las herramientas del navegador bloquear `challenges.cloudflare.com` (pestaña *Network* → *Block request URL*) y recargar: aparece «No se ha podido cargar el CAPTCHA...». Al enviar el formulario, el botón muestra «Creando cuenta...» hasta que responde el servidor.

### Para quien continúe
- Las pruebas de pantallas cargan el HTML y los scripts de `frontend/` tal cual (ver la cabecera de `tests/registroPantalla.test.js`). Para probar otra pantalla, copiar ese esquema: `@jest-environment jsdom`, `fetch` simulado y el HTML cargado en `beforeEach`. Turnstile real no se puede automatizar (Cloudflare rechaza los navegadores automatizados), así que en las pruebas siempre va simulado.

## CS-47 (FLA05): la foto se sube en cuanto se elige

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-47 (FLA05) · **Commits:** `8102a6a`

### Cambios
- Foto de perfil (FLA05): ahora se sube en cuanto se elige. Antes solo se subía con el botón «Subir foto»: si se elegía el archivo y se pulsaba «Guardar cambios», la foto no se enviaba y aun así aparecía «Perfil actualizado.». El backend no cambia.
  - `frontend/perfil.html` — sin el botón «Subir foto»; debajo del campo, la ayuda «Se guarda en cuanto la eliges.».
  - `frontend/js/perfil.js` — al elegir el archivo (evento `change`) se envía a `PUT /api/perfil/foto`. Mientras se sube, el campo se desactiva y la ayuda dice «Subiendo foto...»; después se vacía el campo, así que volver a elegir el mismo archivo también lo sube.
  - `tests/perfilPantalla.test.js` (nuevo, jsdom) — al cargar se ve la foto guardada; al elegir una foto se sube sola y se ve la nueva; mientras se sube el campo está desactivado; si el servidor la rechaza se muestra el motivo y se queda la anterior.

### Comprobación
Foto de perfil: en «Mi perfil», elegir una foto. Se sube sola («Subiendo foto...» y después «Foto actualizada.») y se mantiene al recargar.

## Excel de historias: seguimiento y formato nuevo con referencias CS-XX

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** sin historia · **Commits:** `1848201`, `c5bf426`, `1826659`, `ed127f3`

### Cambios
- `customer-stories/Customer_Stories_PlanB.xlsx` — seguimiento actualizado. LUC09: objetivos 6 y 7 hechos y objetivo 8 nuevo (pantalla de edición). LUC01: objetivos 1 a 7 marcados como hechos (ya tenían su tiempo real) y objetivo 8 nuevo (pantalla de creación). FLA05: objetivo 10 hecho. MAT16: objetivos 5, 6 y 7 hechos. Las tareas cerradas hoy llevan 5 min de tiempo estimado. FLA05, LUC01 y MAT16 tienen ahora una columna «Tiempo Estimado (h)» en E, como la que ya tenía LUC09; «Tiempo Real (h)» no se ha movido. LUC09 objetivo 4 sigue pendiente de LUC02.
- Excel de customer stories con formato nuevo (`customer-stories/Customer_Stories_PlanB.xlsx`), preparado para usarse en Excel para la web desde OneDrive:
  - Referencias: todas las stories se llaman ahora `CS-XX`, numeradas desde `CS-01` en el orden que tenía el índice (JOA01–21 → CS-01–21, MAT01–15 → CS-22–36, JOR01–06 → CS-37–42, FLA01–06 → CS-43–48, LUC01–10 → CS-49–58, MAT16 → CS-59 y US60 → CS-60). Cada página se llama igual que su referencia, y las menciones dentro de los textos (HJ-07, FLA05...) usan ya la referencia nueva.
  - Índice: es una tabla de Excel («Historias») con Ref, Título (enlace a su página), Riesgo, Prioridad, Tiempo estimado, Tiempo total y Estado, sin la numeración ni la columna Propietario. Riesgo y Prioridad tienen desplegable y color (Prioridad: I = la más importante, N = media, M = poco importante). Tiempo estimado se escribe a mano, en horas.
  - Tiempo total y Estado se calculan solos a partir de los objetivos de cada página. Tiempo total es la suma de sus tiempos totales, en horas. Estado vale «En espera» si nadie ha cogido ningún objetivo, «En progreso» en cuanto un objetivo tiene responsable o está terminado, «Finalizada» cuando todos están en «Sí» y «Sin página» si la fila aún no tiene página. Las filas en progreso se resaltan en amarillo y negrita, y las finalizadas en gris. Cada columna tiene su filtro.
  - Páginas: arriba, los datos de la story (Ref, Título, Estado, Prioridad, Riesgo, Tiempo estimado, Tiempo total, Propietario, Fecha, Prior Reference, Task Description y Criterio de Validación); las celdas grises se rellenan solas desde el índice. Abajo, la tabla de objetivos: Objetivo (número automático), Descripción, Finalizado (Sí en verde, No en rojo), Responsable (desplegable con el equipo, admite otros nombres), Tiempo estimado y Tiempo total, los dos en minutos. La columna de notas desaparece.
  - Objetivos migrados de FLA05, LUC01, LUC09, MAT16 y US60: «Y» y «Hecho» pasan a «Sí» y los tiempos a minutos («30 min» → 30; los números sueltos estaban en horas, así que 0,5 → 30). En LUC01 (CS-49) el antiguo «Objetivo 4.1» pasa a ser el 5 y los siguientes suben uno. El objetivo 4 de LUC09 (CS-57), que estaba sin marcar, queda en «No». Riesgo unificado: «Baja» y «Alta» pasan a «Bajo» y «Alto».
  - Hoja «Plantilla», la última: la página vacía de la que salen las nuevas.
- `documentacion/office-scripts/crearPaginas.ts` (nuevo) — script del botón «Crear páginas» del Excel. Recorre el índice y, a cada fila con título, le pone la siguiente referencia libre si no la tiene, crea su página copiando «Plantilla» (con la referencia y la fecha de hoy) y enlaza el título. Es un Office Script: un programa en TypeScript que Excel para la web ejecuta dentro del libro desde la pestaña «Automatizar». Las fórmulas no pueden crear hojas, por eso este paso necesita el script.
- `documentacion/metodologia.md` — apartados 3.1 a 3.4 nuevos con la estructura del Excel, el esquema de colores y formatos, cómo añadir historias y objetivos y las precauciones para no romper las fórmulas. La introducción del apartado 3 indica que la reestructuración ya está hecha y que el traslado a OneDrive sigue pendiente.
- `documentacion/prompts/joaquin.md` — primera entrada del registro: el prompt de la reestructuración del Excel y las respuestas y aclaraciones que la concretaron.

### Decisiones
#### Un Office Script para crear las páginas
- **Contexto:** el libro irá a OneDrive y todo lo que tenga programado debe funcionar en Excel para la web. Las fórmulas no pueden crear hojas.
- **Decisión:** el botón «Crear páginas» es un Office Script (`documentacion/office-scripts/crearPaginas.ts`); el resto (índice, estado y tiempos) son fórmulas y tablas.
- **Alternativas:** ninguna registrada.
- **Consecuencias:** el botón se instala una vez en Excel para la web y necesita una cuenta de Microsoft 365 con Office Scripts.
- **Decidió:** Joaquín.

### Comprobación
Excel de customer stories, en Excel de escritorio o para la web:

1. En una página, poner un responsable en un objetivo sin terminar: en el índice la story pasa a «En progreso» y su fila se resalta. Con todos los objetivos en «Sí», pasa a «Finalizada».
2. Escribir una descripción en la fila vacía de debajo de la tabla de objetivos: la tabla crece, el número del objetivo aparece solo y su tiempo total se suma en la cabecera y en el índice.
3. Escribir un título en la fila vacía de debajo del índice: su estado es «Sin página». Con el botón instalado, pulsar «Crear páginas»: la fila recibe la referencia de «Próxima ref.» (arriba a la derecha) y aparece su página.

### Para quien continúe
- Botón «Crear páginas» del Excel: se instala una vez, con el libro ya en OneDrive y abierto en Excel para la web. Automatizar → Nuevo script → pegar `documentacion/office-scripts/crearPaginas.ts` → guardar como «Crear páginas» → en el panel del script, «…» → «Agregar en el libro». El botón queda en el libro para todos los que pueden editarlo. Necesita una cuenta de Microsoft 365 con Office Scripts: si no aparece la pestaña «Automatizar», no están disponibles.
- Sin el botón, una página nueva se crea a mano: clic derecho en «Plantilla» → Duplicar, renombrar la copia con la referencia de «Próxima ref.», escribirla en B2 de la página nueva y en la columna Ref de su fila del índice.
- El índice lee de cada página las columnas A (número de objetivo), C (Finalizado), D (Responsable) y F (Tiempo total) por su posición: no insertar ni mover columnas en las páginas. Tampoco insertar filas en la cabecera de «Plantilla»: el botón escribe la referencia en B2 y la fecha en B10. El índice se puede ordenar y filtrar sin problema.
- En Excel para la web, un filtro aplicado en el índice lo ven todos los que tienen el libro abierto. Para filtrar solo para uno mismo: Vista → Vista de hoja → Nueva.
- CS-06 tiene la prioridad «IM», que no es I, N ni M. Se ha dejado tal cual, sin color, para que la revise su propietario.
- Los documentos, pruebas y commits del repositorio siguen usando los códigos antiguos (FLA05, LUC09...).

## Metodología y registro del trabajo con IA

**Autor:** Matthew Puente Villegas Michavil, con Codex de ChatGPT
**Historia:** sin historia · **Commits:** `f0558ea`, `f3bd6ea`, `1ebc92d`, `b5ca912`

### Cambios
El equipo acuerda hacer explícito y trazable el uso de agentes de inteligencia artificial en el desarrollo de PlanB.

- `AGENTS.md` en la raíz: contexto común para agentes nuevos, con las fuentes de verdad, la arquitectura obligatoria, las convenciones de backend y frontend, las reglas de seguridad, las pruebas y la forma de entregar una tarea.
- `documentacion/metodologia.md`: proceso de preparación, colaboración, revisión y validación; reparto de responsabilidades entre el agente y la persona; y fichas pendientes para que cada integrante describa su forma real de trabajo.
- `documentacion/prompts/`: registro distribuido, con un índice común, una plantilla y un archivo por integrante para conservar los prompts relevantes sin incluir secretos ni inventar interacciones pasadas.
- `README.md`: enlaces a los tres documentos nuevos y actualización de la descripción de `documentacion/`.

**Ampliación acordada el 02/10/2026:**

- Se incorpora TDD como flujo preferente: prueba que falla, implementación mínima y refactorización. El integrante responsable debe entender la preparación, la acción y el resultado esperado del bloque de prueba añadido.
- Se documenta como pendiente el traslado y la reestructuración de `Customer_Stories_PlanB.xlsx` en OneDrive. Hasta que el README publique el enlace y la fecha de migración, el Excel del repositorio sigue siendo la referencia disponible.
- La metodología incluye el procedimiento concreto que Matthew utiliza en Windows para actualizar Git, dependencias, migraciones y pruebas, además de una plantilla para que el resto documente sus pasos reales en Windows, macOS o Linux y en su editor o terminal.
- Se añade una ficha para un sexto integrante todavía sin nombre, código de historias ni commits conocidos. Sus datos no se completarán por suposición.
- El registro de prompts pasa a un índice y un archivo por integrante en `documentacion/prompts/`.
- La ficha de Matthew queda completada con su entorno actual, objetivos de aprendizaje, preparación del contexto, revisión, TDD, actualización y precauciones. El uso futuro de un agente en Visual Studio se diferencia de las herramientas que ya utiliza.
- `documentacion/prompts/matthew.md` incorpora los prompts sustantivos conservados en esta conversación. Cuando no consta la fecha original, el documento identifica el 02/10/2026 como fecha de incorporación al registro y no como fecha atribuida al mensaje.
- `AGENTS.md` incorpora un protocolo de inicio: cuando alguien pide que se le ponga en contexto, el agente pregunta primero quién es, consulta su ficha y le proporciona los pasos apropiados para su sistema y entorno antes de preguntarle qué tarea va a realizar. La metodología incluye la frase de inicio recomendada.

### Decisiones
#### No reconstruir prompts anteriores
- **Contexto:** El equipo acuerda hacer explícito y trazable el uso de agentes de inteligencia artificial en el desarrollo de PlanB.
- **Decisión:** No se han reconstruido ni atribuido prompts anteriores. Cada integrante incorporará los suyos a partir del texto que conserve; un resumen de una interacción pasada deberá marcarse como reconstruido.
- **Alternativas:** no registradas.
- **Consecuencias:** no registradas.
- **Decidió:** el equipo.

#### Registrar lo que influye, no la conversación completa
- **Contexto:** el mismo.
- **Decisión:** No es necesario copiar conversaciones completas: se registran el prompt inicial, las correcciones que cambien la solución, el resultado, la intervención humana, las comprobaciones y el commit o pull request.
- **Alternativas:** no registradas.
- **Consecuencias:** no registradas.
- **Decidió:** el equipo.

#### La responsabilidad final es del integrante
- **Contexto:** el mismo.
- **Decisión:** La responsabilidad final sigue siendo del integrante que revisa e incorpora el cambio. El registro de IA aporta trazabilidad, pero no sustituye las pruebas ni la comprensión del código.
- **Alternativas:** no registradas.
- **Consecuencias:** no registradas.
- **Decidió:** el equipo.

#### Un archivo de prompts por integrante
- **Contexto:** el mismo.
- **Decisión:** El registro se divide por integrante para que pueda crecer sin convertir un único documento en un archivo difícil de consultar ni provocar conflictos frecuentes al editarlo entre varias personas.
- **Alternativas:** un único documento para todo el equipo.
- **Consecuencias:** no registradas.
- **Decidió:** el equipo.

### Comprobación
Abrir los enlaces de la sección «Documentación» del `README.md` y comprobar que cada integrante aparece tanto en la metodología como en el índice de `documentacion/prompts/`. Al iniciar una tarea nueva con un agente compatible, verificar que lee automáticamente el `AGENTS.md` de la raíz o proporcionárselo como contexto si la herramienta no admite este mecanismo.

## Hoja de ruta de aprendizaje de Matthew

**Autor:** Matthew Puente Villegas Michavil, con Codex de ChatGPT
**Historia:** sin historia · **Commits:** `14f9666`

### Cambios
Se añade `documentacion/hoja-ruta-aprendizaje.md` y se enlaza desde el README. Organiza dos semanas de aprendizaje con cuatro horas principales por semana y ampliaciones opcionales hasta doce. Incluye fundamentos de programación desde Java, seguimiento de una funcionalidad por las capas, preparación de la revisión, HTTP, seguridad, MySQL, Prisma, pruebas, TDD y un ejercicio de desarrollo frontend con Bootstrap en un archivo personal de práctica. Las actividades se basan en archivos y comandos existentes del proyecto. El prompt que motivó la guía se registra en `documentacion/prompts/matthew.md`.

# 2026-10-01

## CS-47 (FLA05): foto de perfil, tareas 4 y 5

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** CS-47 (FLA05), tareas 4 y 5 · **Commits:** `bdaa571`, `34c9381`

### Cambios
Cada usuario puede subir su foto de perfil: se guarda en Cloudinary y en MySQL solo su URL.

- `PUT /api/perfil/foto` — exige sesión. Recibe un formulario *multipart* con la foto en el campo `foto` y devuelve el perfil con la URL nueva.
- Tarea 4, validación (si falla responde 400, no se sube nada y se conserva la foto anterior):
  - formato JPG, PNG o WebP, comprobado por los primeros bytes del archivo (su firma), no por la extensión ni por el tipo que dice el navegador, que se pueden falsear;
  - tamaño máximo de 5 MB: multer deja de leer en cuanto se supera;
  - una sola foto y en el campo `foto`;
  - si el archivo empieza como una imagen pero está dañado, Cloudinary lo rechaza y la API responde «La foto no es una imagen válida».
- Tarea 5, almacenamiento: la foto se sube a Cloudinary (carpeta `planb/perfiles`, con nombre `usuario-<id>`) y en `Usuario.foto` se guarda solo su URL `https`. Cada usuario tiene una sola foto: la nueva sustituye a la anterior también en Cloudinary.
- Archivos:
  - `src/middlewares/fotoMiddleware.js` (nuevo) — `recibirFoto`: multer en memoria, límite de tamaño y errores en 400.
  - `src/repositories/fotoRepository.js` (nuevo) — `subirFotoPerfil`: sube a Cloudinary y devuelve la URL.
  - `src/repositories/usuarioRepository.js` — `actualizarFoto(id, url)`.
  - `src/services/perfilService.js` — `actualizarFotoPropia`: valida el formato, sube y guarda la URL.
  - `src/routes/perfilRoutes.js` — la ruta nueva.
  - `tests/fotoPerfil.test.js` (nuevo) — pruebas con MySQL y Cloudinary simulados.
  - `documentacion/arquitectura.md` — cómo llega la foto al backend (multer) y a Cloudinary.
- Excel: FLA05 tareas 4 y 5 marcadas como hechas, 30 min cada una.

### Decisiones
#### Formato comprobado por la firma del archivo
- **Contexto:** la extensión y el tipo que dice el navegador se pueden falsear.
- **Decisión:** el formato (JPG, PNG o WebP) se comprueba por los primeros bytes del archivo.
- **Alternativas:** comprobar la extensión o el tipo que envía el navegador.
- **Consecuencias:** un archivo que empieza como una imagen pero está dañado lo rechaza Cloudinary.
- **Decidió:** Joaquín.

### Comprobación
Foto de perfil, con el servidor arrancado (`npm run dev`) y una sesión iniciada con curl (`-c cookies.txt` en el login):

```bash
curl -b cookies.txt -X PUT http://localhost:3000/api/perfil/foto -F "foto=@mi-foto.png"   # 200, con la URL
curl -b cookies.txt -X PUT http://localhost:3000/api/perfil/foto -F "foto=@animacion.gif" # 400
curl -b cookies.txt http://localhost:3000/api/perfil                                      # la foto sigue ahí
```

Todo se ha probado contra Cloudinary y MySQL reales:
- la foto: subida, rechazo de una imagen dañada y consulta del perfil;
- las pantallas, con Chrome sin ventana (headless), también después de los renombrados.

Los datos de prueba se borraron después.

### Para quien continúe
- `cd backend && npm install`: hay dos dependencias nuevas, **cloudinary** (SDK oficial) y **multer** (recibe archivos de formularios en Express).
- Rellenar `CLOUDINARY_URL` en `backend/.env` con la del panel de Cloudinary (Dashboard → API Keys → *API environment variable*, con el secreto incluido). Pedid la del equipo a Joaquín; nunca se sube a git.
- FLA05 tarea 6 (imagen por defecto): `foto` es `null` mientras el usuario no sube ninguna. Para mostrar las fotos en el frontend hay que permitir `https://res.cloudinary.com` en `imgSrc` de la política de contenido de helmet (`src/app.js`); ahora solo se permiten imágenes propias.
- FLA05 tarea 10: faltan las pruebas de "edición reflejada" con la foto desde el frontend; las del backend están en `tests/fotoPerfil.test.js`. Para enviar la foto desde el frontend: `api()` (`js/shared/api.js`) pone por defecto `Content-Type: application/json`, y con un `FormData` hay que quitarla, porque esa cabecera la pone el navegador.

## Revisión y reorganización del código

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** sin historia · **Commits:** `e0baa24`, `b5b132f`, `ab5d116`, `bf99787`, `c33a9d0`, `90e802e`, `da3693a`, `0fe1d36`, `6be0644`, `b0c3fa8`, `30f6ab4`, `346d3b8`, `fed5b8f`, `d2db767`

### Cambios
- revisión del backend: repeticiones eliminadas y errores de validación corregidos en la edición del perfil;
- archivos del backend con el nombre de su capa y del frontend con el de su página;
- todo el código comentado en detalle.

La API no cambia: mismas URLs y mismas respuestas.

**Revisión del backend**

- `src/middlewares/sesionMiddleware.js` (nuevo) — `requiereSesion`: responde 401 `No hay sesión iniciada` si no hay sesión. Sustituye a la comprobación que se repetía en `GET /api/auth/yo`, en las rutas de `/api/perfil` (con `router.use`, para todas a la vez) y en `POST /api/experiencias`.
- `src/services/shared/nombreUsuario.js` (nuevo) — `validarNombreUsuario`: reglas del nombre de usuario, que antes estaban copiadas en `authService` y `perfilService`. Ahora el registro y la edición del perfil validan igual.
  - **Corrige** dos errores de `PUT /api/perfil`: un nombre que no era texto (por ejemplo `12345`) pasaba la validación y acababa en un error 500, y ahora es un 400; y el nombre no se normalizaba a NFC, así que «José» escrito de dos formas podía quedar como dos nombres distintos.
- `src/services/perfilService.js` — validación de `ciudad` en `PUT /api/perfil`. **Corrige** que cualquier valor llegaba a la base de datos: un objeto, un número o un texto de más de 191 caracteres (el tamaño de la columna) acababa en error 500. Ahora:
  - tiene que ser texto o `null`, y como máximo 191 caracteres; si no, responde 400;
  - se guarda sin espacios exteriores y normalizada a NFC;
  - `null` o un texto vacío dejan el perfil sin ciudad.
- `src/repositories/usuarioRepository.js` — los campos del perfil que se pueden mostrar están en una sola constante (`CAMPOS_PERFIL`), usada por `obtenerPerfil`, `actualizarPerfil` y `actualizarFoto`. Para mostrar un campo nuevo del perfil basta con añadirlo ahí.
- **Eliminado `GET /api/health`** por completo: la ruta, `src/repositories/saludRepository.js`, sus pruebas y el indicador «Servidor: conectado» del login. Ahora `/api/health` responde 404 como cualquier ruta inexistente.
- Pruebas nuevas: `PUT /api/perfil` sin cuerpo (no cambia nada), y un fallo inesperado de la base de datos en `PUT /api/perfil` y en el registro (responde 500 sin mostrar el detalle). Con ellas, `authService` y `perfilService` quedan cubiertos al 100 %.

**Backend: nombres por capa y carpetas `shared/`**

Cada archivo termina en el nombre de su capa (`Routes`, `Middleware`, `Service`, `Repository`), así que el nombre indica con qué capa habla: `perfilRoutes` → `perfilService` → `usuarioRepository`. En la carpeta `shared/` de cada capa está lo que no pertenece a ninguna funcionalidad ni tabla concreta; lo que comparten las rutas son los middlewares. Los archivos se han movido con `git mv`, así que conservan su historial:

| Antes | Ahora |
|---|---|
| `src/routes/auth.js` | `src/routes/authRoutes.js` |
| `src/routes/perfil.js` | `src/routes/perfilRoutes.js` |
| `src/routes/experiencias.js` | `src/routes/experienciaRoutes.js` |
| `src/middlewares/sesion.js` | `src/middlewares/sesionMiddleware.js` |
| `src/middlewares/limites.js` | `src/middlewares/limitesMiddleware.js` |
| `src/middlewares/foto.js` | `src/middlewares/fotoMiddleware.js` |
| `src/services/nombreUsuario.js` | `src/services/shared/nombreUsuario.js` |
| `src/repositories/prisma.js` | `src/repositories/shared/prisma.js` |
| `src/repositories/sesionStore.js` | `src/repositories/shared/sesionStore.js` |

- `errores.js` sigue en `src/`: lo usan servicios y middlewares.
- Actualizados los `require` del código y los `jest.mock` de `tests/setup.js` y `tests/limites.test.js`.
- `documentacion/arquitectura.md` — estructura del repositorio y regla de nombres.

**Frontend: un archivo JS por página**

Cada página tiene su JS con el mismo nombre que su HTML, y lo común a varias páginas está en `js/shared/`. Las pantallas funcionan igual.

| Antes | Ahora |
|---|---|
| `frontend/js/api.js` | `frontend/js/shared/api.js` |
| `frontend/js/auth.js` (login y registro) | `frontend/js/index.js` (login) y `frontend/js/registro.js` (registro y CAPTCHA) |

- `frontend/js/bienvenida.js` — escrito con `async/await`, como los demás.
- Los HTML cargan `js/shared/api.js` y después el JS de su página.
- `enviarFormulario()` ya no existe: cada página tiene su propio código de envío del formulario.
- `documentacion/arquitectura.md` — estructura del frontend.

**Comentarios en todo el código**

- Backend:
  - cada archivo de `src/` empieza con una cabecera: qué hace, su capa, quién lo usa y qué usa;
  - cada función explica qué recibe, qué devuelve y qué errores lanza;
  - las rutas indican método, URL, cuerpo esperado y respuesta;
  - también están comentados `prisma/seed.js`, `prisma/schema.prisma` (sus comentarios no generan migraciones) y las funciones auxiliares de los tests.
- Frontend: cada archivo de `frontend/js` explica qué hace cada paso.
- El código no cambia, salvo las rutas de los `require` y el nombre de una variable en `routes/index.js`. Se ha comprobado comparando cada archivo con su versión anterior sin comentarios.

### Decisiones
#### Archivos con el nombre de su capa
- **Contexto:** los archivos se llamaban por su tema, sin su capa: `routes/auth.js`, `middlewares/sesion.js`, `repositories/prisma.js`…
- **Decisión:** cada archivo termina en el nombre de su capa, así que el nombre indica con qué capa habla; lo que no pertenece a ninguna funcionalidad ni tabla va en la carpeta `shared/` de su capa.
- **Alternativas:** ninguna registrada.
- **Consecuencias:** las entradas anteriores citan nombres antiguos (ver la tabla); la regla está en `AGENTS.md` §4.
- **Decidió:** Joaquín.

#### Reglas comunes en una sola función
- **Contexto:** la comprobación de sesión se repetía en varias rutas y las reglas del nombre de usuario estaban copiadas en `authService` y `perfilService`.
- **Decisión:** `requiereSesion` y `validarNombreUsuario`, reutilizadas en todas partes.
- **Alternativas:** ninguna registrada.
- **Consecuencias:** el registro y la edición del perfil validan igual; las rutas nuevas con sesión usan `requiereSesion`.
- **Decidió:** Joaquín.

### Comprobación
```bash
cd backend
npm test          # 139 pruebas, todas en verde
npm run db:seed   # «0 ciudades creadas … 201 ya existentes»: no duplica nada
```

`npx jest --coverage` muestra la cobertura por archivo (abre `backend/coverage/lcov-report/index.html`). Los repositorios salen bajos porque las pruebas los simulan.

Pantallas, en el navegador:

- `/bienvenida.html` sin sesión lleva al login.
- Login con una contraseña incorrecta: aparece «Email o contraseña incorrectos» y el botón se puede volver a pulsar.
- Registro: se ve el CAPTCHA y, al crear la cuenta, lleva a la bienvenida con el nombre.
- Login con esa cuenta: lleva a la bienvenida con el nombre.

### Para quien continúe
- Varios archivos del backend y del frontend cambian de nombre o de carpeta (tablas de arriba). Si tenéis cambios sin subir en alguno, git avisará de conflicto: aplicad vuestros cambios sobre el archivo con el nombre nuevo.
- Funcionalidad nueva `x` en el backend: `routes/xRoutes.js` (montada en `routes/index.js`) → `services/xService.js` → el repositorio de la tabla que use.
- Página nueva `x.html`: su código va en `js/x.js`, cargado después de `js/shared/api.js`. Lo que usen varias páginas va en `js/shared/`. Los formularios nuevos siguen el modelo de `js/index.js`.
- Las rutas nuevas que exijan sesión deben usar `requiereSesion` (`src/middlewares/sesionMiddleware.js`), no repetir la comprobación.
- Para validar un nombre de usuario en otro sitio, usar `validarNombreUsuario` (`src/services/shared/nombreUsuario.js`).
- Las entradas anteriores de este documento citan nombres de archivo antiguos (`routes/auth.js`, `js/auth.js`, `enviarFormulario()`...). Las equivalencias están en las tablas de arriba.
- La ciudad del perfil (`Usuario.ciudad`) sigue siendo texto libre, distinta del catálogo `Ciudad` de las experiencias.

## CS-49 (LUC01): creación de experiencias y catálogo de ciudades (30/09–01/10)

**Autor:** Matthew Puente Villegas Michavil, con Codex de ChatGPT
**Historia:** CS-49 (LUC01), tareas 1 a 4 y tarea intermedia del catálogo inicial · **Commits:** `328f4ba`, `8070cd2`

### Cambios
Reúne las tareas 1–4 y la tarea intermedia del catálogo inicial.

- Modelo `Experiencia`: título, descripción, una única ciudad, autor y los campos opcionales tipo y momento adecuado.
- `POST /api/experiencias`: exige sesión, valida los datos y guarda la experiencia con el autor de la sesión. Responde 201 al crear, 400 ante datos inválidos y 401 sin sesión válida.
- Validación: rechaza campos obligatorios ausentes o vacíos y ciudades inexistentes. Prepara los textos y comprueba sus límites de almacenamiento.
- Catálogo local en `backend/data/capitales.json`: **201 capitales o sedes para 195 países** (193 miembros de la ONU y dos observadores). Países en español; ciudades en la grafía de la fuente.
- `npm run db:seed`: carga el catálogo sin internet y puede repetirse sin duplicar entradas. País + nombre identifica cada ciudad; se conservan los registros existentes.
- Arquitectura respetada: rutas → servicios → repositorios → Prisma → MySQL. Solo los repositorios acceden a Prisma.

El catálogo parte de [Countries](https://github.com/mledoze/countries), bajo ODbL-1.0; la licencia está en `backend/data/LICENSE-capitales.txt`. Se revisaron países con varias capitales o sedes, Yaren como sede de Nauru y el estatus disputado de Jerusalén. Guinea Ecuatorial usa Ciudad de la Paz, según [la declaración oficial de enero de 2026](https://www.guineaecuatorialpress.com/index.php/noticias/el_presidente_de_la_republica_proclama_la_ciudad_de_la_paz_como_capital_de_la_republica_de_guinea_ecuatorial_con_la_firma_de_un_decreto_ley). Es una instantánea del 01/10/2026, sin actualizaciones automáticas; territorios adicionales quedan fuera de este primer alcance.

### Decisiones
#### Datos anteriores al migrar
- **Contexto:** Las cuatro migraciones nuevas crean experiencias, relacionan ciudades, añaden autor y añaden país con su restricción de unicidad.
- **Decisión:** No se reescriben migraciones anteriores. La carga completa el país de una ciudad anterior si hay una sola coincidencia por nombre; conserva las ambiguas sin asignarles país. Las experiencias anteriores sin propietario conocido conservan `autorId = NULL`; las nuevas siempre reciben el autor de la sesión.
- **Alternativas:** no registradas.
- **Consecuencias:** La conversión de nombres puede unificar variantes de mayúsculas o acentos. **Con datos reales, revisar esas asociaciones y hacer una copia de seguridad antes de migrar.** No hay reversión automática. Hay que revisar esa propiedad antes de permitir su edición. MySQL impide borrar ciudades o autores que tengan experiencias.
- **Decidió:** no registrado.

### Comprobación
Con `npm run db:studio`, comprobar el catálogo y anotar el identificador de una ciudad. Arrancar con `npm run dev`, iniciar sesión y probar desde la consola del navegador (F12), sustituyendo `ciudadId` por ese identificador:

```js
const respuesta = await fetch('/api/experiencias', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ titulo: 'Tarde cultural', descripcion: 'Museo y paseo', ciudadId: 1 }),
});
console.log(respuesta.status, await respuesta.json());
```

Debe responder 201 y guardar el registro. Un título vacío o una ciudad inexistente deben devolver 400 sin guardar; sin sesión, 401. Cada petición válida crea otra experiencia.

Pasan **114 pruebas**. Cubren los criterios de campos obligatorios, ciudad válida y asociación única, además de sesión, autor, límites y catálogo. Las pruebas HTTP simulan los repositorios.

En MySQL temporal se verificaron migraciones, restricciones, conservación de datos, creación con servicio y repositorios reales y dos cargas del catálogo: la segunda no añadió registros. No se hizo una prueba HTTP completa con repositorios reales ni se modificó la base de PlanB; los contenedores de prueba se retiraron.

### Para quien continúe
Desde la raíz:

```powershell
docker compose up -d
cd backend
npx prisma migrate deploy
npx prisma generate
npm run db:seed
npm test -- --runInBand
```

Si faltan dependencias, ejecutar antes `npm ci` dentro de `backend/`. Docker arranca MySQL; las migraciones actualizan las tablas. No se necesitan nuevas variables en `.env`, que nunca se sube a Git.

### Pendiente
Quedan pendientes el formulario visual, listado de ciudades por API, edición y publicación. Al añadir lugares habrá que comprobar que pertenecen a la ciudad de la experiencia. Ampliar ciudades, territorios o traducciones es opcional.

## CS-49 (LUC01): pruebas de creación de experiencias, objetivos 5, 6 y 7

**Autor:** Lucía Alexandra Guzmán Álvarez
**Historia:** CS-49 (LUC01), objetivos 5, 6 y 7 · **Commits:** `e002bf8`

### Cambios
Los objetivos 5, 6 y 7 piden **pruebas**, no código nuevo: la lógica de `POST /api/experiencias` ya existe en `experienciaService`. Se añade un archivo de pruebas que los comprueba uno a uno, con los repositorios simulados (no necesita MySQL).

- `tests/experienciaObjetivos.test.js` (nuevo), con el mismo patrón que el resto de pruebas: repositorios simulados con `jest.mock()`, sin tocar la base de datos. No se modifica ningún archivo existente.
- Casos cubiertos:
  - **Objetivo 5, campos obligatorios:** si falta `titulo`, `descripcion` o `ciudadId` → 400 y no se llama a `experienciaRepository.crear`.
  - **Objetivo 6, solo su ciudad:** la ciudad se comprueba con `ciudadRepository.buscarPorId` y la experiencia se guarda con ese mismo `ciudadId`. Si la ciudad no existe → 400 y no se guarda nada.
  - **Objetivo 7, datos válidos:** `experienciaRepository.crear` recibe los datos validados más el `autorId` de la sesión (nunca el del cuerpo de la petición), y el resultado devuelve el `id` y el `autorId`.
- Archivos que usa la prueba:
  - `src/services/experienciaService.js` — `crearExperiencia` (lo que se prueba).
  - `src/repositories/ciudadRepository.js`, `experienciaRepository.js` y `usuarioRepository.js` — simulados.
  - `src/errores.js` — `crearError(mensaje, status)`, de donde sale el código 400.

### Comprobación
```bash
cd backend
npx jest tests/experienciaObjetivos.test.js   # solo el archivo nuevo
npm test                                      # toda la batería
```

### Para quien continúe
- Hace falta Node.js. En macOS: `brew install node` y comprobar con `node -v && npm -v`.
- Todos los comandos de npm se ejecutan dentro de `backend/`, no desde la raíz: `cd backend && npm install`.

### Pendiente
- Según el título original de la entrada: preparado, pendiente de ejecutar.

## CS-47 (FLA05): pantalla de mi perfil

**Autor:** Flavia Méndez Tsutsumi; las mejoras, con Claude Code
**Historia:** CS-47 (FLA05) · **Commits:** `d6c291e`, `6d3c692`, `d4d291d`

### Cambios
Desde la bienvenida hay un enlace "Mi perfil" que lleva a una pantalla donde ves y editas tu nombre de usuario y tu ciudad (el email no se puede tocar). 
Si tienes foto, se muestra.

- `frontend/bienvenida.html` — enlace "Mi perfil".
- `frontend/perfil.html` (nuevo) — el formulario.
- `frontend/js/perfil.js` (nuevo) — carga el perfil (`GET /api/perfil`) y guarda cambios (`PUT /api/perfil`).

**Mejoras y limpieza.** Mejoras sobre la pantalla de mi perfil y mis entradas anteriores de este documento. La API no cambia.

- `frontend/js/perfil.js`:
  - mismos nombres que el resto de páginas (`formulario`, `cajaError`, `cajaExito`, `boton`);
  - el botón «Guardar cambios» se desactiva mientras se envía (evita el doble envío) y se vuelve a activar al terminar, haya ido bien o mal;
  - tras guardar, el formulario muestra lo que devuelve el backend (sin espacios sobrantes y normalizado), no lo que se escribió;
  - nueva función `mostrarPerfil(perfil)`, usada al cargar y al guardar, y comentarios en cada paso.
- `frontend/perfil.html`:
  - usa la clase `contenedor-formulario` de `css/styles.css` en lugar de un estilo en línea, igual que el login y el registro;
  - `maxlength="30"` en el nombre de usuario (como en el registro) y `maxlength="191"` en la ciudad (tamaño de la columna en MySQL);
  - la etiqueta del email lleva `for="email"`.

### Comprobación
Inicia sesión → "Mi perfil" → cambia algo → guardar.

## CS-57 (LUC09): edición de experiencias

**Autor:** Jorge Delgado Castellanos
**Historia:** CS-57 (LUC09) · **Commits:** `d51e31a`, `384570d`, `eef4347`, `f4af21a`, `2a7070e`

### Cambios
Se añade la edición de experiencias existentes. Solo el autor de una experiencia puede modificarla.

- `PATCH /api/experiencias/:id` permite editar una experiencia existente.
- Se comprueba que haya una sesión iniciada, que la experiencia exista y que pertenezca al usuario de la sesión.
- Se pueden modificar de forma independiente:
  - `titulo`
  - `descripcion`
  - `tipo`
  - `momentoAdecuado`
  - `ciudadId`
- No es necesario enviar todos los campos, solo los que se quieran modificar.
- Los campos de texto mantienen sus validaciones de formato y longitud.
- Si se cambia `ciudadId`, se comprueba que la nueva ciudad exista.
- Cada experiencia mantiene una única ciudad asociada; cambiar `ciudadId` sustituye la anterior.

Archivos modificados:

- `src/repositories/experienciaRepository.js`
  - `buscarPorId(id)`
  - `actualizar(id, datos)`
- `src/services/experienciaService.js`
  - `validarEdicion(datos)`
  - `editarExperiencia(usuarioId, experienciaId, datos)`
- `src/routes/experienciaRoutes.js`
  - nueva ruta `PATCH /api/experiencias/:id`

### Comprobación
Desde `backend/`:

```bash
npm test
```

Pasan 145 pruebas.

Ejemplo de edición:

```js
const respuesta = await fetch('/api/experiencias/1', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    titulo: 'Nuevo título',
    tipo: 'Cultural'
  })
});

console.log(respuesta.status, await respuesta.json());
```

### Pendiente
Queda pendiente validar que, al cambiar la ciudad de una experiencia, todos los lugares asociados pertenezcan también a esa nueva ciudad.

Actualmente todavía no existe en el modelo de datos la relación entre experiencias y lugares necesaria para realizar esta comprobación.

## CS-47 (FLA05): imagen por defecto, objetivo 6

**Autor:** Lucía Alexandra Guzmán Álvarez
**Historia:** CS-47 (FLA05), objetivo 6 · **Commits:** `642754a`, `52c5192`, `08ccfd6`

### Cambios
Si el usuario no ha subido foto, la API devuelve una imagen por defecto en lugar de `null`. En MySQL sigue guardándose `null`: solo cambia lo que devuelve la API.

- `frontend/img/foto-por-defecto.svg` (nuevo) — silueta genérica. Al ser un archivo propio, la política de contenido (CSP) de `helmet` ya lo permite.
- `src/services/perfilService.js`:
  - constante `FOTO_POR_DEFECTO` (`/img/foto-por-defecto.svg`), exportada para las pruebas;
  - función `conFotoPorDefecto(perfil)`: si `foto` es `null`, la sustituye por la imagen por defecto;
  - la usan las tres funciones que devuelven un perfil: `obtenerPerfilPropio`, `actualizarPerfilPropio` y `actualizarFotoPropia`. Por tanto, `GET /api/perfil`, `PUT /api/perfil` y `PUT /api/perfil/foto` devuelven la misma `foto`.
- `tests/fotoPorDefecto.test.js` (nuevo): sin foto devuelve la imagen por defecto; con foto devuelve la suya.
- `tests/perfil.test.js`: el perfil simulado (línea 11) pasa de `foto: null` a una URL de Cloudinary, porque dos pruebas comparaban la respuesta con ese perfil y esperaban `null`.

`usuarioRepository.js` no cambia.

### Comprobación
```bash
cd backend
npm test          # 147 pruebas, todas en verde
```

Con el servidor arrancado (`npm run dev`) y una sesión iniciada con curl (`-c cookies.txt` en el login):

```bash
curl -b cookies.txt http://localhost:3000/api/perfil              # sin foto: "foto": "/img/foto-por-defecto.svg"
curl -b cookies.txt -X PUT http://localhost:3000/api/perfil/foto -F "foto=@mi-foto.png"
curl -b cookies.txt http://localhost:3000/api/perfil              # con foto: la URL de Cloudinary
```

La imagen se ve en http://localhost:3000/img/foto-por-defecto.svg.

### Para quien continúe
- El frontend ya no puede saber si un usuario tiene foto mirando solo `foto`. Si hace falta (por ejemplo, un botón «Añadir foto» solo cuando no hay ninguna), comparar con `/img/foto-por-defecto.svg` o devolver un campo extra desde `perfilService`.
- Para mostrar las fotos reales en una página hay que permitir `https://res.cloudinary.com` en `imgSrc` de la política de contenido de helmet (`src/app.js`); la imagen por defecto se ve sin tocar nada.
- Si un test nuevo compara la respuesta de la API con un perfil simulado, el perfil debe llevar una foto real (como en `perfil.test.js`); con `foto: null` la respuesta traerá la imagen por defecto.
- Hoy ninguna pantalla muestra la foto; cuando se añada una (por ejemplo en `bienvenida.html`), usar directamente `perfil.foto` como `src` de la imagen.

## CS-47 (FLA05): foto de perfil desde la pantalla y fotos de Cloudinary visibles

**Autor:** Flavia Méndez Tsutsumi, con Claude Code
**Historia:** CS-47 (FLA05) · **Commits:** `8287ef0`, `743cc07`, `5f4b881`

### Cambios
Ahora la foto de perfil se puede subir y cambiar desde la pantalla «Mi perfil», y las fotos subidas a Cloudinary se ven en la web. Antes solo se podía subir con curl y el navegador bloqueaba las fotos. La API no cambia.

- `backend/src/app.js` — la política de contenido de helmet permite imágenes de `https://res.cloudinary.com`. La imagen por defecto ya se veía porque es un archivo propio.
- `frontend/perfil.html` — formulario nuevo encima de los datos del perfil: campo de archivo (JPG, PNG o WebP), botón «Subir foto» y mensajes de error y de éxito.
- `frontend/js/perfil.js` — envía la foto a `PUT /api/perfil/foto`. Mientras se sube, el botón está desactivado; si va bien, muestra la foto nueva y «Foto actualizada.»; si no, el mensaje del backend («La foto debe ser JPG, PNG o WebP», «La foto no puede superar los 5 MB»...).
- `frontend/js/shared/api.js` — cuando se envía un archivo (`FormData`), `api()` ya no pone la cabecera `Content-Type: application/json`. El resto de llamadas no cambian.

### Comprobación
```bash
cd backend
npm test          # 147 pruebas, todas en verde
npm run dev
```

# 2026-09-30

## Perfil: test de la consulta del perfil propio

**Autor:** Flavia Méndez Tsutsumi
**Historia:** PB-01 (código de la entrada) · **Commits:** `850b1f1`

### Cambios
Test automático de `GET /api/perfil` (ver `perfil-consultar.md` para el endpoint en sí).

- `tests/perfil.test.js` (nuevo), con el mismo patrón que `auth.test.js`: repositorio simulado con `jest.mock()`, agente con sesión (`agenteConSesion()`).
- Casos cubiertos:
  - Sin sesión → 401.
  - Con sesión → 200, devuelve el perfil, sin `passwordHash`.
  - Si el usuario de la sesión ya no existe → 401.

### Comprobación
```bash
npm test
```

54 tests en total, todos en verde.

## Editar mi perfil

**Autor:** Flavia Méndez Tsutsumi
**Historia:** PB-01, tarea 8 (según el commit) · **Commits:** `8ea6d1d`

### Cambios
Ahora, si tienes la sesión iniciada, puedes cambiar tu nombre de usuario y tu ciudad desde tu perfil. Cada uno solo puede tocar el suyo, claro. El email de 
momento no se puede cambiar por aquí, lo dejamos fijo a propósito.

Qué comprueba antes de guardar:

- Que el nombre de usuario tenga entre 3 y 30 caracteres válidos (letras, números, `_`, `.` o `-`).
- Que ese nombre no lo esté usando ya otra persona.
- Que tengas la sesión iniciada, si no, no te deja tocar nada.

Archivos que he tocado:

- `src/repositories/usuarioRepository.js` — `actualizarPerfil(id, datos)`.
- `src/services/perfilService.js` — `actualizarPerfilPropio(id, datos)`, valida antes de guardar.
- `src/routes/perfil.js` — ruta `PUT /api/perfil`.
- `tests/perfil.test.js` — pruebas automáticas.

### Comprobación
```bash
npm test
```

58 tests en total, todos en verde.

# 2026-09-28

## Pantallas, refactorización y robustez

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** sin historia · **Commits:** `1295321`, `e775e1d`, `138c73a`, `73cd692`, `db563e5`, `ec0484b`, `49484d9`, `445ad7a`, `5bd9b55`, `a4edb4e`, `af6e6f6`, `232448c`, `ad28e42`, `87693ec`, `011b746`, `e2d2477`, `294e0fb`, `ac162d8`, `46b9814`, `efa3ffc`, `9a746ea`, `7c1f5f9`, `e444a7c`, `3940f9c`, `c59c0bf`

### Cambios
Lo importante para entender el cambio:

- **Pantallas:** `/` es el login (`login.html` ya no existe). Tras entrar o registrarse se llega a `bienvenida.html`, que saluda por el nombre; sin sesión, vuelve al login.
- **El servidor no se fía del navegador:** `authService` valida tipo, formato y longitud de cada dato y normaliza los textos (Unicode NFC; el email, sin espacios y en minúsculas). Los límites del HTML son solo una ayuda.
- **Errores:** los servicios lanzan `crearError(mensaje, status)` (`src/errores.js`) y `app.js` responde con ese código y `{ error: mensaje }` en español. Las rutas no llevan `try/catch`: Express 5 pasa solo los errores de las funciones `async`. Solo los fallos inesperados (500) se escriben en consola.
- **Sesiones en MySQL** (tabla `Session`): sobreviven a los reinicios del servidor y caducan tras un día sin actividad.
- **Capas:** Prisma solo se usa en `src/repositories/`; los límites de intentos, en `src/middlewares/`.

Qué ha cambiado:

- **Seguridad y robustez**
  - Registro: nombre de usuario de 3 a 30 letras (de cualquier alfabeto), números, `_`, `.` o `-`, sin espacios, emojis ni caracteres invisibles; email válido; contraseña de 8 caracteres a 72 bytes (bcrypt ignora lo que pasa de 72).
  - Datos incorrectos, nombre o email repetidos, JSON roto o petición sin cuerpo → 400 con un mensaje claro (antes, muchos daban 500).
  - Sesión nueva en cada login (evita la fijación de sesión); el logout también borra la cookie.
  - Límite por IP: 10 logins fallidos cada 15 minutos y 20 registros por hora → 429.
  - CAPTCHA Cloudflare Turnstile en el registro, comprobado antes de consultar la base de datos. El login tarda lo mismo exista o no el email. Ninguno de los dos permite averiguar qué emails están registrados.
  - Cabeceras de seguridad con `helmet`: CSP (solo scripts propios y los de Cloudflare), protección contra marcos ajenos, y sin `X-Powered-By`.
  - `/api/health` comprueba también MySQL (503 si no responde) y el indicador del login lo refleja.
  - Frontend: el fallo de red sale en español y los botones se desactivan mientras se envía el formulario.
- **Organización del código:** código repetido eliminado (dos clientes de Prisma, los dos formularios de `js/auth.js`, construcción de usuarios y errores en el servicio) y todo el backend comentado.
- **Pruebas:** `tests/setup.js` prepara el entorno de todas: sesiones en memoria, sin límites de intentos y con el CAPTCHA siempre aceptado. Los archivos `limites.test.js` y `captcha.test.js` prueban de verdad esas dos piezas. Ninguna prueba necesita MySQL.
- **Documentación:** `arquitectura.md` y el README describen las herramientas nuevas. `.gitignore` reescrito solo con lo que usa el proyecto.

### Decisiones
#### Sesiones guardadas en MySQL
- **Contexto:** las sesiones en memoria se pierden al reiniciar el servidor.
- **Decisión:** las sesiones se guardan en la tabla `Session` de MySQL, que sobreviven a los reinicios del servidor y caducan tras un día sin actividad.
- **Alternativas:** ninguna registrada.
- **Consecuencias:** migración nueva (tabla `Session`) y dependencia `@quixo3/prisma-session-store`.
- **Decidió:** Joaquín.

#### No revelar qué emails están registrados
- **Contexto:** un login que tarda menos cuando el email no existe, o un registro sin CAPTCHA, permite averiguar qué emails están registrados.
- **Decisión:** CAPTCHA Cloudflare Turnstile en el registro, comprobado antes de consultar la base de datos, y un login que tarda lo mismo exista o no el email.
- **Alternativas:** ninguna registrada.
- **Consecuencias:** el registro necesita internet para verificar el CAPTCHA y, para desplegar, claves reales de Cloudflare.
- **Decidió:** Joaquín.

### Comprobación
1. `npm test` dentro de `backend/` — pasan todas las pruebas.
2. `npm run dev` y abrir http://localhost:3000:
   - login con contraseña incorrecta → error; con la correcta → bienvenida;
   - registro: sin esperar al CAPTCHA → «No se ha podido comprobar que no eres un robot»; con un email repetido → «El email ya está registrado»;
   - reiniciar el servidor con la sesión iniciada y recargar la bienvenida → sigue la sesión.

### Para quien continúe
Antes de nada, tras el `git pull`, en `backend/`:

1. `npm install` — hay dependencias nuevas (`helmet`, `express-rate-limit`, `@quixo3/prisma-session-store`) y `bcrypt` pasa a la versión 6.
2. `npx prisma migrate deploy` — crea la tabla `Session`.
3. Copiar a `.env` las variables `TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY` de `.env.example`. **Sin ellas no se puede registrar nadie.** Son claves de prueba de Cloudflare, que siempre aceptan.

- Enlaces al login: a `/`.
- La CSP bloquea los scripts en línea (`<script>…</script>`, `onclick="…"`) y los de otros dominios: el código va en archivos de `js/`, y lo que se cargue de otro dominio hay que añadirlo a la configuración de `helmet` en `app.js`.
- Formularios nuevos: `enviarFormulario()` de `js/auth.js`, con el id del formulario, el de la caja de error, la ruta de la API y los campos.
- El registro necesita internet para verificar el CAPTCHA. Para desplegar, crear las claves reales en Cloudflare → Turnstile.

## Perfil: consultar el perfil propio

**Autor:** Flavia Méndez Tsutsumi
**Historia:** PB-01, primera parte (código de la entrada) · **Commits:** `a02b848`, `8f591bb`

### Cambios
Primera parte de PB-01. Endpoint de solo lectura del propio perfil.

- `usuarioRepository.obtenerPerfil(id)` — trae solo `id`, `nombreUsuario`, `email`, `foto`, `ciudad` (nunca la contraseña).
- `perfilService.obtenerPerfilPropio(id)` — llama al repositorio, 401 si el usuario ya no existe.
- `GET /api/perfil` — comprueba la sesión y devuelve el perfil.

### Comprobación
```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"...","password":"..."}' -c cookies.txt

curl -i http://localhost:3000/api/perfil -b cookies.txt   # 200, con los datos
curl -i http://localhost:3000/api/perfil                  # 401 sin sesión
```

# 2026-09-25

## Arquitectura y estructura base

**Autor:** Joaquín de Vicente Abad, con Claude Code
**Historia:** sin historia · **Commits:** `2b557c8`, `486a46c`, `22a7ce1`, `f829150`

### Cambios
Documentación de la arquitectura y esqueleto del proyecto listo para empezar a desarrollar.

- Documentación:
  - `documentacion/arquitectura.md` — alcance técnico, capas del sistema, herramientas y sus ventajas, comunicación frontend–backend, autenticación y autorización, estructura del repositorio, instalación de herramientas, entorno de desarrollo y pruebas.
  - `README.md` — resumen de la arquitectura, tabla de tecnologías y puesta en marcha.
- Entorno:
  - `docker-compose.yml` — MySQL 8.4 (usuario `root`, contraseña `planb`, base de datos `planb`) con los datos en un volumen persistente.
  - `backend/.env.example` — plantilla de variables: `DATABASE_URL`, `PORT`, `SESSION_SECRET`, `CLOUDINARY_URL`.
  - `backend/package.json` — Express 5, express-session, bcrypt, Prisma 6, Jest y Supertest. Scripts `dev`, `start`, `test`, `db:migrate` y `db:studio`. Incluye `allowScripts` para Prisma y bcrypt, porque npm 11 bloquea por defecto los scripts de instalación.
  - `backend/package-lock.json` — versiones exactas de todas las dependencias.
- Backend, siguiendo la arquitectura en capas:
  - `src/app.js` — configuración de Express: JSON, sesiones (cookie HttpOnly, sameSite lax), API bajo `/api`, archivos del frontend, 404 en JSON para `/api` y manejador de errores 500.
  - `src/server.js` — arranque del servidor. Está separado de `app.js` para que los tests usen la aplicación sin abrir el puerto.
  - `src/routes/index.js` — `GET /api/health`.
  - `src/repositories/prisma.js` — cliente de Prisma compartido.
  - `src/services/` y `src/middlewares/` — creadas vacías.
  - `prisma/schema.prisma` — conexión a MySQL, sin modelos.
  - `tests/health.test.js` — pruebas de `/api/health` y del 404 de la API.
- Frontend:
  - `index.html` — página inicial con Bootstrap (CDN) que muestra si el servidor responde.
  - `js/api.js` — función `api()` para todas las llamadas al backend.
  - `js/index.js` y `css/styles.css`.

### Decisiones
#### `server.js` separado de `app.js`
- **Contexto:** las pruebas necesitan la aplicación de Express sin abrir el puerto.
- **Decisión:** `src/server.js` solo arranca el servidor; la configuración está en `src/app.js`.
- **Alternativas:** ninguna registrada.
- **Consecuencias:** las pruebas con Supertest importan `app.js`.
- **Decidió:** Joaquín.

### Comprobación
1. Desde la raíz del repositorio: `docker compose up -d`.
2. `cd backend`, copiar `.env.example` a `.env`, `npm install` y `npm run db:migrate`.
3. `npm test` — pasan las 2 pruebas.
4. `npm run dev` y abrir http://localhost:3000 — aparece «conectado» en verde.

### Para quien continúe
- Las capas se respetan en una sola dirección: rutas → servicios → repositorios. Solo los repositorios usan Prisma.
- Para cambiar la estructura de la base de datos: editar `schema.prisma`, ejecutar `npm run db:migrate` y subir la migración generada junto con el código.
- Tras un `git pull` que traiga migraciones nuevas: `npx prisma migrate deploy` y `npx prisma generate` dentro de `backend/`.
- En Linux, usar `docker` sin `sudo` requiere estar en el grupo `docker` y cerrar sesión después de instalarlo.
- `GET /api/health` no consulta MySQL: responde aunque la base de datos esté parada.

## Login

**Autor:** Flavia Méndez Tsutsumi (código, `18010f8`); entrada escrita por Joaquín de Vicente Abad (`f829150`)
**Historia:** sin historia · **Commits:** `18010f8`

### Cambios
Autenticación completa: registro, inicio de sesión y sesiones.

- Modelo `Usuario` en `prisma/schema.prisma` (id, nombreUsuario, email, passwordHash, foto, ciudad, creadoEn). Migración aplicada.
- Backend, siguiendo la arquitectura en capas:
  - `src/prismaClient.js` — instancia única de Prisma, compartida por todo el backend.
  - `src/repositories/usuarioRepository.js` — crear / buscar usuario en MySQL.
  - `src/services/authService.js` — lógica de registro e inicio de sesión. Cifra la contraseña con bcrypt, nunca se guarda en texto plano.
  - `src/routes/auth.js` — rutas: `POST /api/auth/registro`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/yo`.
- Frontend:
  - `login.html` y `registro.html` (Bootstrap, mismo estilo que el resto).
  - `js/auth.js` — envía los formularios con fetch, usando la función `api()` que ya existía.

### Comprobación
1. Ve a http://localhost:3000/registro.html y crea una cuenta.
2. Te redirige a `/` con la sesión ya iniciada.
3. Para probar el login por separado: http://localhost:3000/login.html.

### Para quien continúe
- La sesión se guarda con `req.session.usuarioId` (cookie HttpOnly, ya configurada en `app.js`).
- Para proteger una ruta nueva (que solo la vea alguien logueado), comprobar `req.session.usuarioId` igual que hace `GET /api/auth/yo`. Se puede sacar a un middleware común si hace falta en varias rutas.

### Pendiente
- Pendiente: mostrar en el frontend si hay sesión iniciada (por ejemplo, saludo + botón de cerrar sesión en `index.html`). No estaba pedido para esta tarea.

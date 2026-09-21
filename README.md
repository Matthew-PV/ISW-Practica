# PRÁCTICA - ISW

## PlanB



### 1\. Planteamiento inicial

PlanB es una propuesta conceptual de red social, con aplicación móvil y versión web, orientada a compartir y descubrir **experiencias**: colecciones de planes y lugares de una ciudad (parques, museos, restaurantes, negocios, eventos) diseñadas por otros usuarios. Su objetivo sería resolver el problema de "no saber qué hacer" ofreciendo planes ya pensados, reales y recomendados por personas cercanas o con gustos similares.

La idea se sitúa entre varias categorías:

* Redes sociales de contenido compartido, como Instagram o Pinterest;
* Guías y reseñas de lugares, como Google Maps o TripAdvisor;
* Planificadores de viajes y planes, como Wanderlog;
* Listas colaborativas y recomendaciones entre amigos.



### 2\. Problema y oportunidad

Decidir qué hacer en una ciudad suele requerir tiempo y varias herramientas a la vez:

* Buscar lugares en un mapa o en una guía;
* Leer reseñas de desconocidos que no siempre reflejan los gustos propios;
* Preguntar a amigos por mensajería, sin que las recomendaciones queden organizadas;
* Combinar varios lugares en un plan coherente (qué visitar, en qué orden, cuánto cuesta y cuánto dura);
* Descartar planes por falta de información sobre precio, duración o ambiente.

Las herramientas actuales cubren bien la búsqueda de un lugar concreto, pero cubren peor la pregunta "¿qué hago hoy?" o "¿qué hago un fin de semana en esta ciudad?". PlanB intentaría cubrir ese espacio: no recomienda locales sueltos, sino **planes completos** creados por personas reales, con contexto (presupuesto, duración, tipo de plan) y con la posibilidad de seguirlos paso a paso.



### 3\. Público objetivo

El público inicial podría incluir:

* estudiantes universitarios que buscan planes económicos en su ciudad;
* personas que se mudan a una ciudad nueva y no conocen qué ofrece;
* turistas y visitantes de fin de semana;
* grupos de amigos o parejas que quieren organizar una salida;
* personas que disfrutan descubriendo y recomendando sitios.

**Decisión propuesta:** inicialmente solo existirían perfiles de personas. Los negocios y empresas aparecerían únicamente como lugares dentro de las experiencias, no como usuarios con cuenta propia. Los perfiles de empresa se estudiarían más adelante.



### 4\. Objetivos

Los objetivos principales de PlanB serían:

1. Reducir el tiempo necesario para decidir qué hacer.
2. Permitir crear experiencias de forma sencilla desde el móvil.
3. Facilitar el descubrimiento de planes por ciudad, presupuesto, duración y tipo de actividad.
4. Aprovechar la confianza entre amigos mediante recomendaciones de personas conocidas.
5. Permitir guardar y seguir experiencias como una lista de pasos.
6. Fomentar que los usuarios compartan sus propios descubrimientos.
7. Mantener una comunidad con contenido útil, veraz y respetuoso.



### 5\. Principios de diseño del producto

##### 5.1. Responder rápido a "¿qué hago hoy?"

El usuario debería llegar a un plan adecuado en pocos pasos, con filtros claros y resultados comprensibles a simple vista.

### 

##### 5.2. El plan es la unidad principal

La aplicación no gira en torno a lugares aislados, sino a experiencias completas: varios lugares ordenados, con información práctica.



##### 5.3. Contenido creado por personas

El valor del producto depende de las experiencias que los usuarios crean. Crear una experiencia debería ser rápido y agradable, y compartirla debería tener recompensa social (guardados, valoraciones, seguidores).



##### 5.4. Privacidad controlada por el usuario

Cada persona decide quién ve sus experiencias y qué información de su perfil es visible.



##### 5.5. Modularidad

Cada funcionalidad (perfiles, amigos, búsqueda, seguimiento, valoraciones) debería poder desarrollarse y probarse con relativa independencia, de modo que se pueda construir una primera versión sin implementar todo el producto.



### 6\. Módulos funcionales propuestos

Los siguientes módulos representan posibilidades de alcance. No todos son obligatorios.



##### 6.1. Módulo de cuentas y perfiles

Cada usuario podría tener un perfil con:

* nombre de usuario y foto;
* ciudad de residencia o ciudad favorita;
* experiencias publicadas;
* experiencias guardadas (visibles solo si el usuario lo decide);
* número de amigos y seguidores;
* valoraciones recibidas.



##### 6.2. Módulo de amigos

Los usuarios podrían agregar amigos de dos formas:

* buscando por nombre de usuario;
* sincronizando su libreta de contactos, siempre con permiso explícito.

La relación de amistad sería recíproca: requiere que la otra persona acepte la solicitud.



##### 6.3. Módulo de creación de experiencias

Una **experiencia** es una colección ordenada de planes y actividades vinculados a lugares concretos de **una única ciudad**. Al crearla, el usuario podría:

* ponerle título, descripción y ciudad;
* añadir lugares (parques, museos, restaurantes, negocios, eventos);
* ordenar los lugares en una secuencia;
* añadir fotos y comentarios a cada lugar;
* indicar tarifas aproximadas y duración estimada;
* mencionar eventos específicos y sus fechas;
* clasificarla por tipo (gastronómico, cultural, aire libre, nocturno, familiar...);
* indicar para qué momento es adecuada (mañana, tarde, fin de semana, temporada).

**Decisión propuesta:** cada experiencia pertenece a una sola ciudad. Si el usuario quiere cubrir varias ciudades, crea una experiencia por ciudad. Esto simplifica la búsqueda, los filtros y el modelo de datos.



##### 6.4. Módulo de publicación y visibilidad

Cada experiencia podría tener uno de estos niveles de visibilidad:

* **privada**: solo la ve su autor (borrador);
* **amigos**: la ven únicamente los amigos del autor;
* **pública**: aparece en la búsqueda para cualquier usuario.

Las experiencias públicas aparecerían en la búsqueda y en el perfil del autor. Las de amigos aparecerían en el inicio de sus amigos y en el perfil del autor, solo para ellos.



##### 6.5. Módulo de búsqueda de experiencias

Es la **funcionalidad principal** del producto. El usuario podría explorar experiencias creadas por otros y filtrar por:

* ciudad;
* nombre o palabra clave;
* tipo de experiencia;
* presupuesto aproximado;
* duración;
* momento del día o de la semana;
* valoración;
* experiencias de mis amigos.

Los resultados podrían ordenarse por relevancia, novedad, valoración o cercanía.



##### 6.6. Módulo de guardado

Los usuarios podrían guardar experiencias que les interesen para consultarlas más tarde, organizadas en una lista personal. Una experiencia guardada seguiría vinculada a la original.

**Decisión propuesta:** las experiencias guardadas no se modifican. Si el usuario quiere adaptarlas, puede **duplicarlas** y editar su propia copia, que mantiene un enlace de atribución al autor original.



##### 6.7. Módulo de seguimiento de experiencias

Un usuario podría **iniciar** una experiencia como una lista de pasos a seguir. Cada lugar sería un elemento que se puede marcar como completado (checklist), y se mostraría el progreso. Al terminar, el sistema podría invitar a valorar la experiencia.



##### 6.8. Módulo de valoraciones y comentarios

Los usuarios podrían:

* valorar una experiencia con una puntuación;
* dejar un comentario sobre ella;
* indicar si les resultó útil;
* señalar información desactualizada (por ejemplo, un local cerrado o un precio cambiado).



##### 6.9. Módulo de moderación y reportes

Para mantener la calidad del contenido, los usuarios podrían reportar experiencias, comentarios o perfiles. El equipo necesitaría un mecanismo básico para revisar los reportes y retirar contenido inapropiado, engañoso o publicitario encubierto.



##### 6.10. Módulo de notificaciones

Los usuarios podrían recibir avisos sobre solicitudes de amistad, comentarios, valoraciones y novedades de sus amigos. Debería poder configurarse qué avisos se reciben.



##### 6.11. Módulo de mensajería (opcional)

Un chat entre amigos para comentar planes o compartir una experiencia directamente. **Decisión propuesta:** queda fuera de la primera versión. Como alternativa inicial, se permitiría compartir una experiencia mediante un enlace o a través de otras aplicaciones de mensajería.



##### 6.12. Módulo de recomendaciones (posterior)

El sistema podría sugerir experiencias según la ciudad, los gustos, los guardados y las valoraciones del usuario. Se plantea como ampliación posterior, una vez exista suficiente contenido.



### 7\. Plataformas

### Aplicación móvil

Sería el entorno principal para:

* explorar y buscar experiencias;
* seguir una experiencia mientras se recorre la ciudad;
* crear experiencias de forma rápida, con fotos tomadas en el momento;
* gestionar amigos y notificaciones.

### Plataforma web

Podría complementar la aplicación con:

* creación y edición de experiencias con más comodidad (teclado, pantalla grande);
* exploración y búsqueda;
* compartir experiencias mediante enlaces visibles sin instalar la aplicación.

La solución técnica concreta, el nivel de reutilización entre clientes y la prioridad de cada plataforma tendrían que decidirse durante el diseño del proyecto.



### 8\. Contenidos y modelo de datos

Los datos principales del sistema podrían ser:

* **Usuario**: identificador, nombre de usuario, correo, foto, ciudad, ajustes de privacidad.
* **Amistad**: usuario emisor, usuario receptor, estado (pendiente, aceptada).
* **Experiencia**: autor, título, descripción, ciudad, tipo, presupuesto estimado, duración estimada, visibilidad, fecha de creación, experiencia original (si es una copia).
* **Lugar**: nombre, dirección o coordenadas, categoría.
* **Elemento de experiencia**: experiencia, lugar, posición en la secuencia, comentario, foto, tarifa, evento asociado.
* **Guardado**: usuario, experiencia.
* **Seguimiento**: usuario, experiencia, elementos completados, fecha de inicio y fin.
* **Valoración**: usuario, experiencia, puntuación, comentario.
* **Reporte**: usuario que reporta, contenido reportado, motivo, estado.



### 9\. Comparación con soluciones existentes

* **Google Maps**: Buscar lugares concretos, reseñas, rutas. Le falta respecto a PlanB: no organiza planes completos con criterio humano
* **TripAdvisor**: Reseñas y guías de destinos. Le falta respecto a PlanB: orientado a turismo, con menos peso social y menos planes cotidianos
* **Instagram / TikTok**: Inspiración visual y contenido social. Le falta respecto a PlanB: contenido difícil de buscar y de convertir en un plan ordenado
* **Wanderlog**: Planificación de viajes. Le falta respecto a PlanB: centrado en viajes, no en el "qué hago hoy" de tu propia ciudad
* **Listas de Google Maps**: Guardar lugares. Le falta respecto a PlanB: sin filtros por presupuesto y duración, ni seguimiento paso a paso

**Propuesta de valor:** planes completos, hechos por personas reales, filtrables por presupuesto, duración y tipo, y con seguimiento paso a paso.



### 10\. Límites del scope

Para conservar el carácter del producto, inicialmente se intentarían evitar:

* convertirse en un sistema de reservas o de venta de entradas;
* convertirse en una red social generalista sin relación con planes y lugares;
* incluir publicidad o promoción de negocios en la primera versión;
* exigir que el usuario cree contenido para poder usar la aplicación;
* cubrir muchas ciudades desde el inicio;
* implementar mensajería propia en la primera versión;
* almacenar la ubicación del usuario de forma continua;
* presentar como definitivas decisiones todavía no validadas.



### 11\. Riesgos y preguntas abiertas

* **Arranque en frío**: con pocas experiencias publicadas, la búsqueda no resulta útil.
* **Calidad y veracidad del contenido**: información desactualizada, locales cerrados o precios erróneos. Requiere valoraciones, reportes y avisos de datos obsoletos.
* **Contenido publicitario encubierto**: negocios que se promocionen mediante cuentas falsas.
* **Moderación**: cuánto trabajo supone revisar reportes con un equipo pequeño.
* **Datos de lugares**: cómo se introducen y se mantienen actualizados los lugares que aparecen en las experiencias.
* **Privacidad**: gestión de fotos, ubicación y libreta de contactos según el RGPD.
* **Fricción al crear**: si crear una experiencia resulta largo, pocos usuarios lo harán.
* **Motivación para compartir**: qué obtiene el usuario al publicar (reconocimiento, seguidores, valoraciones).
* **Ciudad de lanzamiento**: qué ciudad ofrece mejor combinación de público y contenido inicial.
* **Perfiles de negocio**: si se permiten en el futuro y cómo se distinguen de las cuentas personales.



### 12\. Resumen de la visión

PlanB podría convertirse en la herramienta a la que acudir cuando se quiere hacer algo y no se sabe qué. Su propuesta no sería listar lugares, sino ofrecer **planes completos hechos por personas**, con información práctica para decidir rápido y la posibilidad de seguirlos paso a paso.

La aplicación combinaría:

* creación sencilla de experiencias por ciudad;
* búsqueda con filtros de presupuesto, duración y tipo;
* visibilidad controlada por el usuario: privada, amigos o pública;
* amigos y recomendaciones cercanas;
* guardado, duplicado y seguimiento de experiencias;
* valoraciones y moderación para mantener la calidad.

Todo ello debería permanecer modular y revisable. PlanB sería, en esta etapa, una dirección de producto, no una especificación cerrada.


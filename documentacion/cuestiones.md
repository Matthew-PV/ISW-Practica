# Cuestiones pendientes — 22/09/2026

Notas rápidas antes de ponernos con la arquitectura. No están pulidas, pero conviene dejar por escrito qué hay que decidir antes de empezar a programar.

## 1. Completar las tarjetas de historias de usuario

Hay que meter a mano todas las tarjetas que ya tenemos completadas.

¿Las que faltan? O las hacemos en persona o se las inventa cada uno que le han tocado o ignoramos las malas de momento pq si se implementan queda todavia tiempo.

## 2. Hacemos Web


## 3. Arquitectura general

Por simplicidad, la pinta que suele tener una arquitectura de este tipo es la siguiente:

```
   BBDD   <──→   Aplicación gestora de las   <──→   Aplicación con la   <──→   Interfaz
                 interacciones persistentes          lógica del código
```

Es decir, de fuera hacia dentro:

- **BBDD** — solo guarda y devuelve datos, sin saber nada de reglas de negocio.
- **Aplicación gestora de interacciones persistentes** — la capa que habla con la BBDD (consultas, guardado, actualizaciones) y le da al resto de la aplicación una forma limpia de pedir y guardar datos.
- **Aplicación con la lógica del código** — donde viven las reglas de negocio: qué puede hacer un usuario, cómo se calcula o valida cada cosa, etc.
- **Interfaz** — lo que ve y usa la persona: la web en sí.

Cada capa solo se comunica con la de al lado, así que se pueden testear, cambiar o incluso sustituir por separado sin tocar el resto.

Una aclaración importante: esto son **capas**, no cuatro aplicaciones distintas desplegadas por separado. Para un equipo como el nuestro, montar cuatro servicios independientes (con su propia comunicación entre ellos, despliegue, etc.) es complejidad que no necesitamos todavía. Se montaría como un único backend con esas capas bien separadas por dentro (carpetas/módulos), más el frontend aparte. Si en algún momento hace falta escalar o separar de verdad, se separa entonces.

## 4. Decidir las herramientas

Con esa arquitectura en mente, para cada capa hace falta elegir tecnología:

1. **BBDD** — MySQL (confirmado)
2. **Aplicación de interacciones (persistencia)** — por decidir entre ORM y SQL directo (ver más abajo)
3. **Código con la lógica** — Node.js + Express (propuesto)
4. **Interfaz gráfica** — HTML / CSS / JS + Bootstrap (propuesto)
5. **Almacenamiento de imágenes** — Cloudinary (propuesto)

Este último punto es aparte porque las experiencias llevan fotos de los lugares, y eso normalmente no se guarda en la misma BBDD relacional, sino en un almacenamiento de objetos (tipo S3, Cloudinary o similar).

### Qué haría cada una

**MySQL** sería la base de datos del proyecto: guardaría todas las tablas (usuarios, amistades, experiencias, lugares, valoraciones, etc.) y respondería a las consultas que le llegasen desde la capa de persistencia. No sabría nada de reglas de negocio, solo almacenaría y devolvería datos.

**La capa de persistencia** sería la que conecta el backend con MySQL: cada vez que la lógica de la aplicación necesitase guardar, leer, actualizar o borrar algo (por ejemplo, crear una experiencia o consultar las valoraciones de un usuario), esta capa construiría y ejecutaría la consulta correspondiente y devolvería el resultado ya listo para usar en el código. Hay dos formas de montarla, y hay que decidir cuál usar.

**Opción A — SQL directo (driver `mysql2`, sin ORM).** Se escribirían las consultas SQL a mano en el código.

Ventajas:
- Control total: se ejecuta exactamente la consulta que se escribe, sin intermediarios.
- Mejor rendimiento en consultas complejas, porque se puede optimizar el SQL a mano.
- No depende de aprender una herramienta extra, solo SQL.
- Nada de "magia" oculta: siempre se sabe qué se ejecuta en la base de datos.

Desventajas:
- Más código para cada operación (crear, leer, actualizar, borrar).
- Hay que convertir a mano el resultado (filas) en objetos usables en el código.
- Más fácil cometer errores de seguridad (inyección SQL) si no se usan siempre consultas parametrizadas.
- Con relaciones como las del proyecto (Usuario → Experiencia → Elemento → Lugar), los JOIN se vuelven largos y más difíciles de mantener.

**Opción B — ORM (por ejemplo Sequelize o Prisma).** Se definirían las tablas como clases/objetos de JavaScript, y el ORM traduciría por debajo a SQL.

Ventajas:
- Menos código: crear, leer, actualizar y borrar suelen ser una línea.
- Se trabaja con objetos de JavaScript en vez de con texto SQL.
- Gestiona bien las relaciones entre tablas (por ejemplo, pedir un usuario "con sus experiencias" en una sola llamada).
- Protege automáticamente contra inyección SQL.
- Si se cambiase de base de datos, en la mayoría de los casos no haría falta reescribir las consultas.
- Suele incluir herramientas para gestionar cambios en el modelo de datos (migraciones), útil si el equipo cambia el modelo a la vez.

Desventajas:
- Hay que aprender la herramienta además de MySQL.
- En consultas muy complejas o con mucho volumen de datos, puede generar SQL menos eficiente que uno escrito a mano.
- Añade una capa de "magia": a veces es más difícil saber exactamente qué SQL se ejecuta por detrás, lo que complica depurar problemas de rendimiento.
- Alguna funcionalidad muy específica de MySQL puede no estar soportada directamente y hay que rodearla con SQL "en crudo" dentro del propio ORM.

Para decidir en equipo: dado el tamaño del proyecto y que somos estudiantes de 3º, la diferencia de rendimiento apenas se notará; la decisión real es si preferimos escribir más código a cambio de entender exactamente qué pasa (SQL directo), o menos código a cambio de aprender una herramienta nueva (ORM).

**Node.js + Express** sería el motor que ejecutaría la lógica de negocio: comprobaría qué puede hacer cada usuario (por ejemplo, si puede ver una experiencia privada de otro), validaría los datos que llegan (una puntuación dentro de rango, un nombre de usuario único), y decidiría qué responder a cada petición que llegase desde la interfaz. Sería el punto donde vivirían las reglas descritas en las historias de usuario.

**HTML / CSS / JS + Bootstrap** sería la interfaz que vería y usaría la persona: las pantallas para explorar experiencias, crear una nueva, ver el perfil, gestionar amigos, etc. Se comunicaría con el backend pidiendo y enviando datos, sin conocer cómo se guardan ni de dónde vienen exactamente.

**Cloudinary** se encargaría de guardar las fotos que suben los usuarios (por ejemplo, las fotos de cada lugar dentro de una experiencia). En vez de guardar las imágenes dentro de MySQL, el backend subiría cada foto a Cloudinary y guardaría solo su URL en la base de datos. Cloudinary también optimizaría y redimensionaría las imágenes automáticamente.

Este apartado está pendiente de confirmación final en equipo, salvo MySQL, que ya está decidido.

## 5. Task tracking de las primeras historias de usuario

Desglose de tareas para el campo TASK TRACKING de cada tarjeta. Cada persona marca la casilla conforme completa la tarea.

### 5.1. Crear mi perfil

Estimación: 4h — Riesgo: bajo

- [ ] Añadir campos nombre de usuario y foto a la entidad Usuario
- [ ] Validar longitud y caracteres permitidos del nombre de usuario
- [ ] Validar unicidad del nombre de usuario (rechazar si ya existe)
- [ ] Función para subir la foto (validar formato JPG/PNG/WebP y tamaño máximo)
- [ ] Guardar la foto fuera de la base de datos y solo su URL en el perfil
- [ ] Mostrar imagen por defecto si no hay foto
- [ ] Función para crear el perfil
- [ ] Función para editar el perfil (solo el propio usuario)
- [ ] Función para consultar el perfil propio
- [ ] Probar los casos del criterio de validación (nombre duplicado, foto inválida, edición reflejada)

### 5.2. Crear entidad Experiencia

Estimación: 4h — Riesgo: medio

- [ ] Crear la entidad Experiencia (título, descripción, ciudad, tipo, momento adecuado)
- [ ] Relacionar cada experiencia con una única ciudad
- [ ] Validar que los campos obligatorios estén presentes al crear
- [ ] Función para crear una experiencia
- [ ] Rechazar la creación si falta algún campo obligatorio
- [ ] Probar que la experiencia queda asociada solo a su ciudad
- [ ] Probar el caso de creación con datos válidos

### 5.3. Editar experiencia (endpoint de edición)

Estimación: 3h — Riesgo: bajo

- [ ] Crear la función de edición de una experiencia
- [ ] Permitir modificar título, categoría y otros campos
- [ ] Mantener la restricción de una única ciudad al editar
- [ ] Rechazar el cambio de ciudad si es incompatible con los lugares ya existentes
- [ ] Restringir la edición solo al autor de la experiencia
- [ ] Probar que un usuario no autor no puede editar
- [ ] Probar que los cambios sustituyen correctamente a los datos anteriores

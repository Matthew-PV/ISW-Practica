# Cuestiones pendientes — 22/09/2026

Notas rápidas antes de ponernos con la arquitectura. No están pulidas, pero conviene dejar por escrito qué hay que decidir antes de empezar a programar.

## 1. Completar las tarjetas de historias de usuario

Hay que meter a mano todas las tarjetas que ya tenemos completadas.

¿Las que faltan? O las hacemos en persona o se las inventa cada uno que le han tocado o ignoramos las malas de momento pq si se implementan queda todavia tiempo.

## 2. Decidir: ¿aplicación o web?


## 3. Arquitectura general (si nos decidimos por lo anterior)

Por simplicidad, la pinta que suele tener una arquitectura de este tipo es la siguiente:

```
   BBDD   <──→   Aplicación gestora de las   <──→   Aplicación con la   <──→   Interfaz
                 interacciones persistentes          lógica del código
```

Es decir, de fuera hacia dentro:

- **BBDD** — solo guarda y devuelve datos, sin saber nada de reglas de negocio.
- **Aplicación gestora de interacciones persistentes** — la capa que habla con la BBDD (consultas, guardado, actualizaciones) y le da al resto de la aplicación una forma limpia de pedir y guardar datos.
- **Aplicación con la lógica del código** — donde viven las reglas de negocio: qué puede hacer un usuario, cómo se calcula o valida cada cosa, etc.
- **Interfaz** — lo que ve y usa la persona: la web (o app) en sí.

Cada capa solo se comunica con la de al lado, así que se pueden testear, cambiar o incluso sustituir por separado sin tocar el resto.

Una aclaración importante: esto son **capas**, no cuatro aplicaciones distintas desplegadas por separado. Para un equipo como el nuestro, montar cuatro servicios independientes (con su propia comunicación entre ellos, despliegue, etc.) es complejidad que no necesitamos todavía. Yo lo montaría como un único backend con esas capas bien separadas por dentro (carpetas/módulos), más el frontend aparte. Si en algún momento hace falta escalar o separar de verdad, se separa entonces.

## 4. Decidir las herramientas

Con esa arquitectura en mente, para cada capa hace falta elegir tecnología:

1. **BBDD** — ¿MySQL? (por confirmar)
2. **Aplicación de interacciones (persistencia)** — por decidir
3. **Código con la lógica** — por decidir
4. **Interfaz gráfica** — por decidir
5. **Almacenamiento de imágenes** — por decidir

Este último punto es aparte porque las experiencias llevan fotos de los lugares, y eso normalmente no se guarda en la misma BBDD relacional, sino en un almacenamiento de objetos (tipo S3, Cloudinary o similar). Hay que elegir algo ahí también.


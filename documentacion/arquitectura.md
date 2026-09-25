# Arquitectura — PlanB

> Arquitectura y diseño técnico del proyecto. Parte de la [propuesta inicial](propuesta-inicial.md) y de las [cuestiones pendientes](cuestiones.md) del 22/09/2026.



### 1. Alcance técnico

PlanB se construye como una **aplicación web responsive**: una única web que se adapta tanto al ordenador como a la pantalla del móvil. No hay aplicación móvil nativa.

**Primera versión.** Incluye tres funcionalidades, con el registro y el inicio de sesión que necesitan:

* crear y consultar el perfil propio (FLA05);
* crear experiencias (LUC01);
* editar experiencias (LUC09).

El resto de módulos se construye después sobre la misma arquitectura.



### 2. Visión general

El sistema se organiza en **capas**. No son servicios independientes: hay un único backend con las capas separadas por dentro (carpetas y módulos), y un frontend que se comunica con él.

```
┌─────────────┐   HTTP + JSON   ┌───────────────────────────────────────────┐        ┌───────┐
│  Interfaz   │ ──────────────→ │                 Backend                   │        │       │
│ (navegador) │ ←────────────── │  Rutas → Lógica de negocio → Persistencia │ ←────→ │ MySQL │
└─────────────┘                 └───────────────────────────────────────────┘        └───────┘
                                                     │
                                                     ↓
                                               ┌────────────┐
                                               │ Cloudinary │  (fotos)
                                               └────────────┘
```

* **Interfaz:** lo que ve y usa la persona. Son páginas HTML que piden datos al backend y los muestran.
* **Rutas:** reciben cada petición HTTP, comprueban que el usuario tenga sesión iniciada y pasan la petición a la lógica de negocio.
* **Lógica de negocio:** aplica las reglas descritas en las historias de usuario, es decir, qué puede hacer cada usuario, cómo se valida cada dato y qué se calcula.
* **Persistencia:** la única parte del código que habla con la base de datos. Lee y guarda datos y los devuelve como objetos de JavaScript.
* **MySQL:** almacena los datos. No sabe nada de reglas de negocio.

Cada capa solo se comunica con la de al lado, de modo que se puede probar o cambiar por separado sin tocar el resto.



### 3. Herramientas

Todo el proyecto está escrito en **JavaScript**, tanto el backend como el frontend.

| Capa | Herramientas |
|---|---|
| Base de datos | MySQL |
| Persistencia | Prisma |
| Backend (rutas y lógica) | Node.js, Express, bcrypt, express-session |
| Interfaz | HTML, CSS, JavaScript, Bootstrap |
| Imágenes | Cloudinary |
| Entorno de desarrollo | Docker (docker-compose) |
| Pruebas | Jest, Supertest |

#### 3.1. MySQL

Sistema de gestión de bases de datos relacional. Guarda la información en tablas (usuarios, experiencias, lugares, valoraciones...) relacionadas entre sí mediante claves, y la consulta con SQL.

* Es adecuado para datos muy relacionados, como los de PlanB (un usuario tiene experiencias, que tienen elementos, que apuntan a lugares).
* Garantiza la integridad de los datos: claves foráneas, restricciones de unicidad (por ejemplo, una sola valoración por usuario y experiencia) y transacciones.
* Es muy conocido y tiene mucha documentación.

#### 3.2. Prisma

ORM (*Object-Relational Mapping*) para Node.js. El esquema de la base de datos se describe en un único archivo, `schema.prisma`, y a partir de él Prisma crea las tablas en MySQL y genera un cliente para consultarlas desde JavaScript.

```prisma
model Experiencia {
  id      Int     @id @default(autoincrement())
  titulo  String
  ciudad  String
  autor   Usuario @relation(fields: [autorId], references: [id])
  autorId Int
}
```

```js
const experiencias = await prisma.experiencia.findMany({
  where: { ciudad: 'Madrid' },
  include: { autor: true },
});
```

* **Migraciones:** cada cambio del esquema genera un archivo de migración que se guarda en git. Cualquier miembro del equipo deja su base de datos al día con `npx prisma migrate dev`.
* **Relaciones sencillas:** los datos relacionados se piden con `include`, sin escribir los JOIN a mano.
* **Seguridad:** todas las consultas van parametrizadas, lo que evita la inyección SQL.
* **SQL a mano cuando hace falta:** las consultas complejas, como la búsqueda con filtros combinados, pueden escribirse en SQL con `prisma.$queryRaw`.

#### 3.3. Node.js

Entorno que ejecuta JavaScript fuera del navegador, en el servidor.

* Se usa el mismo lenguaje en el frontend y en el backend.
* Tiene el ecosistema de paquetes más grande que existe (npm), con librerías para casi cualquier necesidad.
* Maneja bien muchas peticiones simultáneas, como las de una aplicación web.

#### 3.4. Express

Framework web minimalista para Node.js. Asocia cada URL y método HTTP (`GET /api/experiencias`, `POST /api/valoraciones`...) con la función que la atiende.

* Es sencillo y tiene muy poca configuración inicial.
* Funciona con *middlewares*: funciones que se ejecutan antes de atender la petición, como comprobar la sesión o el rol, o validar los datos. Así esas comprobaciones se escriben una vez y se reutilizan en todas las rutas.
* También sirve archivos estáticos, así que el mismo servidor entrega tanto la API como las páginas HTML.

#### 3.5. bcrypt

Librería que calcula el *hash* de una contraseña, es decir, una transformación que no se puede deshacer.

* En la base de datos nunca se guarda la contraseña, solo su hash. Aunque alguien obtuviese la base de datos, no podría leer las contraseñas.
* Es lento a propósito y añade un valor aleatorio (*salt*) a cada contraseña, lo que dificulta mucho los ataques por fuerza bruta.

#### 3.6. express-session

Middleware de Express que gestiona las **sesiones** de usuario. Al iniciar sesión, el servidor crea una sesión y el navegador recibe una cookie con su identificador. En cada petición siguiente, el navegador envía esa cookie y el backend sabe qué usuario la hace.

* El navegador envía la cookie automáticamente, sin código extra en el frontend.
* La cookie se marca como `HttpOnly`, así que el JavaScript de la página no puede leerla, lo que protege frente a robos por XSS.
* Cerrar sesión es inmediato: basta con borrar la sesión en el servidor.

#### 3.7. HTML, CSS y JavaScript

Las tres tecnologías básicas de la web. HTML define la estructura de cada página, CSS su aspecto y JavaScript su comportamiento. El JavaScript del frontend pide datos a la API con `fetch` y los inserta en la página.

* No hace falta ningún paso de compilación: los archivos se abren directamente en el navegador.
* No hay que aprender ningún framework adicional.

#### 3.8. Bootstrap

Librería de CSS y componentes (botones, formularios, tarjetas, menús, ventanas modales...) listos para usar.

* Su sistema de rejilla hace que las páginas se adapten al móvil sin escribir CSS específico, que es la base de una web responsive.
* Da un aspecto uniforme a todas las pantallas aunque las haga gente distinta.

#### 3.9. Cloudinary

Servicio en la nube para almacenar y servir imágenes. El backend sube cada foto a Cloudinary y en MySQL se guarda solo su URL.

* La base de datos no se llena de archivos pesados.
* Redimensiona y optimiza las imágenes automáticamente (por ejemplo, genera miniaturas para los listados).
* El plan gratuito es suficiente para el proyecto.

#### 3.10. Docker (docker-compose)

Docker ejecuta programas dentro de **contenedores**, que son entornos aislados con una configuración fija. `docker-compose` permite describir en un archivo (`docker-compose.yml`) qué contenedores levantar.

* Todo el equipo usa la misma versión y configuración de MySQL, sin instalarlo en su ordenador.
* La base de datos se levanta con un solo comando (`docker compose up -d`) y se puede borrar y recrear en segundos.

#### 3.11. Jest

Framework de pruebas para JavaScript. Ejecuta los tests, comprueba los resultados con aserciones (`expect(resultado).toBe(...)`) e indica qué ha fallado.

* Necesita muy poca configuración.
* Permite sustituir partes del sistema por simulaciones (*mocks*), por ejemplo para probar la lógica de negocio sin base de datos o sin subir fotos a Cloudinary.

#### 3.12. Supertest

Librería que hace peticiones HTTP a la aplicación Express desde los tests, sin arrancar un servidor real.

* Permite probar cada endpoint de principio a fin: se envía una petición y se comprueban el código de estado y el JSON devuelto.
* Encaja directamente con los criterios de validación de las tarjetas de historias de usuario («si un usuario sin rol de moderador pide la lista, recibe un error»...).



### 4. Comunicación entre frontend y backend

* El backend expone una **API REST** que recibe y devuelve **JSON**. Todas sus rutas empiezan por `/api` (por ejemplo, `GET /api/experiencias?ciudad=Madrid`).
* El resto de rutas sirven las páginas HTML del frontend. Frontend y API salen del **mismo servidor y el mismo dominio**, por lo que la cookie de sesión se envía sola y no hay que configurar CORS.
* Cada endpoint indica el resultado con el código HTTP correspondiente: `200`/`201` si ha ido bien, `400` si los datos son inválidos, `401` si no hay sesión, `403` si no hay permiso y `404` si el recurso no existe.



### 5. Autenticación y autorización

#### 5.1. Autenticación

* Registro e inicio de sesión con **email y contraseña**.
* La contraseña se guarda como hash con **bcrypt**.
* La sesión se mantiene con **express-session** mediante una cookie `HttpOnly`.

#### 5.2. Autorización

Los permisos se comprueban **siempre en el backend**. El frontend puede ocultar botones, pero eso no protege nada por sí solo.

* **Roles:** `usuario` y `moderador`, guardados en la entidad Usuario. Los endpoints del panel de moderación (JOA05, JOA06) exigen el rol `moderador`.
* **Visibilidad de experiencias:** cualquier consulta que devuelva experiencias (búsqueda, perfil, inicio, detalle, comentarios) filtra según su visibilidad (privada / amigos / pública) y según quién la pide (MAT01, MAT09).
* **Propiedad:** solo el autor puede editar o borrar su contenido (LUC09).



### 6. Estructura del repositorio

```
ISW-Practica/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # esquema de la base de datos
│   │   └── migrations/        # migraciones generadas por Prisma
│   ├── src/
│   │   ├── routes/            # URLs de la API → llaman a los servicios
│   │   ├── middlewares/       # sesión, roles, validación de datos
│   │   ├── services/          # lógica de negocio
│   │   ├── repositories/      # acceso a datos con Prisma (persistencia)
│   │   ├── app.js             # configuración de Express
│   │   └── server.js          # arranque del servidor
│   ├── tests/                 # pruebas con Jest y Supertest
│   ├── .env.example           # variables de entorno necesarias (sin valores reales)
│   └── package.json           # dependencias y scripts de npm
├── frontend/
│   ├── *.html                 # una página por pantalla
│   ├── css/
│   └── js/                    # código de cada página y llamadas a la API
├── docker-compose.yml         # MySQL para desarrollo
├── documentacion/
└── customer-stories/
```

Las carpetas de `backend/src` se corresponden con las capas de la sección 2. Las rutas solo llaman a servicios, los servicios solo llaman a repositorios y solo los repositorios usan Prisma.

Las claves y contraseñas (conexión a MySQL, credenciales de Cloudinary, secreto de sesión) se guardan en `backend/.env`, que **no se sube a git**. El archivo `backend/.env.example` indica qué variables hay que rellenar.

El frontend no necesita instalación: Bootstrap se carga desde CDN y `js/api.js` agrupa las llamadas a la API.



### 7. Entorno de desarrollo

Requisitos: [Node.js](https://nodejs.org/) 22 o superior y [Docker](https://docs.docker.com/get-docker/).

Puesta en marcha en local, desde la raíz del repositorio:

1. `docker compose up -d` levanta MySQL en `localhost:3306`.
2. `cd backend` y copiar `.env.example` a `.env`. Los valores de la base de datos ya coinciden con `docker-compose.yml`; solo hay que cambiar `SESSION_SECRET` y rellenar `CLOUDINARY_URL` cuando haga falta.
3. `npm install` instala las dependencias.
4. `npm run db:migrate` crea o actualiza las tablas a partir de `prisma/schema.prisma`.
5. `npm run dev` arranca el servidor en http://localhost:3000, que sirve la API y la web, y se reinicia solo al guardar cambios.

Scripts de `backend/package.json`:

| Script | Qué hace |
|---|---|
| `npm run dev` | Arranca el servidor y lo reinicia al cambiar el código |
| `npm start` | Arranca el servidor sin reinicio automático |
| `npm test` | Ejecuta las pruebas con Jest |
| `npm run db:migrate` | Aplica los cambios de `schema.prisma` a la base de datos y genera la migración |
| `npm run db:studio` | Abre Prisma Studio, una interfaz web para ver y editar los datos |

`docker compose down` para MySQL; los datos se conservan en un volumen de Docker. `docker compose down -v` los borra.



### 8. Pruebas

* **Tests unitarios (Jest)** de la lógica de negocio: validaciones, permisos, cálculos.
* **Tests de endpoints (Jest + Supertest)** de la API: cada criterio de validación de una tarjeta se traduce en al menos un test.
* **Frontend:** se prueba manualmente en el navegador, tanto en tamaño de ordenador como de móvil.

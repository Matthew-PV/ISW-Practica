# Pruebas End-to-End con Playwright — PlanB

## Objetivo

Automatizar las pruebas de aceptación de PlanB mediante
un navegador real, verificando la interacción entre el
frontend, el backend y la base de datos MySQL.

Playwright complementa las pruebas existentes de Jest,
Supertest y Cucumber, sin sustituirlas.

## Tecnologías

- Playwright: automatización del navegador.
- Chromium: navegador utilizado en las pruebas.
- Cucumber: ejecución de escenarios Gherkin.
- Express: servidor real de PlanB.
- Prisma y MySQL: persistencia real.
- Docker: aislamiento de la base de datos.

## Pruebas implementadas

| Archivo | Comportamiento | Historias |
|---|---|---|
| inicio-sesion.spec.js | Inicio de sesión | CS-59 |
| crear-plan.spec.js | Creación y persistencia de planes | CS-49 |
| editar-plan.spec.js | Edición y persistencia de cambios | CS-57, CS-53 |
| valoraciones.spec.js | Creación y actualización de valoraciones | CS-01 |
| amistades.spec.js | Amistades y seguimiento | CS-61, CS-45 |
| visibilidad.spec.js | Privacidad y permisos | CS-22, CS-30 |
| compartir-enlace.spec.js | Copia y apertura de enlaces | CS-37 |

También se incluye un escenario Gherkin de inicio de
sesión ejecutado mediante Cucumber y Playwright.

## Instalación

Requisitos:

- Node.js 22 o superior.
- Docker Desktop o Docker Engine.
- Puerto 3309 disponible para MySQL.
- Puerto 3010 disponible para PlanB.

Desde backend:

```powershell
npm.cmd ci
npx.cmd prisma generate
npx.cmd playwright install chromium
```

## Preparación inicial en Windows

Crear un contenedor exclusivo para las pruebas:

```powershell
$env:MYSQL_ROOT_PASSWORD = [guid]::NewGuid().ToString("N")

docker run -d --name planb-mysql-e2e -p 127.0.0.1:3309:3306 -e MYSQL_ROOT_PASSWORD -e MYSQL_DATABASE=planb_e2e mysql:8.4
```

Esperar a que MySQL termine de inicializarse.

Crear la configuración local desde backend:

```powershell
$clave = Read-Host "Contraseña de las cuentas demo" -AsSecureString
$demo = [System.Net.NetworkCredential]::new("", $clave).Password

@"
DATABASE_URL=mysql://root:$($env:MYSQL_ROOT_PASSWORD)@127.0.0.1:3309/planb_e2e
PORT=3010
SESSION_SECRET=$([guid]::NewGuid().ToString("N"))
SEED_SIN_FOTOS=1
E2E_DEMO_PASSWORD=$demo
"@ | Set-Content -Encoding ascii .env.e2e
```

La contraseña de demostración está definida en
backend/prisma/seed-demo.js.

El archivo .env.e2e es local y no debe subirse a Git.

La creación del contenedor y del archivo de configuración
solo es necesaria la primera vez.

En sesiones posteriores, si el contenedor está detenido:

```powershell
docker start planb-mysql-e2e
```

## Ejecución

Pruebas Playwright:

```powershell
npm.cmd run test:e2e
```

Escenarios Cucumber con navegador real:

```powershell
npm.cmd run test:bdd:e2e
```

Prueba individual:

```powershell
npm.cmd run test:e2e -- valoraciones.spec.js
```

Los dos sistemas preparan los datos, arrancan el servidor,
ejecutan las pruebas y cierran el servidor automáticamente.

No deben ejecutarse simultáneamente porque comparten
el mismo puerto y la misma base de datos.

## Informes

Playwright:

```powershell
npx.cmd playwright show-report reports/playwright-html
```

Cucumber:

```powershell
Start-Process .\reports\cucumber-e2e.html
```

Playwright conserva capturas, vídeos y trazas cuando
falla una prueba.

Cucumber adjunta capturas al informe si falla un escenario.

Los informes generados están excluidos de Git.

## Seguridad y aislamiento

Las pruebas utilizan exclusivamente la base local
127.0.0.1:3309/planb_e2e.

Antes de preparar los datos o arrancar el servidor se
comprueba que la configuración apunta a dicha base.

Se aplican las migraciones existentes y se restauran
los datos ficticios antes de cada batería de pruebas.

La restauración elimina los datos anteriores de la base
E2E, por lo que esta no debe utilizarse para desarrollo
ni para guardar información que se quiera conservar.

No se utilizan las credenciales de la base compartida,
ni se suben fotografías a Cloudinary.

## Limitaciones

- Las pruebas están configuradas para Chromium.
- Se necesita Docker en funcionamiento.
- La prueba de compartir enlaces utiliza el portapapeles.
- No se cubren todavía todos los escenarios de PlanB.
- La integración con Jenkins u otro sistema CI queda
  fuera del alcance de esta implementación.

## Validación — 26/11/2026

- Jest: 89 suites y 1103 pruebas superadas.
- Playwright: 7 pruebas superadas.
- Cucumber con Playwright: 1 escenario superado.
- Regresión de MySQL: superada.
- Regresión de Cucumber original: superada.

La incorporación de Playwright no requiere modificar
las funcionalidades existentes de PlanB.
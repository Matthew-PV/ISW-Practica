# Informe final de pruebas de aceptación — CS-70

**Proyecto:** PlanB — Ingeniería del Software  
**Historia:** CS-70 — Pruebas de aceptación y regresión  
**Fecha:** 03/11/2026  
**Estado:** Finalizado  
**Resultado global:** Satisfactorio

---

## 1. Objetivo

El objetivo de CS-70 es verificar el correcto funcionamiento de las principales funcionalidades de PlanB mediante pruebas de aceptación automatizadas, pruebas de regresión y validaciones de interfaz.

Se ha utilizado **Cucumber con Gherkin** para automatizar los escenarios de aceptación, **Jest** para la regresión y cobertura, y **Supertest** para comprobar las peticiones HTTP a la API.

Las pruebas de aceptación se han ejecutado contra una base de datos MySQL local, evitando modificar los datos de desarrollo compartidos por el equipo.

## 2. Alcance de las pruebas

Se han automatizado 61 escenarios de aceptación, organizados en seis archivos `.feature`.

| Funcionalidad | Escenarios | Resultado |
|---|---:|---|
| Autenticación | 7 | Correcto |
| Perfiles de usuario | 10 | Correcto |
| Amistades y seguimientos | 9 | Correcto |
| Experiencias y visibilidad | 15 | Correcto |
| Búsqueda y filtros | 10 | Correcto |
| Valoraciones | 10 | Correcto |
| **Total** | **61** | **61 superados** |

Los escenarios están relacionados con las historias de usuario correspondientes y se encuentran en `documentacion/aceptacion/`.

Las implementaciones de los pasos automatizados se encuentran en `backend/tests/bdd/`.

## 3. Entorno y herramientas

Las pruebas se han realizado utilizando:

- **Node.js y Express:** ejecución de la aplicación y su API REST.
- **Cucumber:** ejecución de los escenarios BDD definidos en Gherkin.
- **Jest:** pruebas automatizadas y regresión.
- **Supertest:** peticiones HTTP a las rutas de la aplicación.
- **Prisma y MySQL:** persistencia y comprobación de datos.
- **Chrome:** validación manual de la interfaz.

Las pruebas BDD se han ejecutado utilizando MySQL local en `127.0.0.1:3308/planb`.

Se han creado usuarios, experiencias y relaciones temporales para comprobar el funcionamiento de las operaciones, con mecanismos de limpieza al finalizar cada escenario.

## 4. Resultados de las pruebas automatizadas

### 4.1. Pruebas de aceptación BDD

**Comando utilizado:**

```powershell
npm.cmd run test:bdd
```

**Resultado:**

- Escenarios ejecutados: 61.
- Escenarios correctos: 61.
- Escenarios fallidos: 0.
- Estado: **SUPERADO**.

Se han comprobado tanto operaciones correctas como situaciones de error, incluyendo validaciones, permisos, restricciones de acceso, relaciones entre usuarios y visibilidad de experiencias.

### 4.2. Pruebas de regresión Jest

**Comando utilizado:**

```powershell
npm.cmd test -- --runInBand
```

**Resultado de referencia de la batería habitual:**

- Suites ejecutadas: 75.
- Pruebas correctas: 991.
- Pruebas fallidas: 0.
- Estado: **SUPERADO**.

Durante una ejecución previa se detectó un timeout puntual en una prueba de interfaz del detalle de experiencia. La prueba se ejecutó correctamente al repetir la batería secuencialmente con `--runInBand`, sin necesidad de modificar su implementación.

### 4.3. Pruebas con cobertura

**Comando utilizado:**

```powershell
npm.cmd run test:cobertura
```

**Resultado de referencia:**

- Suites ejecutadas: 91.
- Pruebas correctas: 1063.
- Pruebas fallidas: 0.
- Estado: **SUPERADO**.

Se verificó que la cobertura cumplía los umbrales mínimos configurados en el proyecto:

| Métrica | Umbral mínimo |
|---|---:|
| Statements | 94 % |
| Branches | 93 % |
| Functions | 95 % |
| Lines | 94 % |

El informe detallado de cobertura se genera en `backend/coverage/`.

## 5. Validación manual de la interfaz

Se realizaron siete comprobaciones manuales sobre los principales flujos de la aplicación, utilizando el navegador y cuentas de demostración.

| Nº | Flujo comprobado | Resultado |
|---|---|---|
| 1 | Registro, inicio y cierre de sesión | Correcto |
| 2 | Consulta y modificación del perfil | Correcto |
| 3 | Solicitudes de amistad y seguimientos | Correcto |
| 4 | Creación, edición y visualización de experiencias | Correcto |
| 5 | Búsqueda de experiencias y aplicación de filtros | Correcto |
| 6 | Creación y actualización de valoraciones | Correcto |
| 7 | Control de acceso a experiencias privadas | Correcto |

**Resultado:** 7 comprobaciones satisfactorias de 7 realizadas.

La validación manual complementa las pruebas automatizadas, comprobando que los flujos principales pueden utilizarse desde la interfaz.

## 6. Incidencias detectadas

Durante la ejecución de las pruebas se detectaron y corrigieron incidencias relacionadas con la implementación de los pasos BDD.

También se observó un timeout puntual durante la ejecución paralela de Jest, que no volvió a reproducirse al ejecutar las pruebas secuencialmente.

Tras las correcciones y las ejecuciones finales, no quedaron fallos reproducibles ni incidencias bloqueantes dentro del alcance validado de CS-70.

Las funcionalidades pendientes de otras historias de usuario no forman parte de los criterios de cierre de esta historia.

## 7. Trazabilidad y documentación

Los escenarios BDD se distribuyen de la siguiente manera:

| Archivo | Historias relacionadas |
|---|---|
| `autenticacion.feature` | CS-59, CS-64 |
| `perfiles.feature` | CS-47, CS-62 |
| `amistades-seguimientos.feature` | CS-61, CS-45 |
| `experiencias.feature` | CS-49, CS-57, CS-22, CS-30, CS-44, CS-55, CS-56 |
| `busqueda.feature` | CS-10, CS-30 |
| `valoraciones.feature` | CS-01, CS-48, CS-63 |

Los escenarios y su automatización quedan incorporados al repositorio para permitir futuras ejecuciones de regresión cuando se introduzcan cambios en la aplicación.

## 8. Conclusión

Los resultados obtenidos permiten considerar **CS-70 finalizada satisfactoriamente**.

Se han automatizado los 61 escenarios de aceptación definidos, se ha completado la regresión con Jest, se han superado los requisitos de cobertura del proyecto y se han validado manualmente los siete flujos principales de la interfaz.

La incorporación de estas pruebas facilita la detección de regresiones y proporciona una base reproducible para comprobar el comportamiento de PlanB durante el desarrollo de nuevas funcionalidades.

**Estado final: APROBADO — CS-70 COMPLETADA.**
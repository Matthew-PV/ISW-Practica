
# Pruebas de aceptación BDD — PlanB

Este directorio contiene los escenarios de aceptación de PlanB,
escritos en Gherkin y automatizados mediante Cucumber.

## Relación con las historias de usuario

| Archivo | Historias relacionadas |
|---|---|
| autenticacion.feature | CS-59, CS-64 |
| perfiles.feature | CS-47, CS-62 |
| amistades-seguimientos.feature | CS-61, CS-45 |
| experiencias.feature | CS-49, CS-57, CS-22, CS-30, CS-44, CS-55, CS-56 |
| busqueda.feature | CS-10, CS-30 |
| valoraciones.feature | CS-01, CS-48, CS-63 |
| cs53-duracion-tarifa.feature | CS-53 |

## CS-53: duración y tarifa de las experiencias

La historia CS-53 permite indicar y consultar la duración
en minutos y la tarifa en euros de las experiencias.

### Implementación

- Se incorporan los campos `duracionMinutos` y `tarifa` al modelo de Prisma.
- Ambos campos son opcionales para mantener la compatibilidad
  con las experiencias existentes.
- La duración se almacena como número entero de minutos.
- La tarifa se almacena como decimal con dos posiciones.
- El backend valida ambos campos al crear y editar experiencias.
- El frontend permite introducir, editar y consultar estos datos.
- Las tarjetas de experiencias muestran duración y tarifa
  cuando están disponibles.

### Pruebas automatizadas

Pruebas Jest:

- `backend/tests/criterios/cs53DuracionTarifa.test.js`
- Validaciones de creación y edición.
- Tarifas gratuitas.
- Campos opcionales.
- Rechazo de valores incorrectos.

Pruebas Cucumber:

- `documentacion/aceptacion/cs53-duracion-tarifa.feature`
- `backend/tests/bdd/cs53-duracion-tarifa.steps.js`

Los escenarios BDD comprueban la persistencia real
en MySQL local, la consulta por API y las validaciones.

### Resultados de CS-53

- Jest específico: 16 pruebas superadas.
- Cucumber específico: 9 escenarios superados.
- Regresión general de Jest: superada.

### Seguridad de las pruebas BDD

Las pruebas de CS-53 solo admiten la base de datos local
`127.0.0.1:3308/planb`.

Los usuarios y experiencias temporales utilizados por los
escenarios se eliminan al finalizar cada uno.

## Ejecución

Desde la carpeta `backend`:

### Pruebas Jest de CS-53

```powershell
npm.cmd test -- --runInBand tests/criterios/cs53DuracionTarifa.test.js
```

### Todas las pruebas Jest

```powershell
npm.cmd test -- --runInBand
```

### Pruebas BDD de CS-53

```powershell
$env:DATABASE_URL = "mysql://root:planb@127.0.0.1:3308/planb"
$env:SESSION_SECRET = "clave-local-exclusiva-para-bdd"
npm.cmd run test:bdd -- --tags "@cs53"
```

### Regresión BDD completa

```powershell
npm.cmd run test:bdd
```

## Criterios generales

- Ejecutar las pruebas de forma reproducible.
- Aislar y limpiar los datos temporales.
- Verificar los casos válidos y los errores.
- Respetar los permisos y la visibilidad.
- Mantener las pruebas Jest existentes.
- Documentar los resultados antes de integrar los cambios.

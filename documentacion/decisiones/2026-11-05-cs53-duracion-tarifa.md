
# CS-53: duración y tarifa de las experiencias

**Fecha:** 2026-11-05 · **Historia:** CS-53 · **Responsable:** Jorge, con apoyo de ChatGPT

- **Contexto:** PlanB permitía publicar experiencias, pero no especificar cuánto duraban ni su tarifa. Era necesario incorporar estos datos a la base de datos, a la API y a la interfaz, manteniendo la compatibilidad con las experiencias existentes.

- **Decisión:** añadir dos campos opcionales al modelo `Experiencia` de Prisma:
  - `duracionMinutos Int?`: duración expresada en minutos enteros positivos.
  - `tarifa Decimal? @db.Decimal(10,2)`: importe en euros con dos decimales, permitiendo el valor cero para experiencias gratuitas.

  Ambos campos se validan al crear y editar experiencias. La interfaz permite introducirlos y los muestra en las tarjetas y en la ficha de detalle cuando tienen valor.

- **Alternativas:** utilizar campos obligatorios impediría conservar sin cambios las experiencias antiguas. Utilizar `Float` para la tarifa podría introducir problemas de precisión monetaria. Por ello se optó por campos opcionales y un tipo decimal.

- **Consecuencias:** se incorpora una migración de Prisma. Las experiencias anteriores conservan ambos campos a `null`. La migración se ha comprobado en MySQL local; su aplicación a una base compartida debe coordinarse con el equipo. Los clientes pueden recibir la tarifa como un decimal serializado sin ceros finales, por lo que las pruebas comparan los importes normalizados.

## Verificación

- Pruebas Jest específicas de CS-53: 16 superadas.
- Pruebas de aceptación Cucumber específicas: 9 escenarios superados.
- Regresión completa de Jest: superada.
- Regresión completa de Cucumber: superada.
- Validación mediante MySQL local, sin modificar la base compartida.

## Trabajo pendiente

- Incorporar los cambios al repositorio Git.
- Coordinar con el equipo la aplicación de la migración en la base compartida, cuando corresponda.

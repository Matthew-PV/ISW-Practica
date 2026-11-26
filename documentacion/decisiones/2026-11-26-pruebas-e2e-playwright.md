# Incorporación de pruebas E2E con Playwright

**Fecha:** 2026-11-26
**Historia:** Ampliación técnica de CS-70
**Decidió:** Jorge, a propuesta de ChatGPT

- **Contexto:** Las pruebas existentes verifican la lógica
  de negocio, la API y la persistencia, pero se necesita
  comprobar también el comportamiento de PlanB mediante
  un navegador real.

- **Decisión:** Incorporar Playwright con Chromium y
  mantener una configuración independiente de Cucumber
  para los escenarios de aceptación ejecutados en el
  navegador.

- **Alternativas:** Selenium, Cypress o mantener únicamente
  las pruebas existentes. Se elige Playwright por su
  integración con JavaScript, automatización de navegadores,
  gestión de sesiones independientes e informes de errores.

- **Consecuencias:** Se añade una dependencia de desarrollo,
  una base MySQL local exclusiva y comandos específicos
  de ejecución. Las pruebas existentes se mantienen.
  No se incorpora Jenkins en esta fase.
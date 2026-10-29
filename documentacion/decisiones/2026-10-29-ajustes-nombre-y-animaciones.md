# Nombre de usuario con confirmación y animaciones desde Ajustes

**Fecha:** 2026-10-29 · **Historia:** CS-47, CS-64, CS-66 · **Decidió:** Joaquín, a propuesta de Claude

- **Contexto:** el nombre de usuario se guardaba al salir del campo y es la dirección del perfil (`usuario.html?nombre=`); el botón «Pausar animaciones» flotaba en todas las pantallas (hallazgos P2 y P5).
- **Decisión:** el nombre solo se envía con el botón «Cambiar nombre», con un aviso de que es la dirección del perfil; la ciudad sigue guardándose sola. El botón flotante desaparece: el movimiento se detiene a los 5 s (WCAG 2.2.2) y el interruptor de Ajustes fija «pausado» o «activo» (`localStorage.movimiento`).
- **Alternativas:** diálogo de confirmación al cambiar el nombre (más pasos para un cambio poco frecuente); mantener el botón flotante (ruido en cada pantalla).
- **Consecuencias:** quien no entra en Ajustes no puede reanudar el movimiento tras los 5 s salvo recargando. La preferencia es por navegador, no por cuenta.

# Inicio, Explorar y el buscador usan planes reales

**Fecha:** 2026-10-29 · **Historia:** CS-10, CS-24, CS-25, CS-27, CS-31, CS-39 · **Decidió:** Joaquín, a propuesta de Claude

- **Contexto:** Inicio, Explorar y la pestaña Planes del buscador pintaban planes de ejemplo fijos: lo que se creaba o valoraba nunca aparecía al descubrir, y las tarjetas no abrían nada. La ruta `GET /api/experiencias` con filtros existía desde la fase 3.
- **Decisión:** se retiran los planes de ejemplo y todas las pantallas piden planes reales. La tarjeta entera es un enlace al detalle. La tira «en mi ciudad» busca la ciudad del perfil (texto libre) por nombre en `GET /ciudades`, sin distinguir mayúsculas ni acentos; si no está en el catálogo, la tira lo dice y no muestra planes. «Nuevos esta semana» pasa a «Nuevos planes», porque la API no filtra por fecha. Explorar pagina de 12 en 12 con «Cargar más» y filtra por categoría, momento, ciudad y amigos. El buscador abre en Planes y enlaza a Explorar con el mismo texto cuando hay otra página.
- **Alternativas:** guardar la ciudad del perfil como id del catálogo (cambia el modelo y exige migración); filtrar por fecha en la API para mantener «esta semana» (backend nuevo fuera de la fase); cargar más resultados dentro del buscador (duplica Explorar).
- **Consecuencias:** quien escriba su ciudad con una grafía distinta a la del catálogo ve la tira vacía hasta corregirla. Las filas de personas no muestran ciudad ni relación (`GET /usuarios` solo devuelve `{ id, nombreUsuario, foto }`): se tratará con la fase de amistad.

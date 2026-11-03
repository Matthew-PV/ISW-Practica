# language: es
@bdd
Característica: Búsqueda y filtrado de experiencias
  Como usuario de PlanB
  Quiero buscar experiencias y aplicar filtros
  Para descubrir planes que se adapten a mis intereses

  Escenario: Buscar experiencias por texto
    Dado que Ana ha iniciado sesión para buscar experiencias
    Y que existen planes de prueba de distintas temáticas
    Cuando Ana busca planes que mencionan un museo
    Entonces aparecen los planes de museo esperados
    Y no aparecen los planes que no coinciden con el texto

  Escenario: Filtrar experiencias por ciudad
    Dado que Ana ha iniciado sesión para buscar experiencias
    Y que existen planes de prueba en Madrid y otra ciudad
    Cuando Ana filtra los planes de prueba por Madrid
    Entonces solo aparecen los planes de prueba de Madrid

  Escenario: Filtrar experiencias por categoría
    Dado que Ana ha iniciado sesión para buscar experiencias
    Y que existen planes de Cultura y Naturaleza para buscar
    Cuando Ana filtra los planes de prueba por Cultura
    Entonces aparecen únicamente los planes de Cultura

  Escenario: Combinar varios filtros
    Dado que Ana ha iniciado sesión para buscar experiencias
    Y que existen planes con distintas ciudades y categorías
    Cuando Ana filtra por Madrid y Gastronomía
    Entonces aparecen únicamente los planes que cumplen ambos filtros

  Escenario: Buscar experiencias de amigos
    Dado que Ana ha iniciado sesión para buscar experiencias
    Y que Beatriz es amiga de Ana para la búsqueda
    Y que Carlos no es amigo de Ana para la búsqueda
    Y que Beatriz y Carlos tienen planes públicos de prueba
    Cuando Ana activa el filtro de experiencias de amigos
    Entonces aparecen los planes de Beatriz
    Y no aparecen los planes de Carlos

  Escenario: Respetar la visibilidad en los resultados
    Dado que Ana ha iniciado sesión para buscar experiencias
    Y que existen planes públicos y privados de prueba
    Cuando Ana busca todas las experiencias de prueba
    Entonces aparecen los planes públicos y los privados propios
    Y no aparecen los planes privados ajenos

  Escenario: Paginar resultados sin duplicados
    Dado que Ana ha iniciado sesión para buscar experiencias
    Y que existen cinco experiencias visibles de prueba
    Cuando Ana carga todas las páginas de dos resultados
    Entonces obtiene las cinco experiencias de prueba
    Y no se repite ninguna experiencia entre páginas

  Escenario: Buscar sin obtener resultados
    Dado que Ana ha iniciado sesión para buscar experiencias
    Cuando Ana busca un texto sin coincidencias
    Entonces recibe una lista de experiencias vacía
    Y la búsqueda termina sin error

  Escenario: Rechazar un filtro no válido
    Dado que Ana ha iniciado sesión para buscar experiencias
    Cuando Ana intenta buscar con una categoría no permitida
    Entonces la búsqueda devuelve un error 400

  Escenario: Buscar sin iniciar sesión
    Dado que Ana intenta buscar sin iniciar sesión
    Cuando solicita el listado de experiencias sin sesión
    Entonces la búsqueda devuelve un error 401

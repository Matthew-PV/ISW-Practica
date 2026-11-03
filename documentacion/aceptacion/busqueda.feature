# language: es
Característica: Búsqueda y filtrado de experiencias
  Como usuario de PlanB
  Quiero buscar experiencias y aplicar filtros
  Para descubrir planes que se adapten a mis intereses

  Escenario: Buscar experiencias por texto
    Dado que Ana ha iniciado sesión
    Y que existen experiencias públicas de distintas temáticas
    Cuando Ana busca experiencias que contienen "museo"
    Entonces aparecen las experiencias que contienen "museo" en su título o descripción
    Y no aparecen las que no coinciden con la búsqueda

  Escenario: Filtrar experiencias por ciudad
    Dado que Ana ha iniciado sesión
    Y que existen experiencias públicas en Madrid y Barcelona
    Cuando Ana filtra las experiencias por Madrid
    Entonces aparecen únicamente las experiencias de Madrid

  Escenario: Filtrar experiencias por categoría
    Dado que existen experiencias públicas de las categorías Cultura y Naturaleza
    Y que Ana ha iniciado sesión
    Cuando Ana selecciona la categoría Cultura
    Entonces aparecen las experiencias de Cultura
    Y no aparecen las experiencias de Naturaleza

  Escenario: Combinar varios filtros
    Dado que Ana ha iniciado sesión
    Y que existen experiencias públicas con diferentes ciudades y categorías
    Cuando Ana filtra por Madrid y la categoría Gastronomía
    Entonces solo aparecen experiencias que cumplen ambos filtros

  Escenario: Buscar experiencias de amigos
    Dado que Ana ha iniciado sesión
    Y que Beatriz es amiga de Ana
    Y que Carlos no tiene amistad con Ana
    Y que ambos han publicado experiencias visibles para Ana
    Cuando Ana activa el filtro de amigos
    Entonces aparecen las experiencias de Beatriz
    Y no aparecen las experiencias de Carlos

  Escenario: Respetar la visibilidad en los resultados
    Dado que Ana ha iniciado sesión
    Y que existen experiencias públicas y privadas de otros usuarios
    Cuando Ana consulta las experiencias disponibles
    Entonces aparecen las experiencias públicas
    Y no aparecen las experiencias privadas ajenas

  Escenario: Paginar resultados sin duplicados
    Dado que Ana ha iniciado sesión
    Y que existen más experiencias visibles que el límite de una página
    Cuando Ana consulta la primera página de resultados
    Y solicita la siguiente utilizando el cursor recibido
    Entonces obtiene las experiencias de la siguiente página
    Y no se repite ninguna experiencia entre ambas páginas

  Escenario: Buscar sin obtener resultados
    Dado que Ana ha iniciado sesión
    Cuando busca experiencias con un texto que no coincide con ninguna
    Entonces recibe una lista de experiencias vacía
    Y no se produce ningún error

  Escenario: Rechazar un filtro no válido
    Dado que Ana ha iniciado sesión
    Cuando intenta filtrar por una categoría no permitida
    Entonces recibe un error 400

  Escenario: Buscar sin iniciar sesión
    Dado que Ana no ha iniciado sesión
    Cuando intenta buscar experiencias
    Entonces recibe un error 401

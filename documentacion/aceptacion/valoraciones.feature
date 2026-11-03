
# language: es
Característica: Valoraciones de experiencias
  Como usuario de PlanB
  Quiero valorar experiencias y consultar las valoraciones de otros usuarios
  Para compartir opiniones y conocer las experiencias de mi círculo social

  Escenario: Valorar una experiencia correctamente
    Dado que Ana ha iniciado sesión
    Y que Beatriz ha publicado una experiencia pública
    Cuando Ana valora la experiencia con 5 estrellas y un comentario
    Entonces la valoración se guarda correctamente
    Y el servidor responde con estado 201
    Y Ana puede consultar su valoración

  Escenario: Actualizar una valoración existente
    Dado que Ana ha valorado una experiencia con 3 estrellas
    Cuando Ana vuelve a valorarla con 5 estrellas
    Entonces su valoración se actualiza
    Y sigue existiendo una sola valoración de Ana para esa experiencia
    Y el servidor responde con estado 200

  Escenario: Rechazar una puntuación no válida
    Dado que Ana ha iniciado sesión
    Y que existe una experiencia pública de Beatriz
    Cuando Ana intenta valorarla con 6 estrellas
    Entonces recibe un error 400
    Y no se guarda la valoración

  Escenario: Impedir valorar una experiencia propia
    Dado que Ana ha creado una experiencia
    Cuando intenta valorar su propia experiencia
    Entonces recibe un error 403
    Y no se guarda ninguna valoración nueva

  Escenario: Consultar todas las valoraciones
    Dado que una experiencia pública tiene varias valoraciones
    Cuando Ana consulta sus valoraciones
    Entonces aparecen las valoraciones de los distintos usuarios
    Y se ordenan de la más reciente a la más antigua
    Y no se muestran los emails de sus autores

  Escenario: Consultar valoraciones de amigos y seguidores
    Dado que Ana ha iniciado sesión
    Y que Beatriz es amiga de Ana
    Y que Carlos sigue a Ana
    Y que David no tiene relación con Ana
    Y que todos han valorado una experiencia pública
    Cuando Ana consulta las valoraciones de amigos y seguidores
    Entonces aparecen las valoraciones de Beatriz y Carlos
    Y no aparece la valoración de David

  Escenario: No incluir solicitudes pendientes
    Dado que Ana tiene una solicitud de amistad pendiente con Beatriz
    Y que Beatriz no sigue a Ana
    Y que Beatriz ha valorado una experiencia pública
    Cuando Ana consulta las valoraciones de amigos y seguidores
    Entonces no aparece la valoración de Beatriz

  Escenario: Mostrar una lista vacía sin relaciones
    Dado que Ana no tiene amigos ni seguidores
    Y que existe una experiencia pública con valoraciones
    Cuando Ana consulta las valoraciones de amigos y seguidores
    Entonces recibe una lista vacía
    Y el servidor responde con estado 200

  Escenario: Paginar valoraciones sin duplicados
    Dado que Ana tiene varias valoraciones de amigos y seguidores disponibles
    Cuando consulta la primera página de valoraciones
    Y solicita la siguiente página utilizando el cursor
    Entonces recibe las valoraciones siguientes
    Y no se repite ninguna valoración entre ambas páginas

  Escenario: Impedir consultar valoraciones de una experiencia privada
    Dado que Beatriz ha creado una experiencia privada
    Y que Ana no tiene permiso para verla
    Cuando Ana intenta consultar sus valoraciones
    Entonces recibe un error 404
    Y no obtiene información de las valoraciones

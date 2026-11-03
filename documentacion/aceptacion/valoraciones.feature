# language: es
@bdd
Característica: Valoraciones de experiencias
  Como usuario de PlanB
  Quiero valorar experiencias y consultar las valoraciones de otros usuarios
  Para compartir opiniones y conocer las experiencias de mi círculo social

  Escenario: Valorar una experiencia correctamente
    Dado que Ana ha iniciado sesión para gestionar valoraciones
    Y que Beatriz ha publicado una experiencia pública para valorar
    Cuando Ana valora el plan con cinco estrellas y un comentario
    Entonces se guarda una valoración de Ana en MySQL
    Y el alta de la valoración responde 201
    Y Ana puede consultar su propia valoración

  Escenario: Actualizar una valoración existente
    Dado que Ana ya ha valorado un plan ajeno con tres estrellas
    Cuando Ana actualiza su valoración a cinco estrellas
    Entonces la actualización de la valoración responde 200
    Y sigue existiendo una sola valoración de Ana para el plan

  Escenario: Rechazar una puntuación no válida
    Dado que Ana ha iniciado sesión para gestionar valoraciones
    Y que Beatriz ha publicado una experiencia pública para valorar
    Cuando Ana intenta valorarla con seis estrellas
    Entonces la puntuación incorrecta devuelve error 400
    Y no se guarda ninguna valoración de Ana

  Escenario: Impedir valorar una experiencia propia
    Dado que Ana ha publicado un plan propio para valorar
    Cuando Ana intenta valorar su propio plan
    Entonces se rechaza la valoración propia con estado 403
    Y no se guarda ninguna valoración de Ana

  Escenario: Consultar todas las valoraciones
    Dado que una experiencia pública contiene tres valoraciones
    Cuando Ana solicita todas las valoraciones del plan
    Entonces aparecen las tres valoraciones registradas
    Y se muestran de la más reciente a la más antigua
    Y los autores se muestran sin email ni contraseña

  Escenario: Consultar valoraciones de amigos y seguidores
    Dado que Beatriz es amiga de Ana para consultar valoraciones
    Y que Carlos sigue a Ana para consultar valoraciones
    Y que David no tiene relación con Ana para consultar valoraciones
    Y que los tres han valorado un plan público de Eva
    Cuando Ana solicita las valoraciones de amigos y seguidores
    Entonces aparecen las valoraciones de Beatriz y Carlos
    Y no aparece la valoración de David

  Escenario: No incluir solicitudes pendientes
    Dado que Ana tiene una solicitud de amistad pendiente con Beatriz para valoraciones
    Y que Beatriz no sigue a Ana en la prueba de valoraciones
    Y que Beatriz ha valorado un plan público de Eva
    Cuando Ana solicita las valoraciones de amigos y seguidores
    Entonces no aparece ninguna valoración de Beatriz

  Escenario: Mostrar una lista vacía sin relaciones
    Dado que Ana no tiene amistades ni seguidores para consultar valoraciones
    Y que existe un plan público con valoraciones ajenas
    Cuando Ana solicita las valoraciones de amigos y seguidores
    Entonces la lista de valoraciones relacionadas está vacía
    Y la consulta de valoraciones relacionadas responde 200

  Escenario: Paginar valoraciones sin duplicados
    Dado que Ana dispone de tres valoraciones de seguidores
    Cuando Ana solicita dos valoraciones en la primera página
    Y solicita la siguiente página usando el cursor
    Entonces recibe las tres valoraciones entre ambas páginas
    Y no se repiten valoraciones entre las páginas

  Escenario: Impedir consultar valoraciones de una experiencia privada
    Dado que Beatriz ha publicado un plan privado para comprobar valoraciones
    Y que Ana no tiene acceso a ese plan
    Cuando Ana consulta las valoraciones del plan privado
    Entonces la consulta de valoraciones devuelve error 404
    Y la respuesta no revela información del plan ni sus valoraciones

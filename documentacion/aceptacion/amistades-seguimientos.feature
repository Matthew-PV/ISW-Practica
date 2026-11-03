
# language: es
Característica: Amistades y seguimientos entre usuarios
  Como usuario de PlanB
  Quiero gestionar mis amistades y seguimientos
  Para relacionarme con otros usuarios y consultar sus planes

  Escenario: Enviar una solicitud de amistad
    Dado que Ana ha iniciado sesión
    Y que Beatriz es otra usuaria registrada
    Cuando Ana envía una solicitud de amistad a Beatriz
    Entonces la solicitud queda en estado PENDIENTE
    Y Beatriz puede verla entre sus solicitudes recibidas

  Escenario: Aceptar una solicitud de amistad
    Dado que Ana ha enviado una solicitud de amistad a Beatriz
    Cuando Beatriz acepta la solicitud
    Entonces ambas usuarias quedan como amigas
    Y el contador de amigos de ambas aumenta en uno

  Escenario: Rechazar una solicitud de amistad
    Dado que Ana ha enviado una solicitud de amistad a Beatriz
    Cuando Beatriz rechaza la solicitud
    Entonces la solicitud desaparece
    Y no se crea ninguna amistad

  Escenario: Impedir solicitudes duplicadas
    Dado que Ana ha enviado una solicitud de amistad a Beatriz
    Cuando Ana intenta enviar otra solicitud a Beatriz
    Entonces recibe un error 400
    Y no se crea una segunda solicitud

  Escenario: Cancelar una solicitud enviada
    Dado que Ana ha enviado una solicitud de amistad a Beatriz
    Cuando Ana cancela su solicitud pendiente
    Entonces la solicitud desaparece
    Y Ana puede volver a enviar otra solicitud

  Escenario: Eliminar una amistad
    Dado que Ana y Beatriz tienen una amistad aceptada
    Cuando Ana elimina la amistad
    Entonces ambas dejan de aparecer como amigas
    Y sus contadores de amigos disminuyen en uno

  Escenario: Seguir a otro usuario
    Dado que Ana ha iniciado sesión
    Y que Beatriz es otra usuaria registrada
    Cuando Ana comienza a seguir a Beatriz
    Entonces Ana aparece entre los seguidores de Beatriz
    Y el contador de seguidores de Beatriz aumenta en uno
    Y no se crea una amistad automáticamente

  Escenario: Dejar de seguir a otro usuario
    Dado que Ana sigue a Beatriz
    Cuando Ana deja de seguir a Beatriz
    Entonces Ana desaparece de sus seguidores
    Y el contador de seguidores de Beatriz disminuye en uno

  Escenario: Impedir que un usuario se siga a sí mismo
    Dado que Ana ha iniciado sesión
    Cuando Ana intenta seguirse a sí misma
    Entonces recibe un error 400
    Y no se crea ningún seguimiento


# language: es
Característica: Gestión de perfiles de usuario
  Como usuario de PlanB
  Quiero consultar y modificar mi perfil
  Para mantener mis datos actualizados y conocer a otros usuarios

  Escenario: Consultar mi propio perfil
    Dado que Ana ha iniciado sesión
    Cuando consulta su perfil
    Entonces aparecen su nombre, email, foto y ciudad

  Escenario: Actualizar los datos de mi perfil
    Dado que Ana ha iniciado sesión
    Cuando modifica su nombre de usuario y su ciudad
    Entonces los cambios se guardan correctamente
    Y aparecen al volver a consultar su perfil

  Escenario: Rechazar un nombre de usuario duplicado
    Dado que Ana ha iniciado sesión
    Y que Beatriz tiene un nombre de usuario registrado
    Cuando Ana intenta cambiar su nombre por el de Beatriz
    Entonces recibe un error 400
    Y conserva su nombre anterior

  Escenario: Consultar el perfil de otro usuario
    Dado que Ana ha iniciado sesión
    Y que Beatriz tiene un perfil registrado
    Cuando Ana consulta el perfil de Beatriz
    Entonces puede ver su nombre, foto y ciudad
    Y puede consultar sus contadores de amigos y seguidores
    Pero no puede ver su email ni su contraseña

  Escenario: Consultar un usuario inexistente
    Dado que Ana ha iniciado sesión
    Cuando consulta el perfil de un usuario inexistente
    Entonces recibe un error 404

  Escenario: Consultar un perfil sin iniciar sesión
    Dado que Ana no ha iniciado sesión
    Cuando intenta consultar su perfil
    Entonces recibe un error 401


  Escenario: Actualizar la foto de perfil correctamente
    Dado que Ana ha iniciado sesión
    Y que dispone de una imagen PNG válida
    Cuando Ana sube la imagen como foto de perfil
    Entonces el servidor responde con estado 200
    Y la nueva foto aparece al consultar su perfil

  Escenario: Rechazar una foto con formato no permitido
    Dado que Ana ha iniciado sesión
    Y que dispone de un archivo GIF
    Cuando intenta utilizarlo como foto de perfil
    Entonces recibe un error 400
    Y conserva su foto anterior

  Escenario: Rechazar una foto demasiado grande
    Dado que Ana ha iniciado sesión
    Y que dispone de una imagen que supera los 5 MB
    Cuando intenta subirla como foto de perfil
    Entonces recibe un error 400
    Y conserva su foto anterior

  Escenario: Impedir modificar la foto sin sesión
    Dado que Ana no ha iniciado sesión
    Cuando intenta subir una nueva foto de perfil
    Entonces recibe un error 401
    Y no se modifica ninguna foto

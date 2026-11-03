# language: es
Característica: Creación, edición y visibilidad de experiencias
  Como usuario de PlanB
  Quiero crear experiencias y controlar quién puede verlas
  Para compartir mis planes de forma segura

  Escenario: Crear una experiencia correctamente
    Dado que Ana ha iniciado sesión
    Y que existe una ciudad en el catálogo
    Cuando Ana crea una experiencia con título, descripción y ciudad válidos
    Entonces la experiencia se crea correctamente
    Y Ana queda registrada como su autora
    Y la experiencia es pública por defecto

  Escenario: Impedir la creación con datos incompletos
    Dado que Ana ha iniciado sesión
    Cuando intenta crear una experiencia sin título
    Entonces recibe un error 400
    Y no se guarda ninguna experiencia nueva

  Escenario: Impedir la creación con una ciudad inexistente
    Dado que Ana ha iniciado sesión
    Cuando intenta crear una experiencia con una ciudad inexistente
    Entonces recibe un error 400
    Y no se guarda ninguna experiencia nueva

  Escenario: Editar una experiencia propia
    Dado que Ana ha creado una experiencia
    Cuando modifica su título y descripción
    Entonces los cambios se guardan correctamente
    Y aparecen al volver a consultar la experiencia

  Escenario: Impedir editar experiencias ajenas
    Dado que Ana ha iniciado sesión
    Y que Beatriz es autora de una experiencia
    Cuando Ana intenta modificar esa experiencia
    Entonces recibe un error 403
    Y los datos de la experiencia permanecen iguales

  Escenario: Consultar una experiencia pública
    Dado que Beatriz ha creado una experiencia pública
    Y que Ana ha iniciado sesión
    Cuando Ana consulta esa experiencia
    Entonces puede ver sus datos
    Y el servidor responde con estado 200

  Escenario: Proteger una experiencia privada
    Dado que Beatriz ha creado una experiencia privada
    Y que Ana ha iniciado sesión
    Cuando Ana intenta consultar esa experiencia
    Entonces recibe un error 404
    Y no obtiene información de la experiencia

  Escenario: Consultar una experiencia solo para amigos
    Dado que Beatriz ha creado una experiencia con visibilidad AMIGOS
    Y que Ana y Beatriz tienen una amistad aceptada
    Cuando Ana consulta esa experiencia
    Entonces puede acceder a su contenido

  Escenario: Impedir el acceso con una amistad pendiente
    Dado que Beatriz ha creado una experiencia con visibilidad AMIGOS
    Y que Ana tiene una solicitud de amistad pendiente con Beatriz
    Cuando Ana intenta consultar esa experiencia
    Entonces recibe un error 404
    Y no obtiene información de la experiencia

  Escenario: Revocar acceso al cambiar la visibilidad
    Dado que Beatriz ha creado una experiencia pública
    Y que Ana puede consultarla
    Cuando Beatriz cambia la visibilidad a PRIVADA
    Entonces Ana deja de poder acceder a la experiencia
    Y recibe un error 404 al volver a consultarla

  Escenario: Consultar las categorías y momentos disponibles
    Dado que Ana ha iniciado sesión
    Cuando consulta las opciones para clasificar experiencias
    Entonces recibe una respuesta 200
    Y entre las categorías disponibles aparece "Cultura"
    Y entre los momentos disponibles aparece "Por la tarde"

  Escenario: Crear una experiencia con categoría y momento
    Dado que Ana ha iniciado sesión
    Y que existe una ciudad válida en el catálogo
    Cuando crea una experiencia de categoría "Cultura"
    Y selecciona "Por la tarde" como momento adecuado
    Entonces la experiencia se crea correctamente
    Y conserva la categoría y el momento seleccionados

  Escenario: Rechazar una categoría no permitida
    Dado que Ana ha iniciado sesión
    Y que existe una ciudad válida en el catálogo
    Cuando intenta crear una experiencia con una categoría inexistente
    Entonces recibe un error 400
    Y no se guarda ninguna experiencia nueva

  Escenario: Consultar todos mis planes
    Dado que Ana ha iniciado sesión
    Y que ha creado experiencias públicas, privadas y solo para amigos
    Cuando consulta el listado de experiencias de su propio perfil
    Entonces aparecen todas sus experiencias
    Y se respeta la visibilidad guardada de cada una

  Escenario: Consultar los planes de otro usuario
    Dado que Ana ha iniciado sesión
    Y que Beatriz ha creado experiencias públicas y privadas
    Y que Ana no es amiga de Beatriz
    Cuando Ana consulta las experiencias de Beatriz
    Entonces aparecen sus experiencias públicas
    Y no aparecen sus experiencias privadas

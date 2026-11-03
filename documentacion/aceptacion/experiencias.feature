# language: es
@bdd
Característica: Creación, edición y visibilidad de experiencias
  Como usuario de PlanB
  Quiero crear experiencias y controlar quién puede verlas
  Para compartir mis planes de forma segura

  Escenario: Crear una experiencia correctamente
    Dado que Ana ha iniciado sesión para gestionar experiencias
    Y que existe una ciudad válida para las experiencias
    Cuando Ana crea una experiencia con datos válidos
    Entonces la experiencia se crea con estado 201
    Y la experiencia creada pertenece a Ana
    Y es pública por defecto

  Escenario: Impedir la creación con datos incompletos
    Dado que Ana ha iniciado sesión para gestionar experiencias
    Cuando Ana intenta crear una experiencia sin título
    Entonces la creación de experiencia devuelve error 400
    Y no se guarda ninguna experiencia nueva de Ana

  Escenario: Impedir la creación con una ciudad inexistente
    Dado que Ana ha iniciado sesión para gestionar experiencias
    Cuando Ana intenta crear una experiencia con ciudad inexistente
    Entonces la creación de experiencia devuelve error 400
    Y no se guarda ninguna experiencia nueva de Ana

  Escenario: Editar una experiencia propia
    Dado que Ana ha publicado una experiencia propia
    Cuando Ana modifica el título y la descripción de su experiencia
    Entonces los cambios de la experiencia se guardan en MySQL
    Y Ana puede ver los datos nuevos al recargarla

  Escenario: Impedir editar experiencias ajenas
    Dado que Beatriz ha publicado una experiencia para comprobar permisos
    Cuando Ana intenta editar la experiencia de Beatriz
    Entonces la edición ajena devuelve error 403
    Y la experiencia de Beatriz conserva sus datos

  Escenario: Consultar una experiencia pública
    Dado que Beatriz ha publicado una experiencia PUBLICA para Ana
    Cuando Ana abre la experiencia de Beatriz
    Entonces Ana recibe la experiencia con estado 200
    Y puede consultar su título y su autora

  Escenario: Proteger una experiencia privada
    Dado que Beatriz ha publicado una experiencia PRIVADA para Ana
    Cuando Ana abre la experiencia de Beatriz
    Entonces el acceso a la experiencia devuelve error 404
    Y no se revelan los datos de la experiencia

  Escenario: Consultar una experiencia solo para amigos
    Dado que Beatriz ha publicado una experiencia AMIGOS para Ana
    Y que Ana y Beatriz tienen una amistad aceptada para experiencias
    Cuando Ana abre la experiencia de Beatriz
    Entonces Ana recibe la experiencia con estado 200
    Y puede consultar su título y su autora

  Escenario: Impedir el acceso con una amistad pendiente
    Dado que Beatriz ha publicado una experiencia AMIGOS para Ana
    Y que Ana tiene una solicitud pendiente para experiencias
    Cuando Ana abre la experiencia de Beatriz
    Entonces el acceso a la experiencia devuelve error 404
    Y no se revelan los datos de la experiencia

  Escenario: Revocar acceso al cambiar la visibilidad
    Dado que Beatriz ha publicado una experiencia PUBLICA para Ana
    Y que Ana puede consultarla inicialmente
    Cuando Beatriz convierte la experiencia en PRIVADA
    Entonces Ana pierde el acceso en la siguiente consulta

  Escenario: Consultar las categorías y momentos disponibles
    Dado que Ana ha iniciado sesión para gestionar experiencias
    Cuando Ana consulta las opciones de experiencias
    Entonces las opciones responden con estado 200
    Y aparece la categoría "Cultura"
    Y aparece el momento "Por la tarde"

  Escenario: Crear una experiencia con categoría y momento
    Dado que Ana ha iniciado sesión para gestionar experiencias
    Cuando Ana prepara una experiencia de categoría "Cultura"
    Y la publica para el momento "Por la tarde"
    Entonces la experiencia se crea con estado 201
    Y conserva la categoría y el momento seleccionados

  Escenario: Rechazar una categoría no permitida
    Dado que Ana ha iniciado sesión para gestionar experiencias
    Cuando Ana intenta crear una experiencia con categoría inexistente
    Entonces la creación de experiencia devuelve error 400
    Y no se guarda ninguna experiencia nueva de Ana

  Escenario: Consultar todos mis planes
    Dado que Ana ha iniciado sesión para gestionar experiencias
    Y que Ana ha publicado planes con las tres visibilidades
    Cuando Ana consulta sus experiencias publicadas
    Entonces aparecen sus tres experiencias
    Y se conserva la visibilidad de cada experiencia propia

  Escenario: Consultar los planes de otro usuario
    Dado que Beatriz ha publicado planes públicos y privados para Ana
    Y que Ana no tiene amistad con Beatriz
    Cuando Ana consulta las experiencias publicadas por Beatriz
    Entonces aparece el plan público de Beatriz
    Y no aparece el plan privado de Beatriz

# language: es
@bdd @cs53
Característica: Duración y tarifa de las experiencias
  Como usuario de PlanB
  Quiero indicar la duración y la tarifa de una experiencia
  Para que otros usuarios puedan conocer estos datos

  Escenario: Crear y consultar una experiencia con duración y tarifa
    Dado que una usuaria inicia sesión local para CS-53
    Cuando publica una experiencia CS-53 de 180 minutos y tarifa "25.50"
    Entonces la respuesta de CS-53 es 201
    Y MySQL guarda 180 minutos y tarifa "25.50" para CS-53
    Cuando consulta la experiencia registrada para CS-53
    Entonces la consulta CS-53 muestra 180 minutos y tarifa "25.50"

  Escenario: Editar duración y tarifa
    Dado que una usuaria inicia sesión local para CS-53
    Y que ha publicado una experiencia CS-53 de 180 minutos y tarifa "25.50"
    Cuando modifica la experiencia CS-53 a 240 minutos y tarifa "30.00"
    Entonces la respuesta de CS-53 es 200
    Y MySQL guarda 240 minutos y tarifa "30.00" para CS-53
    Cuando consulta la experiencia registrada para CS-53
    Entonces la consulta CS-53 muestra 240 minutos y tarifa "30.00"

  Escenario: Experiencia gratuita
    Dado que una usuaria inicia sesión local para CS-53
    Cuando publica una experiencia CS-53 de 90 minutos y tarifa "0.00"
    Entonces la respuesta de CS-53 es 201
    Y MySQL guarda 90 minutos y tarifa "0.00" para CS-53

  Escenario: Crear una experiencia sin datos opcionales
    Dado que una usuaria inicia sesión local para CS-53
    Cuando publica una experiencia CS-53 sin duración ni tarifa
    Entonces la respuesta de CS-53 es 201
    Y MySQL guarda duración y tarifa vacías para CS-53

  Esquema del escenario: Rechazar duración o tarifa inválida
    Dado que una usuaria inicia sesión local para CS-53
    Cuando intenta publicar una experiencia CS-53 con campo "<campo>" y valor "<valor>"
    Entonces la respuesta de CS-53 es 400
    Y no se ha creado ninguna experiencia CS-53

    Ejemplos:
      | campo          | valor  |
      | duracionMinutos| -5     |
      | duracionMinutos| 0      |
      | duracionMinutos| 1.5    |
      | tarifa         | -10    |
      | tarifa         | 25.999 |

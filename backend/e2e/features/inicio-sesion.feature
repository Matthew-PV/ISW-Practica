# language: es

@e2e
Característica: Inicio de sesión en PlanB

  Como usuario registrado
  Quiero iniciar sesión en PlanB
  Para acceder a mis experiencias

  Escenario: Inicio de sesión correcto
    Dado que Ana abre la página de inicio de sesión
    Cuando introduce sus credenciales correctamente
    Entonces accede a la página de bienvenida
    Y puede acceder a sus planes
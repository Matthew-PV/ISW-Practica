
# language: es
Característica: Autenticación y sesiones de PlanB
  Como usuario de PlanB
  Quiero registrarme e iniciar sesión
  Para acceder de forma segura a mis planes y mi perfil

  Escenario: Registro correcto
    Dado que una persona no tiene cuenta en PlanB
    Y proporciona datos válidos
    Y supera la comprobación CAPTCHA
    Cuando solicita registrarse
    Entonces se crea su cuenta
    Y se inicia su sesión automáticamente

  Escenario: Inicio de sesión correcto
    Dado que existe un usuario registrado
    Cuando introduce su email y contraseña correctos
    Entonces puede iniciar sesión
    Y puede consultar sus datos de usuario

  Escenario: Contraseña incorrecta
    Dado que existe un usuario registrado
    Cuando intenta iniciar sesión con una contraseña incorrecta
    Entonces recibe un error 401
    Y no se inicia ninguna sesión

  Escenario: Cerrar sesión
    Dado que un usuario tiene una sesión iniciada
    Cuando cierra su sesión
    Entonces recibe una respuesta 204
    Y deja de poder consultar sus datos privados


  Escenario: Solicitar recuperación de contraseña
    Dado que Ana tiene una cuenta registrada
    Cuando solicita recuperar su contraseña mediante su email
    Entonces recibe una respuesta 200
    Y se genera un enlace de recuperación válido durante 30 minutos

  Escenario: Restablecer la contraseña correctamente
    Dado que Ana ha solicitado recuperar su contraseña
    Y dispone de un enlace de recuperación válido
    Cuando establece una nueva contraseña que cumple los requisitos
    Entonces la contraseña se actualiza correctamente
    Y el enlace de recuperación no puede volver a utilizarse

  Escenario: No revelar si un email está registrado
    Dado que existe un email que no pertenece a ningún usuario
    Cuando se solicita recuperar la contraseña de ese email
    Entonces el servidor responde con estado 200
    Y muestra el mismo mensaje que para un email registrado

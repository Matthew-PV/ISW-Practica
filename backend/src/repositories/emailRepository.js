// Envío de emails (CS-64: enlace para restablecer la contraseña).
// Capa: repositorios (repositories): es la frontera con un servicio externo, el servidor de correo.
// Lo usa: services/authService.js.
// Usa: la librería nodemailer y las variables SMTP_URL y EMAIL_REMITENTE de .env.
//
// Con SMTP_URL (por ejemplo smtps://usuario:clave@smtp.proveedor.com:465) el email se envía de
// verdad. Sin ella (desarrollo), se escribe en la consola del servidor, para poder abrir el enlace
// sin haber configurado todavía ningún proveedor.
const nodemailer = require('nodemailer');

// Conexión con el servidor de correo; se crea la primera vez que se envía algo
let transporte = null;

// Envía un email de texto plano. `{ para, asunto, texto }`.
async function enviar({ para, asunto, texto }) {
  if (!process.env.SMTP_URL) {
    console.log(`\n[Email no enviado: falta SMTP_URL en .env]\nPara: ${para}\nAsunto: ${asunto}\n\n${texto}\n`);
    return;
  }
  transporte ??= nodemailer.createTransport(process.env.SMTP_URL);
  await transporte.sendMail({ from: process.env.EMAIL_REMITENTE, to: para, subject: asunto, text: texto });
}

module.exports = { enviar };

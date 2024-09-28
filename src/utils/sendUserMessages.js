/* eslint-disable no-undef */
const nodemailer = require('nodemailer');
require('dotenv').config();
const password=process.env.EMAIL_PASSWORD

// Configuración del transporter para IONOS
const transporter = nodemailer.createTransport({
  host: 'smtp.ionos.es', 
  port: 587, 
  secure: false, 
  auth: {
    user: 'info@lacitadeldia.com', 
    pass: password, 
  },
  tls: {
    ciphers: 'SSLv3'
  }
});


const sendMessages = async (messages) => {
  // Verificar si es un solo mensaje o un array de mensajes
  const mensajes = Array.isArray(messages) ? messages : [messages]; // Convertir a array si es un solo mensaje

  // Procesar cada mensaje
  for (let message of mensajes) {
    try {
      // Crear el contenido del correo basado en el objeto 'message'
      const mailContent = `
        Has recibido un nuevo mensaje.
        
        Nombre: ${message.name || 'Anónimo'}
        Email: ${message.email || 'No especificado'}
        Tipo: ${message.type}
        Asunto: ${message.subject || 'Sin asunto'}
        
        Mensaje:
        ${message.content || 'Sin mensaje'}
      `;

      // Opciones del correo electrónico
      const mailOptions = {
        from: '"Formulario de contacto" <info@lacitadeldia.com>', // Remitente
        to: 'info@lacitadeldia.com', // Dirección de destino
        subject: message.subject || 'Nuevo mensaje recibido', // Asunto del correo
        text: mailContent // Cuerpo del correo en texto plano
      };

      // Enviar el correo
      const info = await transporter.sendMail(mailOptions);
      console.log(`Correo enviado para el mensaje de ${message.name || 'Anónimo'}: ` + info.response);
      return true
    } catch (err) {
      console.error(`Error al enviar el correo:`, err);
    }
  }
};

module.exports = sendMessages;




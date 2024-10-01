/* eslint-disable no-undef */
const sendMessages = require("../../utils/sendUserMessages.js");
const Messages = require("../messages/messages.model.js");

const getAndSendMessages = async () => {
  try {
    const messages = await Messages.find({ newMessage: true });
    if (messages.length > 0) {
      const success = await sendMessages(messages); // Verificar si el envío fue exitoso

      if (success) {
        await markMessagesAsSent(messages); // Solo marcar los mensajes si el envío fue exitoso
      } else {
        console.error("Error: No se pudieron enviar todos los mensajes.");
      }
    } else {
      return false;
    }
  } catch (error) {
    console.error("Hay un error en el envío de mensajes:", error);
  }
};
const markMessagesAsSent = async (messages) => {
  try {
    for (const message of messages) {
      message.newMessage = false;
      await message.save();
    }
  } catch (error) {
    console.error("Error al marcar los mensajes como enviados:", error);
  }
};
const addMessage = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "No se recibió ningún mensaje" });
  }
  if (!message.content) {
    return res.status(400).json({ message: "El mensaje no tiene contenido" });
  }
  try {
    if (message.email) {
      const success = await sendMessages([message]); 

      if (success) {
        message.newMessage = false;
      } else {
        console.error("Error: No se pudieron enviar todos los mensajes.");
      }
    }
    const newMessage = new Messages(message);
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al guardar el mensaje", error: error.message });
  }
};

module.exports = { getAndSendMessages, addMessage };

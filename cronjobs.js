/* eslint-disable no-undef */
const cron = require('node-cron');
const { getPhrase } = require('./src/api/phrases/phrases.controller');
const { getAndSendMessages } = require('./src/api/messages/messages.controller');


// Coge al azar una nueva frase todos los días a las 07:00 horas
cron.schedule('00 5 * * *', async () => {
 
  await getPhrase();
});
//Recupera los mensajes de los usuarios cada día a las 9:00 h
cron.schedule('00 7 * * *', async () => {

  await getAndSendMessages();
});
/* eslint-disable no-undef */
const cron = require('node-cron');
const { getPhrase } = require('./src/api/phrases/phrases.controller');
const { getAndSendMessages } = require('./src/api/messages/messages.controller');
const { updateDailyRanking, updateUsersBonuses } = require('./src/api/users/user.controller');


// Coge al azar una nueva frase todos los días a las 07:00 horas
cron.schedule('00 07 * * *', async () => {
 
  try {
    console.log("Cron de las 7 AM");
    await updateUsersBonuses();
    await getPhrase();
    await updateDailyRanking();
  } catch (error) {
    console.error("Error en el cron de las 7 AM:", error);
  }
}, {
  timezone: "Europe/Amsterdam" 
});
//Recupera los mensajes de los usuarios cada día a las 9:00 h
cron.schedule('00 09 * * *', async () => {

  try {
    await getAndSendMessages();
  } catch (error) {
    console.error("Error en el cron de las 7 AM:", error);
  }
}, {
  timezone: "Europe/Amsterdam"
});
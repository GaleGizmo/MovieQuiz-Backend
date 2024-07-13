/* eslint-disable no-undef */
const cron = require('node-cron');
const { getPhrase } = require('./src/api/phrases/phrases.controller');


// Coge al azar una nueva frase todos los días a las 09:00 horas
cron.schedule('00 5 * * *', async () => {
  console.log("Ejecutando tarea cron para obtener la frase del día");
  await getPhrase();
});
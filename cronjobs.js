/* eslint-disable no-undef */
const cron = require("node-cron");
const {
  getPhrase,
  updateLostGamesAndUsers,
} = require("./src/api/phrases/phrases.controller");
const {
  getAndSendMessages,
} = require("./src/api/messages/messages.controller");
const {
  updateDailyRanking,
  updateUsersBonuses,
  specialDayBonuses,
} = require("./src/api/users/user.controller");
const {
  createThreKingsNotification,
} = require("./src/api/notifications/notifications.controller");

const runMorningTasks = async () => {
  console.log("Iniciando tareas de las 7 AM");

  let phrase = null;

  try {
    phrase = await getPhrase();
    console.log("Frase del día obtenida correctamente:");
  } catch (error) {
    console.error("Error al obtener la frase del día:", error);
  }
  // Actualiza los juegos perdidos y los usuarios
  try {
    if (phrase && phrase.number) {
      await updateLostGamesAndUsers(phrase.number);
      console.log("Juegos perdidos y usuarios actualizados");
    } else {
      console.warn(
        "No se actualizan juegos perdidos porque no se obtuvo una frase válida"
      );
    }
  } catch (error) {
    console.error("Error al actualizar juegos perdidos y usuarios:", error);
  }
  // Actualiza las rachas de los usuarios
  try {
    if (phrase && phrase.number) {
      await updateUsersBonuses(phrase.number - 1);
      console.log("Rachas de usuarios actualizadas");
    } else {
      console.warn(
        "No se actualizan rachas porque no se obtuvo una frase válida"
      );
    }
  } catch (error) {
    console.error("Error al actualizar rachas de usuarios:", error);
  }

  // Actualiza el ranking diario
  // Se ejecuta después de actualizar los juegos perdidos y los usuarios
  try {
    await updateDailyRanking();
    console.log("Ranking diario actualizado");
  } catch (error) {
    console.error("Error al actualizar el ranking diario:", error);
  }

  console.log("Tareas de las 7 AM finalizadas (con o sin errores)");
};

// Coge al azar una nueva frase todos los días a las 07:00 horas
cron.schedule(
  "00 07 * * *",
  async () => {
    await runMorningTasks();
  },
  {
    timezone: "Europe/Amsterdam",
  }
);
//Recupera los mensajes de los usuarios cada día a las 9:00 h
cron.schedule(
  "00 09 * * *",
  async () => {
    try {
      await getAndSendMessages();
    } catch (error) {
      console.error("Error en el cron de las 7 AM:", error);
    }
  },
  {
    timezone: "Europe/Amsterdam",
  }
);
cron.schedule(
  "01 07 6 1 *",
  async () => {
    try {
      await specialDayBonuses();
      await createThreKingsNotification();
    } catch (error) {
      console.error("Error en el cron de Reyes", error);
    }
  },
  {
    timezone: "Europe/Amsterdam",
  }
);
module.exports = {
  runMorningTasks,
};

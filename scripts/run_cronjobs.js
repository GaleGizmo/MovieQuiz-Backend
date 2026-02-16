/* eslint-disable no-undef */
require("dotenv").config();
const db = require("../src/utils/db.js");
const { runMorningTasks } = require("../cronjobs.js");

const run = async () => {
  try {
    console.log("Conectando a la base de datos...");
    await db.connectDB();
    
    console.log("Ejecutando tareas de la mañana...");
    await runMorningTasks();
    
    console.log("Tareas completadas. Cerrando conexión...");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

run();

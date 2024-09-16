/* eslint-disable no-undef */
const mongoose = require("mongoose");

const DB_ACCESS = process.env.DB_URL;

// Detener el proceso si no se encuentra la URL de la DB
if (!DB_ACCESS) {
  console.error("La variable de entorno DB_URL no está definida. Verifica tu archivo .env");
  process.exit(1); 
}

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoReconnect: true,
      connectTimeoutMS: 10000, // Tiempo máximo para intentar conectar (10 segundos)
      socketTimeoutMS: 45000, // Tiempo de espera máximo para las operaciones de socket
      
    };

    const db = await mongoose.connect(DB_ACCESS, options);

    const { host } = db.connection;
    console.log("conexión exitosa en el host:" + host);

  // Manejo de eventos de conexión de Mongoose
  mongoose.connection.on("connected", () => {
    console.log("Conectado a MongoDB");
  });

  mongoose.connection.on("error", (err) => {
    console.error("Error en la conexión a MongoDB:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("Desconectado de MongoDB. Intentando reconectar...");
  });

} catch (error) {
  console.error("Error al intentar conectar a la base de datos:", error.message); 
  process.exit(1); 
}
};

// Escuchar eventos de cierre para cerrar conexiones de forma segura
process.on('SIGINT', async () => {
await mongoose.connection.close();
console.log("Conexión a MongoDB cerrada debido a la terminación del proceso");
process.exit(0);
});

module.exports = { connectDB };
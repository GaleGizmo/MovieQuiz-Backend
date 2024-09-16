/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
require("dotenv").config();
require("./cronjobs.js")
const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5000; // Convertir el puerto a número
const db = require("./src/utils/db.js");

// Conectar a la base de datos
db.connectDB();

// Importar rutas
const phrasesRoutes = require("./src/api/phrases/phrases.routes");
const gameRoutes = require("./src/api/game/game.routes");
const userRoutes = require("./src/api/users/user.routes")

// Configurar middlewares
// Configurar CORS para solo permitir ciertos dominios
const allowedOrigins = ['https://lacitadeldia-front.vercel.app', 'http://localhost:5173']; // Añade tus dominios de producción

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS no permitido para este dominio'));
    }
  },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar rutas
app.use("/phrases", phrasesRoutes);
app.use("/game", gameRoutes);
app.use("/user", userRoutes)

app.use((err, req, res, next) => {
  return res.status(err.status || 500).json(err.message || "Unexpected error");
});

app.use("/", (req, res) => {
  res.send("its alive!");
});

app.use("*", (req, res, next) => {
  return res.status(404).json("Route not found");
});

// Crear servidor HTTP
const server = http.createServer(app);

function startServer(port) {
  server.listen(port);

  server.on("listening", () => {
    console.log('Servidor iniciado en el puerto ' + port);
  });

  server.on("error", (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`El puerto ${port} está en uso. Intentando iniciar el servidor en el puerto ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Error desconocido:', err);
    }
  });
}

// Iniciar el servidor
startServer(PORT);

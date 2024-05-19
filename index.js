/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
require("dotenv").config();
const express = require("express");
const cors=require("cors")
const server = express();
const PORT = process.env.PORT || 5000;
const db=require("./api/utils/db.js")
db.connectDB()
const phrasesRoutes=require("./api/phrases/phrases.routes")
const gameRoutes=require("./api/game/game.routes")
server.use(cors())

server.use(express.json())
server.use(express.urlencoded({extended:true}))

server.use("/frases", phrasesRoutes)
server.use("/game", gameRoutes)
server.use((err, req, res, next) => {
  return res.status(err.status || 500).json(err.message || "Unexpected error");
});

server.use("/", (req, res) => {
  res.send("its alive!");
});
server.use("*", (req, res, next) => {
  return res.status(404).json("Route not found");
});
function startServer(port) {
    server.listen(port, function(err) {
      if (err) {
        console.log('Error al iniciar el servidor en el puerto ' + port);
        if (err.code === 'EADDRINUSE') {
          console.log('Intentando iniciar el servidor en un puerto alternativo');
          startServer(port + 1);
        } else {
          console.log('Error desconocido:', err);
        }
      } else {
        console.log('Servidor iniciado en el puerto ' + port);
      }
    });
  }
  startServer(PORT);
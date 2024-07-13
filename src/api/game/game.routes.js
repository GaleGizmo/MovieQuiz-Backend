/* eslint-disable no-undef */
const express=require("express")
const { startGame, tryWord, updateGame, getActiveGame, getUserStats }=require("./game.controller")
const gameRoutes=express.Router()

gameRoutes.post("/start",startGame)
gameRoutes.post("/checkWord", tryWord)
gameRoutes.put("/update/:gameId", updateGame)
gameRoutes.get("/active/:gameId", getActiveGame)
gameRoutes.post("/getuserstats", getUserStats)

module.exports=gameRoutes
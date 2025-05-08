/* eslint-disable no-undef */
const express=require("express")
const { startGame, tryWord, updateGame, getActiveGame, getUserStats, useClue, updateGameUserId, getTotalPointsFromUserGames }=require("./game.controller");
const { checkKeyword } = require("../../middleware/auth");
const gameRoutes=express.Router()
require('dotenv').config();

gameRoutes.post("/start",startGame)
gameRoutes.post("/checkWord", tryWord)
gameRoutes.put("/update/:gameId", updateGame)
gameRoutes.get("/active/:gameId", getActiveGame)
gameRoutes.post("/getuserstats", getUserStats)
gameRoutes.post("/useclue/:gameId", useClue)
gameRoutes.post(process.env.ROUTE_UPDATE_USER_ID, checkKeyword, updateGameUserId)
gameRoutes.post("/getuserpointsfromgames", getTotalPointsFromUserGames)

module.exports=gameRoutes
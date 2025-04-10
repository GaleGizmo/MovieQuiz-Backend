/* eslint-disable no-undef */
const express=require("express")
const { startGame, tryWord, updateGame, getActiveGame, getUserStats, useClue, updateGameUserId, getTotalPointsFromUserGames }=require("./game.controller")
const gameRoutes=express.Router()

gameRoutes.post("/start",startGame)
gameRoutes.post("/checkWord", tryWord)
gameRoutes.put("/update/:gameId", updateGame)
gameRoutes.get("/active/:gameId", getActiveGame)
gameRoutes.post("/getuserstats", getUserStats)
gameRoutes.post("/useclue/:gameId", useClue)
gameRoutes.post("/vnrhgureiy7493yt80hv48e0vcjr838udje8mc'1spgo761", updateGameUserId)
gameRoutes.post("/getuserpointsfromgames", getTotalPointsFromUserGames)

module.exports=gameRoutes
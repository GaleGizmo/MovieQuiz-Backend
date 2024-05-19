/* eslint-disable no-undef */
const express=require("express")
const { startGame, tryWord }=require("./game.controller")
const gameRoutes=express.Router()

gameRoutes.post("/start",startGame)
gameRoutes.post("/checkWord", tryWord)

module.exports=gameRoutes
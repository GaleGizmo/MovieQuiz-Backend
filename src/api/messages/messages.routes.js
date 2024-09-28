/* eslint-disable no-undef */
const express=require("express")
const { addMessage }=require("./messages.controller")
const messagesRoutes=express.Router()

messagesRoutes.post("/addmessage",addMessage)

module.exports=messagesRoutes
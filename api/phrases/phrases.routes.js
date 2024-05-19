/* eslint-disable no-undef */
const express=require("express")
const { getPhrase, getPhraseOfTheDay}=require("./phrases.controller")
const phrasesRoutes=express.Router()

phrasesRoutes.get("/eiuhgwoqu4phtrf39862yqiogwjeawrtg", getPhraseOfTheDay)
phrasesRoutes.get("/", getPhrase)

module.exports=phrasesRoutes
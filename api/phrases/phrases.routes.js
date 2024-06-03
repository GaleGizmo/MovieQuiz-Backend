/* eslint-disable no-undef */
const express=require("express")
const { getPhrase, getPhraseOfTheDay, addPhrase}=require("./phrases.controller")
const phrasesRoutes=express.Router()

phrasesRoutes.get("/eiuhgwoqu4phtrf39862yqiogwjeawrtg", getPhraseOfTheDay)
phrasesRoutes.get("/", getPhrase)
phrasesRoutes.post("/youshouldntbehere", addPhrase)

module.exports=phrasesRoutes
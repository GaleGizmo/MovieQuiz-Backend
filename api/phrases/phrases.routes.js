/* eslint-disable no-undef */
const express=require("express")
const { getPhrase, getPhraseOfTheDay, addPhrase, getOldPhrasesStatus, getPhraseByNumber}=require("./phrases.controller")
const phrasesRoutes=express.Router()

phrasesRoutes.get("/eiuhgwoqu4phtrf39862yqiogwjeawrtg", getPhraseOfTheDay)
phrasesRoutes.get("/", getPhrase)
phrasesRoutes.post("/youshouldntbehere", addPhrase)
phrasesRoutes.get("/getphrasebynumber/:phraseNumber", getPhraseByNumber)
phrasesRoutes.get("/getoldphrases/:playerId", getOldPhrasesStatus)

module.exports=phrasesRoutes
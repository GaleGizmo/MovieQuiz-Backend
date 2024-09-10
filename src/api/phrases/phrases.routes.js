/* eslint-disable no-undef */
const express=require("express")
const { getPhrase, getPhraseOfTheDay, addPhrase, getOldPhrasesStatus, getPhraseByNumber, getPhraseOfTheDayNumber  }=require("./phrases.controller")
const phrasesRoutes=express.Router()

phrasesRoutes.get("/eiuhgwoqu4phtrf39862yqiogwjeawrtg", getPhraseOfTheDay)
phrasesRoutes.get("/eiuhgwoqu4phtrf39862yqiogwjeawrtg/getnumber", getPhraseOfTheDayNumber)
phrasesRoutes.get("/", getPhrase)
phrasesRoutes.post("/youshouldntbehere", addPhrase)
phrasesRoutes.get("/eiuhgwoqu4phtrf39862yqiogwjeawrtg/getphrasebynumber/:phraseNumber", getPhraseByNumber)
phrasesRoutes.get("/getoldphrases/:playerId", getOldPhrasesStatus)


module.exports=phrasesRoutes
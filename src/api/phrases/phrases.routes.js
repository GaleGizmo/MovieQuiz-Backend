/* eslint-disable no-undef */
const express=require("express")
const { getPhrase, getPhraseOfTheDay, addPhrase, getOldPhrasesStatus, getPhraseByNumber, getPhraseOfTheDayNumber  }=require("./phrases.controller")
const phrasesRoutes=express.Router()
require('dotenv').config();

// Usar variables de entorno para las rutas
phrasesRoutes.get(process.env.ROUTE_GET_PHRASE_OF_THE_DAY, getPhraseOfTheDay);
phrasesRoutes.get(process.env.ROUTE_GET_PHRASE_OF_THE_DAY_NUMBER, getPhraseOfTheDayNumber);
phrasesRoutes.get(process.env.ROUTE_GET_PHRASE, getPhrase);
phrasesRoutes.post(process.env.ROUTE_POST_ADD_PHRASE, addPhrase);
phrasesRoutes.get(`${process.env.ROUTE_GET_PHRASE_BY_NUMBER}/:phraseNumber`, getPhraseByNumber);
phrasesRoutes.get(`${process.env.ROUTE_GET_OLD_PHRASES}/:playerId`, getOldPhrasesStatus);


module.exports=phrasesRoutes
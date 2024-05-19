/* eslint-disable no-undef */
const Game=require('./game.model.js');
const PhraseOfTheDay = require("../phrases/phraseoftheday.model.js");
const countDistinctConsonants = require("../utils/countConsonants.js");

const startGame=async (req,res,next)=>{
    try {
        const phraseOfTheDay = await PhraseOfTheDay.findOne();
        const distinctConsonants = countDistinctConsonants(phraseOfTheDay.phrase);
        const maxTries=Math.ceil(distinctConsonants / 3);
        const game = new Game({
            phrase: "",
            maximumTries: maxTries,
            triedWords: [],
            currentTry: 0,
            isGameOver: false,
            isWin: false,
        });
      
        await game.save();
        res.status(201).json(game);
    } catch (err) {
        next(err);
    }
    
}
const tryWord = async (req, res, next) => {
    try {
        const { userId, word } = req.body;

        const game = await Game.findOne({ userId, isGameOver: false });
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
  
     
      const response = await fetch(`../assets/palabrasCon${word.charAt(0)}.json`);
      const data = await response.json();
  
      const wordFound = data.palabras.includes(word);
     
      
        return res.status(200).json(wordFound);
      
    } catch (err) {
      next(err);
    }
  };
module.exports={startGame, tryWord};
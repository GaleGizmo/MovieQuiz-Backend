/* eslint-disable no-undef */
const Game = require("./game.model.js");
const fs=require('fs');
const path=require('path');
const PhraseOfTheDay = require("../phrases/phraseoftheday.model.js");
const countDistinctConsonants = require("../utils/countConsonants.js");

const startGame = async (req, res, next) => {
  try {
    const { userUUID } = req.body;
    let game = await Game.findOne({ userId:userUUID, isGameOver: false });
    if (!game) {
      const phraseOfTheDay = await PhraseOfTheDay.findOne();
      const distinctConsonants = countDistinctConsonants(phraseOfTheDay.quote);
      const maxTries = Math.ceil(distinctConsonants / 3);
      game = new Game({
        userId: userUUID,
        phrase: phraseOfTheDay.quote,
        maximumTries: maxTries,
        triedWords: [],
        currentTry: 0,
        isGameOver: false,
        isWin: false,
      });

      await game.save();
     
    }
    game.phrase = ""
    res.status(201).json(game);
  } catch (err) {
    next(err);
  }
};
const tryWord = async (req, res, next) => {
  try {
    const { userId, word } = req.body;

    const game = await Game.findOne({ userId, isGameOver: false });
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    const filePath = path.join(__dirname, '../../assets', `palabrasCon${word.charAt(0)}.json`);
    fs.readFile(filePath, 'utf8', async (err, data) => {
        if (err) {
            return next(err);
        }

        const jsonData = JSON.parse(data);
        const wordFound = jsonData.palabras.includes(word);

        if (wordFound) {
            return res.status(200).json({  wordFound });
        } else {
            return res.status(200).json({ wordFound: false });
        }
    });
  } catch (err) {
    next(err);
  }
};
module.exports = { startGame, tryWord };

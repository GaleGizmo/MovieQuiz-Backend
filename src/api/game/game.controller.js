/* eslint-disable no-undef */
const Game = require("./game.model.js");
const fs = require("fs");
const path = require("path");
const PhraseOfTheDay = require("../phrases/phraseoftheday.model.js");
const countDistinctConsonants = require("../../utils/countConsonants.js");
const Phrase = require("../phrases/phrases.model.js");

const startGame = async (req, res, next) => {
  try {
    const { userUUID, oldPhraseToPlay } = req.body;
    let phraseToPlay = "";
    if (oldPhraseToPlay) {
      phraseToPlay = await Phrase.findOne({ number: oldPhraseToPlay });
    } else {
      phraseToPlay = await PhraseOfTheDay.findOne();
    }
    const distinctConsonants = countDistinctConsonants(phraseToPlay.quote);
    const maxTries = Math.ceil(distinctConsonants / 3) + 1;
    const existingGame = await Game.findOne({
      userId: userUUID,
      phraseNumber: phraseToPlay.number,
    });
    if (existingGame) {
      return res.status(200).json(existingGame);
    } else {
      let game = new Game({
        userId: userUUID,
        phrase: "",
        phraseNumber: phraseToPlay.number,
        maximumTries: maxTries,
        triedWords: [],
        currentTry: 0,
        isGameOver: "",
      });

      await game.save();

      res.status(201).json(game);
    }
  } catch (err) {
    next(err);
  }
};

const updateGame = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { phrase, triedWords, currentTry, isGameOver } = req.body.gameData;
    if (!gameId) {
      return res.status(400).json({ message: "gameId es requerido" });
    }
    const game = await Game.findOneAndUpdate(
      { _id: gameId },
      { phrase, triedWords, currentTry, isGameOver },
      { new: true }
    );
    if (!game) {
      return res.status(404).json({ message: "Juego no encontrado" });
    }
    res.status(200).json(game);
  } catch (err) {
    next(err);
  }
};

const getActiveGame = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findOne({ _id: gameId });
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    res.status(200).json(game);
  } catch (err) {
    next(err);
  }
};
const tryWord = async (req, res, next) => {
  try {
    const { userId, word } = req.body;

    const game = await Game.findOne({ userId, isGameOver: "" });
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    const filePath = path.join(
      __dirname,
      "../../../assets",
      `palabrasCon${word.charAt(0)}.json`
    );
    fs.readFile(filePath, "utf8", async (err, data) => {
      if (err) {
        return next(err);
      }

      const jsonData = JSON.parse(data);
      const wordFound = jsonData.palabras.includes(word);

      if (wordFound) {
        return res.status(200).json({ wordFound });
      } else {
        return res.status(200).json({ wordFound: false });
      }
    });
  } catch (err) {
    next(err);
  }
};
module.exports = { startGame, tryWord, updateGame, getActiveGame };

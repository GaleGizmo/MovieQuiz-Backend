/* eslint-disable no-undef */
const Game = require("./game.model.js");
const fs = require("fs");
const path = require("path");
const PhraseOfTheDay = require("../phrases/phraseoftheday.model.js");
const countDistinctConsonants = require("../../utils/countConsonants.js");
const Phrase = require("../phrases/phrases.model.js");
const removeAccents = require("../../utils/removeAccents.js");
const processPhraseToShow = require("../../utils/processPhraseToShow.js");
const checkLettersFromWord = require("../../utils/checkLettersFromWord.js");
const checkEndGame = require("../../utils/checkEndGame.js");

const startGame = async (req, res, next) => {
  try {
    const { userUUID, phraseToPlay } = req.body;
    let currentPhraseToPlay = "";
    if (phraseToPlay) {
      currentPhraseToPlay = await Phrase.findOne({ number: phraseToPlay });
    } else {
      currentPhraseToPlay = await PhraseOfTheDay.findOne();
    }
    const distinctConsonants = countDistinctConsonants(
      currentPhraseToPlay.quote
    );
    const maxTries = Math.ceil(distinctConsonants / 3) + 1;
    const existingGame = await Game.findOne({
      userId: userUUID,
      phraseNumber: currentPhraseToPlay.number,
    });
    if (existingGame) {
      return res.status(200).json(existingGame);
    } else {
      const plainPhrase = removeAccents(currentPhraseToPlay.quote);
      const hiddenPhrase = processPhraseToShow(plainPhrase, []);
      let game = new Game({
        userId: userUUID,
        phrase: hiddenPhrase,
        phraseNumber: currentPhraseToPlay.number,
        maximumTries: maxTries,
        triedWords: [],
        lettersFound: [],

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
    if (!gameId) {
      return res.status(400).json({ message: "gameId es requerido" });
    }
    const {gameData} = req.body;
    if (!gameData) {
      return res.status(400).json({ message: "Datos de juego son requeridos" });
    }
    let {
      maximumTries,
      triedWord,
      currentTry,
      isGameOver,
      lettersFound,
      phraseNumber,
    } = gameData;
    
    let currentPhrasePlaying = await Phrase.findOne({ number: phraseNumber });
    const plainPhrase = removeAccents(currentPhrasePlaying.quote);
    let newLettersFound = checkLettersFromWord(
      triedWord,
      plainPhrase,
      lettersFound
    );
    if (newLettersFound.length > 0) {
      lettersFound.push(...newLettersFound);
    }
    currentTry++;
    
    let phrase = processPhraseToShow(plainPhrase, lettersFound);
    isGameOver = checkEndGame(
      phrase,
      currentTry,
      maximumTries
    );
    const game = await Game.findOneAndUpdate(
      { _id: gameId },
      { phrase, $push: { triedWords: triedWord }, currentTry, isGameOver, lettersFound },
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
const getUserStats = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const games = await Game.find({ userId: userId });
    const wins = games.filter((game) => game.isGameOver === "win").length;
    const losses = games.filter((game) => game.isGameOver === "lose").length;
    const playing = games.filter((game) => game.isGameOver === "").length;
    const currentPhraseOfTheDay = await PhraseOfTheDay.findOne();
    const phrasesUntilToday = currentPhraseOfTheDay
      ? currentPhraseOfTheDay.number
      : null;
    res.status(200).json({
      wins: wins,
      losses: losses,
      playing: playing,
      phrasesUntilToday: phrasesUntilToday,
    });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  startGame,
  tryWord,
  updateGame,
  getActiveGame,
  getUserStats,
};

/* eslint-disable no-undef */
const Game = require("./game.model.js");
const PhraseOfTheDay = require("../phrases/phraseoftheday.model.js");
const setMaximumTries = require("../../utils/setMaximumTries.js");
const Phrase = require("../phrases/phrases.model.js");
const removeAccents = require("../../utils/removeAccents.js");
const processPhraseToShow = require("../../utils/processPhraseToShow.js");
const checkLettersFromWord = require("../../utils/checkLettersFromWord.js");
const checkEndGame = require("../../utils/checkEndGame.js");
const { updatePoints } = require("../users/user.controller.js");
const User = require("../users/user.model.js");
const isLetter = require("../../utils/isLetter.js");
const isValidWord = require("../../utils/isValidWord");

const startGame = async (req, res, next) => {
  try {
    const { userUUID, phraseToPlay } = req.body;
    let currentPhraseToPlay = "";
    if (phraseToPlay) {
      currentPhraseToPlay = await Phrase.findOne({ number: phraseToPlay });
    } else {
      currentPhraseToPlay = await PhraseOfTheDay.findOne();
    }
    const maxTries = setMaximumTries(currentPhraseToPlay.quote);

    const existingGame = await Game.findOne({
      userId: userUUID,
      phraseNumber: currentPhraseToPlay.number,
    });
    if (existingGame) {
      const existingGameForResponse = {
        ...existingGame.toObject(),
      };
      return res.status(200).json(existingGameForResponse);
    } else {
      const plainPhrase = removeAccents(currentPhraseToPlay.quote);
      const hiddenPhrase = processPhraseToShow(plainPhrase, []);
      let game = new Game({
        userId: userUUID,
        phrase: hiddenPhrase,
        phraseNumber: currentPhraseToPlay.number,
        maximumTries: maxTries,
        movieDirector: "",
        movieActor: "",
        triedWords: [],
        lettersFound: [],
        lettersFailed: [],
        gameResultNotification: false,
        currentTry: 0,
        gameResult: "",
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
    //recupera el estado de la partida en el backend
    const currentGame = await Game.findOne({ _id: gameId });
    if (!currentGame) {
      return res.status(404).json({ message: "Juego no encontrado" });
    }
    const { gameData } = req.body;
    if (!gameData.triedWord && !gameData.gameResultNotification) {
      return res.status(400).json({ message: "Datos de juego son requeridos" });
    }
    let { triedWord, gameResultNotification } = gameData;

    if (gameResultNotification) {
      const game = await Game.findByIdAndUpdate(
        gameId,
        {
          gameResultNotification,
        },
        { new: true }
      );
      return res.status(200).json(game);
    } else {
      let currentPhrasePlaying = await Phrase.findOne({
        number: currentGame.phraseNumber,
      });

      const plainPhrase = removeAccents(currentPhrasePlaying.quote);
      let newLettersFound = checkLettersFromWord(
        triedWord,
        plainPhrase,
        currentGame.lettersFound
      );
      let updatedLettersFound = currentGame.lettersFound;
      if (newLettersFound.length > 0) {
        updatedLettersFound = [...updatedLettersFound, ...newLettersFound];
      }
      const failedLetters = Array.from(triedWord).filter(
        (letter) =>
          !updatedLettersFound.includes(letter) &&
          !currentGame.lettersFailed.includes(letter)
      );

      const currentTry = currentGame.currentTry + 1;

      let phrase = processPhraseToShow(plainPhrase, updatedLettersFound);
      const gameResult = checkEndGame(
        phrase,
        currentTry,
        currentGame.maximumTries
      );
      //comprueba si hay que sumar puntos
      let pointsToAdd = 0;
      if (gameResult === "win" && !currentGame.gameResultNotification) {
        pointsToAdd = pointsToAdd + 10;
      }
      const pointsFromLetters = newLettersFound.length * 0.5;
      pointsToAdd = pointsToAdd + pointsFromLetters;
      if (pointsToAdd > 0) await updatePoints(currentGame.userId, pointsToAdd);

      const game = await Game.findByIdAndUpdate(
        gameId,
        {
          phrase,
          $push: {
            triedWords: triedWord,
            lettersFailed: { $each: failedLetters },
          },

          currentTry,
          gameResult,
          lettersFound: updatedLettersFound,
          $inc: { earnedPoints: pointsFromLetters },
        },
        { new: true }
      );
      // Hacer una copia del objeto `game` y agregar `failedLetters`
      const gameDataResponse = {
        ...game.toObject(), // Convierte el documento Mongoose a un objeto plano
      };
      res.status(200).json(gameDataResponse);
    }
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

    const game = await Game.findOne({ userId, gameResult: "" });
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    const wordFound = await isValidWord(word);
    return res.status(200).json({ wordFound });
  } catch (err) {
    next(err);
  }
};
const getUserStats = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const games = await Game.find({ userId: userId });
    const wins = games.filter((game) => game.gameResult === "win").length;
    const losses = games.filter((game) => game.gameResult === "lose").length;
    const playing = games.filter((game) => game.gameResult === "").length;
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

const useClue = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { clue, wordToTry } = req.body;
    //Comprueba que la pista exista y sea válida
    if (
      !clue ||
      !["letter", "lettersRight", "actor", "director"].includes(clue)
    ) {
      return res.status(400).json({ message: "Pista inexistente o inválida" });
    }
    const game = await Game.findOne({ _id: gameId });
    if (!game) {
      return res.status(404).json({ message: "Partida no encontrada" });
    }
    const user = await User.findOne({ userId: game.userId });
    const userPoints = user.points;
    const clueUsability = checkClueUsability(userPoints, clue, game.clues);
    if (clueUsability === "used") {
      return res.status(400).json({ message: "Pista ya utilizada" });
    }
    if (clueUsability === "not enough points") {
      return res.status(400).json({ message: "Puntos insuficientes" });
    }
    let clueResult = null;
    switch (clue) {
      case "letter":
        clueResult = await performLetterClue(
          game.phraseNumber,
          game.lettersFound
        );
        if (clueResult.used) {
          await Game.findByIdAndUpdate(
            gameId,
            {
              lettersFound: clueResult.updatedLettersFound,
              phrase: clueResult.updatedPhrase,
              "clues.letter.status": false,
            },
            { new: true }
          );
        }
        break;

      case "lettersRight":
        clueResult = await performLettersRightClue(
          game.phraseNumber,
          wordToTry,
          game.lettersFound
        );
        if (clueResult.used) {
          await Game.findByIdAndUpdate(
            gameId,
            {
              "clues.lettersRight.status": false,
            },
            { new: true }
          );
        }
        break;

      case "actor":
        clueResult = await performMovieStaffClue(game.phraseNumber, "actor");
        if (clueResult.used){
        await Game.findByIdAndUpdate(
          gameId,
          {
            "clues.actor.status": false,
            movieActor: clueResult.actor,
          },
          { new: true }
        );}
        break;

      case "director":
        clueResult = await performMovieStaffClue(game.phraseNumber, "director");
        if (clueResult.used){
        await Game.findByIdAndUpdate(
          gameId,
          {
            "clues.director.status": false,
            movieDirector: clueResult.director,
          },
          { new: true }
        );}
        break;
    }
    // Actualiza los puntos del usuario solo si se ejecutó una pista válida
    if (clueResult.used) {
      await User.findByIdAndUpdate(
        user._id,
        {
          points: userPoints - game.clues[clue].price,
        },
        { new: true }
      );
      return res.status(200).json(clueResult);
    }

    return res.status(400).json({ message: "Error al procesar la pista" });
  } catch (err) {
    next(err);
  }
};

const checkClueUsability = (pointsOfUser, clueToCheck, cluesStatus) => {
  if (cluesStatus[clueToCheck].status === false) {
    return "used";
  }
  if (cluesStatus[clueToCheck].price > pointsOfUser) {
    return "not enough points";
  }
  return "ok";
};

const performLetterClue = async (NumberOfPhrase, gameLettersFound) => {
  const phraseOnGame = await Phrase.findOne({ number: NumberOfPhrase });
  const plainPhrase = removeAccents(phraseOnGame.quote);

  // Definimos un conjunto para almacenar las letras de la frase
  const undiscoveredPhraseLetters = new Set();

  // Iteramos sobre cada letra de la frase
  for (const letter of plainPhrase) {
    // Si la letra no está en gameLettersFound y es una letra válida (alfabeto)
    if (!gameLettersFound.includes(letter) && isLetter(letter)) {
      undiscoveredPhraseLetters.add(letter);
    }
  }

  // Convertimos el conjunto a un array
  const undiscoveredPhraseLettersArray = Array.from(undiscoveredPhraseLetters);
  // Si no hay letras por descubrir, retornamos null
  if (undiscoveredPhraseLettersArray.length === 0) {
    return null;
  }

  let chosenLetter;

  // Elegimos una letra al azar del array
  const randomIndex = Math.floor(
    Math.random() * undiscoveredPhraseLettersArray.length
  );
  chosenLetter = undiscoveredPhraseLettersArray[randomIndex];

  // Agregamos la letra seleccionada al array gameLettersFound
  gameLettersFound.push(chosenLetter);

  const hiddenPhrase = processPhraseToShow(plainPhrase, gameLettersFound);
  return {
    message: "Letra desvelada: ",
    updatedPhrase: hiddenPhrase,
    revealedLetter: chosenLetter,
    updatedLettersFound: gameLettersFound,
    used: true,
  };
};

const performLettersRightClue = async (
  NumberOfPhrase,
  wordToTry,
  gameLettersFound
) => {
  if (!isValidWord(wordToTry)) return { message: "Palabra no válida" };
  const phraseOnGame = await Phrase.findOne({ number: NumberOfPhrase });
  const plainPhrase = removeAccents(phraseOnGame.quote);

  const lettersInPhrase = checkLettersFromWord(
    wordToTry,
    plainPhrase,
    gameLettersFound
  );

  return {
    lettersRight: lettersInPhrase.length,
    message: "Letras comunes: ",
    used: true,
  };
};

const performMovieStaffClue = async (NumberOfPhrase, fieldToShow) => {
  const phraseOnGame = await Phrase.findOne({ number: NumberOfPhrase });
  if (fieldToShow === "director" && phraseOnGame.director)
    return {
      director: phraseOnGame.director,
      message: "Director: ",
      used: true,
    };
  else if (fieldToShow === "actor" && phraseOnGame.who_said_it.actor)
    return {
      actor: phraseOnGame.who_said_it.actor,
      message: "Actor: ",
      used: true,
    };
    else return null
};
module.exports = {
  startGame,
  tryWord,
  updateGame,
  getActiveGame,
  getUserStats,
  useClue,
};

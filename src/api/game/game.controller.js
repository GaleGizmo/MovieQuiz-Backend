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
const {isValidWord} = require("../../utils/isValidWord.js");


const startGame = async (req, res, next) => {
  try {
    const { userId, phraseToPlay } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "UserId es requerido." });
    }
    let currentPhraseToPlay = "";
    if (phraseToPlay) {
      currentPhraseToPlay = await Phrase.findOne({ number: phraseToPlay });
    } else {
      currentPhraseToPlay = await PhraseOfTheDay.findOne();
    }
    const maxTries = setMaximumTries(currentPhraseToPlay.quote);

    const existingGame = await Game.findOne({
      userId: userId,
      phraseNumber: currentPhraseToPlay.number,
    });
    if (existingGame) {
      return res.status(200).json(existingGame);
    } else {
      const plainPhrase = removeAccents(currentPhraseToPlay.quote);
      const hiddenPhrase = processPhraseToShow(plainPhrase, []);
      let game = new Game({
        userId: userId,
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
        gameStatus: "playing",
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

    if (triedWord && triedWord.length != 5) {
      return res
        .status(400)
        .json({ message: "La palabra debe tener 5 letras" });
    }
    const checkWord = await isValidWord(triedWord);
    if (!checkWord.wordIsValid) {
      
      return res.status(200).json({ deleteFromTried:triedWord, message: checkWord.message });
    }
    if (gameResultNotification) {
      const game = await Game.findByIdAndUpdate(
        gameId,
        {
          gameResultNotification,
        },
        { new: true }
      );
      const gameDataResponse = {
        ...game.toObject(), // Convierte el documento Mongoose a un objeto plano
      };
      gameDataResponse.newLetters = [];
      res.status(200).json(gameDataResponse);
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
      //comprueba si es fin de partida
      let phrase = processPhraseToShow(plainPhrase, updatedLettersFound);
      const gameStatus = checkEndGame(
        phrase,
        currentTry,
        currentGame.maximumTries
      );
      //comprueba si hay que sumar puntos
      let pointsToAdd = 0;
      if (gameStatus === "win" && !currentGame.gameResultNotification) {
        pointsToAdd = pointsToAdd + 20;
        //suma 10 puntos por cada intento sobrante
        pointsToAdd =
          pointsToAdd + (currentGame.maximumTries - currentTry) * 10;
      }
      const pointsFromLetters = newLettersFound.length;
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
          gameStatus,
          lettersFound: updatedLettersFound,
          $inc: { earnedPoints: pointsToAdd },
        },
        { new: true }
      );
      // Hacer una copia del objeto `game` y agregar `failedLetters`
      const gameDataResponse = {
        ...game.toObject(), // Convierte el documento Mongoose a un objeto plano
      };
      gameDataResponse.newLetters = newLettersFound;
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
      return res.status(404).json({ message: "Juego no encontrado" });
    }

    res.status(200).json(game);
  } catch (err) {
    next(err);
  }
};
const tryWord = async (req, res, next) => {
  try {
    const { userId, word } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "UserId es requerido." });
    }
    if (!word) {
      return res.status(400).json({ message: "No hay palabra para chequear." });
    }
    const game = await Game.findOne({ userId, gameStatus: "playing" });
    if (!game) {
      return res.status(404).json({ message: "Juego no encontrado" });
    }

    const checkWord = await isValidWord(word);
    return res.status(200).json(checkWord);
  } catch (err) {
    next(err);
  }
};
const getUserStats = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const games = await Game.find({ userId: userId });
    const wins = games.filter((game) => game.gameStatus === "win").length;
    const losses = games.filter((game) => game.gameStatus === "lose").length;
    const playing = games.filter(
      (game) => game.gameStatus === "playing"
    ).length;
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
    if (clue === "lettersRight" && !wordToTry) {
      return res.status(400).json({
        message: "Palabra no proporcionada para la pista lettersRight",
      });
    }

    const game = await Game.findOne({ _id: gameId });
    if (!game) {
      return res.status(404).json({ message: "Partida no encontrada" });
    }
    const user = await User.findById(game.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const userPoints = user.points;
    let clueResult = {};
    let updatedGameClues = null;
    const usabilityOfClue = checkClueUsability(userPoints, clue, game.clues);
    if (usabilityOfClue != "ok") {
      return res.status(200).json({ unusable: usabilityOfClue });
    }

    switch (clue) {
      case "letter":
        clueResult = await performLetterClue(
          game.phraseNumber,
          game.lettersFound
        );
        if (clueResult.used) {
          const updateData = {
            lettersFound: clueResult.updatedLettersFound,
            phrase: clueResult.updatedPhrase,
            "clues.letter.status": false,
            "clues.letter.value": clueResult.revealedLetter,
          };

          // Verificar si era la última letra para actualizar gameStatus
          if (clueResult.lastLetterRemaining) {
            updateData.gameStatus = "win";
          }

          const updatedGame = await Game.findByIdAndUpdate(gameId, updateData, {
            new: true,
          });
          updatedGameClues = updatedGame.clues;
        }
        break;

      case "lettersRight":
        clueResult = await performLettersRightClue(
          game.phraseNumber,
          wordToTry,
          game.lettersFound
        );
        if (clueResult.used) {
          const updatedGame = await Game.findByIdAndUpdate(
            gameId,
            {
              "clues.lettersRight.status": false,
              "clues.lettersRight.value.commons": clueResult.lettersRight,
              "clues.lettersRight.value.word": wordToTry,
            },
            { new: true }
          );
          updatedGameClues = updatedGame.clues;
        }
        break;

      case "actor":
        clueResult = await performMovieStaffClue(game.phraseNumber, "actor");
        if (clueResult.used) {
          const updatedGame = await Game.findByIdAndUpdate(
            gameId,
            {
              "clues.actor.status": false,
              "clues.actor.value": clueResult.actor,
            },
            { new: true }
          );
          updatedGameClues = updatedGame.clues;
        }
        break;

      case "director":
        clueResult = await performMovieStaffClue(game.phraseNumber, "director");
        if (clueResult.used) {
          const updatedGame = await Game.findByIdAndUpdate(
            gameId,
            {
              "clues.director.status": false,
              "clues.director.value": clueResult.director,
            },
            { new: true }
          );
          updatedGameClues = updatedGame.clues;
        }
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
      return res
        .status(200)
        .json({ clueResult: clueResult, updatedGameClues: updatedGameClues });
    }
    if (!clueResult.used && clueResult.message) {
      return res.status(200).json({ unusable: clueResult.message });
    }
    return res.status(400).json({ message: "Error al procesar la pista" });
  } catch (err) {
    next(err);
  }
};

const checkClueUsability = (pointsOfUser, clueToCheck, cluesStatus) => {
  if (cluesStatus[clueToCheck].status === false) {
    return "Pista ya usada";
  }
  if (cluesStatus[clueToCheck].price > pointsOfUser) {
    return "Puntos insuficientes";
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
  let lastLetterRemaining = false;
  if (undiscoveredPhraseLettersArray.length === 1) {
    lastLetterRemaining = true;
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
    message: "Letra desvelada: " + chosenLetter,
    updatedPhrase: hiddenPhrase,
    revealedLetter: chosenLetter,
    updatedLettersFound: gameLettersFound,
    lastLetterRemaining: lastLetterRemaining,
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
    message: "Hay " + lettersInPhrase.length + " letras comunes: ",
    used: true,
  };
};

const performMovieStaffClue = async (NumberOfPhrase, fieldToShow) => {
  const phraseOnGame = await Phrase.findOne({ number: NumberOfPhrase });
  if (fieldToShow === "director" && phraseOnGame.director)
    return {
      director: phraseOnGame.director,
      message: "Dirigida por: " + phraseOnGame.director,
      used: true,
    };
  else if (fieldToShow === "actor" && phraseOnGame.who_said_it.actor)
    return {
      actor: phraseOnGame.who_said_it.actor,
      message: "Intérprete: " + phraseOnGame.who_said_it.actor,
      used: true,
    };
  else return null;
};
module.exports = {
  startGame,
  tryWord,
  updateGame,
  getActiveGame,
  getUserStats,
  useClue,
};

/* eslint-disable no-undef */
const Game = require("./game.model.js");
const PhraseOfTheDay = require("../phrases/phraseoftheday.model.js");
const setMaximumTries = require("../../utils/setMaximumTries.js");
const Phrase = require("../phrases/phrases.model.js");
const removeAccents = require("../../utils/removeAccents.js");
const processPhraseToShow = require("../../utils/processPhraseToShow.js");
const checkLettersFromWord = require("../../utils/checkLettersFromWord.js");
const checkEndGame = require("../../utils/checkEndGame.js");
const User = require("../users/user.model.js");
const isLetter = require("../../utils/isLetter.js");
const { isValidWord } = require("../../utils/isValidWord.js");
const { ObjectId } = require("mongoose").Types;
const { updatePoints } = require("../../utils/updatePoints.js");

const startGame = async (req, res, next) => {
  try {
    const { userId, phraseToPlay } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "UserId es requerido." });
    }
    let currentPhraseToPlay = "";
    let isDailyPhrase = true;
    if (phraseToPlay) {
      currentPhraseToPlay = await Phrase.findOne({ number: phraseToPlay });
      isDailyPhrase = false;
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
      const cluesPrices = await setCluesPrice(userId, phraseToPlay);
      let game = new Game({
        userId: userId,
        phrase: hiddenPhrase,
        phraseNumber: currentPhraseToPlay.number,
        isDailyPhrase: isDailyPhrase,
        maximumTries: maxTries,
        movieDirector: "",
        movieActor: "",
        triedWords: [],
        lettersFound: [],
        lettersFailed: [],
        gameResultNotification: false,
        currentTry: 0,
        gameStatus: "playing",
        clues: {
          actor: {
            price: cluesPrices.actor,
            status: true,
          },
          director: {
            price: cluesPrices.director,
            status: true,
          },
          letter: {
            price: cluesPrices.letter,
            status: true,
          },
          lettersRight: {
            price: cluesPrices.lettersRight,
            status: true,
          },
        },
      });

      await game.save();

      res.status(201).json(game);
    }
  } catch (err) {
    next(err);
  }
};

const setCluesPrice = async (userId, phraseToStartNumber) => {
  const cluesPrices = { actor: 5, director: 5, letter: 20, lettersRight: 10 };
  //Si es frase anterior al cambio de precio, mantén precio anterior
  if (phraseToStartNumber < 96) {
    cluesPrices.actor = 10;
    cluesPrices.director = 10;
    cluesPrices.letter = 30;
    cluesPrices.lettersRight = 20;
  }
  const todayDate = new Date();

  //logica para calcular los precios de las pistas
  //El dia de navidad pistas gratis
  if (
    todayDate.getDate() === 6 &&
    todayDate.getMonth() === 0 &&
    todayDate.getHours()>=7 &&
    !phraseToStartNumber
  ) {
    cluesPrices.actor = 0;
    cluesPrices.director = 0;
    cluesPrices.letter = 0;
    cluesPrices.lettersRight = 0;
  } else {
    //comprueba si tiene racha de partidas/partidas ganadas
    const user = await User.findOne({ _id: userId });

    if (user.hasPlayingStrikeBonus) {
      cluesPrices.actor = 0;
      cluesPrices.director = 0;
    }
    if (user.hasWinningStrikeBonus) {
      cluesPrices.letter = 0;
      cluesPrices.lettersRight = 0;
    }
  }

  console.log("Precios pistas: ", cluesPrices);
  return cluesPrices;
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

    if (!gameData) {
      return res.status(400).json({ message: "Datos de juego son requeridos" });
    }
    let { triedWord, gameResultNotification, hasBoughtDetails } = gameData;

    if (triedWord && triedWord.length != 5) {
      return res
        .status(400)
        .json({ message: "La palabra debe tener 5 letras" });
    }
    if (triedWord) {
      const checkWord = await isValidWord(triedWord);
      if (!checkWord.wordIsValid) {
        return res
          .status(200)
          .json({ deleteFromTried: triedWord, message: checkWord.message });
      }
    }
    //Comprueba si hay que actualizar gameResultNotification o hasBoughtDetails
    const updateField = gameResultNotification
      ? { gameResultNotification }
      : hasBoughtDetails
      ? { hasBoughtDetails }
      : null;

    if (updateField) {
      const game = await Game.findByIdAndUpdate(
        gameId,

        updateField,
        { new: true }
      );
      const gameDataResponse = {
        ...game.toObject(),
        newLetters: [], // Convierte el documento Mongoose a un objeto plano
      };

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
    if (game.phraseNumber === 87) {
      return res.status(200).json({ unusable: "Pistas no disponibles" });
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

const updateGameUserId = async (req, res, next) => {
  try {
    const { oldUserId, newUserId } = req.body;

    // Validación de entrada
    if (!oldUserId || !newUserId) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    if (!ObjectId.isValid(oldUserId) || !ObjectId.isValid(newUserId)) {
      return res.status(400).json({ message: "IDs inválidos" });
    }

    // Actualización masiva
    const result = await Game.updateMany(
      { userId: oldUserId },
      { $set: { userId: newUserId } }
    );

    const oldUser = await User.findById(oldUserId);
    if (!oldUser) {
      throw new Error("El usuario antiguo no existe");
    }
    const userData = oldUser.toObject(); // Convertir el documento a un objeto plano
    delete userData._id; // Eliminar el campo _id para evitar conflictos

    // Preparar los datos para combinar los arrays específicos
    const {
      points = 0,
      phrasesWon = [],
      phrasesLost = [],
      ...otherFields
    } = userData;

    // Actualizar newUser combinando arrays y sumando puntos
    await User.findByIdAndUpdate(
      newUserId,
      {
        $set: otherFields, // Actualizar otros campos (excluyendo _id, points, phrasesWon, phrasesLost)
        $inc: { points }, // Sumar los puntos
        $addToSet: {
          phrasesWon: { $each: phrasesWon }, // Combinar sin duplicados
          phrasesLost: { $each: phrasesLost }, // Combinar sin duplicados
        },
      },
      { new: true } // Retornar el documento actualizado
    );

    // MArcar el usuario antiguo como deprecado
    await User.findByIdAndUpdate(
      oldUserId,
      { $set: { deprecatedUser: true } },
      { new: true, strict: false }
    );

    console.log(`${result.modifiedCount} documentos actualizados`);
    return res.status(200).json({
      message: "Usuario actualizado correctamente",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Error al actualizar:", err);
    next(err);
  }
};

const checkGameForStrike = async (gameId) => {
  const checkResult = { playingStrike: false, winningStrike: false };
  try {
    const game = await Game.findById(gameId);
    if (!game) {
      throw new Error("Partida no encontrada");
    }
    if (game.isDailyPhrase) {
      checkResult.playingStrike = true;
    }
    if (game.gameStatus === "win") {
      checkResult.winningStrike = true;
    }
    return checkResult;
  } catch (err) {
    throw new Error("Error al verificar la partida: " + err.message);
  }
};

module.exports = {
  startGame,
  tryWord,
  updateGame,
  getActiveGame,
  getUserStats,
  useClue,
  updateGameUserId,
  checkGameForStrike,
};

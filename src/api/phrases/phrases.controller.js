/* eslint-disable no-undef */
const Phrase = require("./phrases.model.js");

const PhraseOfTheDay = require("./phraseoftheday.model.js");
const Game = require("../game/game.model.js");

// coge una frase al azar de las que no han sido usadas, la copia a FraseDelDia y la marca como usada
const getPhrase = async () => {
  try {
    // Buscar todas las frases que no han sido usadas
    const unusedPhrases = await Phrase.find({ used: false });
    if (unusedPhrases.length === 0) {
      console.error("No hay citas disponibles");
      return;
    }
    //cuenta las frases que han sido usadas
    let howManyUsed = await Phrase.countDocuments({ used: true });
    //elimina los juegos que no se han llegado a empezar
    await deleteUnstartedGames(howManyUsed);


    howManyUsed++;
    //Elige una frase al azar entre las no usadas
    let isNotValidPhrase = true;
    let randomPhrase = null;
    let randomIndex = 0
    //comprueba que no se elijan dos frases seguidas de la misma película
    while (isNotValidPhrase) {
       randomIndex = Math.floor(Math.random() * unusedPhrases.length);
       randomPhrase = unusedPhrases[randomIndex];
      const previousPhrase = await PhraseOfTheDay.findOne();
      if (previousPhrase.movie!=randomPhrase.movie) {
        isNotValidPhrase = false;
      } else {console.log("Frase de la misma película, eligiendo otra")}
    }
    // const randomIndex = Math.floor(Math.random() * unusedPhrases.length);
    // let randomPhrase = unusedPhrases[randomIndex];

    // Marca la frase elegida como usada y numérala en la base de datos
    await Phrase.updateOne(
      { _id: randomPhrase._id },
      { $set: { used: true, number: howManyUsed } }
    );
    //los juegos del día anterior que se hayan empezado y no estén terminados se consideran perdidos
    await Game.updateMany(
      {
        phraseNumber: { $lt: howManyUsed },
        gameStatus: "playing",
        triedWords: { $exists: true, $not: { $size: 0 } },
      },
      { $set: { gameStatus: "lose" } }
    );
    
    

    randomPhrase.number = howManyUsed;

    randomPhrase = randomPhrase.toObject();

    // Guardar randomPhrase en PhraseOfTheDay tras borrar la anterior
    await PhraseOfTheDay.deleteMany({});
    const phraseOfTheDay = new PhraseOfTheDay({
      ...randomPhrase,
      _id: randomPhrase._id,
    });
    await phraseOfTheDay.save();
  } catch (err) {
    console.error("Error al obtener la frase del día:", err);
  }
};

const deleteUnstartedGames = async (previousPhraseNumber) => {
  try {
   const result= await Game.deleteMany({
      gameStatus: "playing",
      currentTry: 0,
      phraseNumber: { $lte: previousPhraseNumber },
    });
    console.log("Juegos sin empezar borrados:", result.deletedCount);
  } catch (err) {
    console.error("Error al borrar los juegos sin empezar:", err);
  }
};
const getPhraseOfTheDay = async (req, res, next) => {
  try {
    const phraseOfTheDay = await PhraseOfTheDay.findOne();
    if (phraseOfTheDay === null) {
      return res.status(404).json({ message: "No hay frase del día" });
    }
    return res.status(200).json(phraseOfTheDay);
  } catch (err) {
    return next(err);
  }
};

const getPhraseOfTheDayNumber = async (req, res, next) => {
  try {
    const phraseOfTheDay = await PhraseOfTheDay.findOne();
    if (phraseOfTheDay === null) {
      return res.status(404).json({ message: "No hay frase del día" });
    }
    return res.status(200).json(phraseOfTheDay.number);
  } catch (err) {
    return next(err);
  }
};

const addPhrase = async (req, res, next) => {
  try {
    // Log para ver qué datos llegan al backend
    console.log("Datos recibidos en req.body:", req.body);

    // Asegúrate de que req.body.phraseData contiene todos los campos requeridos
    const { phraseData } = req.body;

    if (!phraseData) {
      return res
        .status(400)
        .json({ error: "Los datos de la frase son requeridos." });
    }

    // Validación manual de campos requeridos
    const requiredFields = [
      "quote",
      "movie",
      "year",
      "director",
      "who_said_it",
      "poster",
    ];
    for (let field of requiredFields) {
      if (!phraseData[field]) {
        return res
          .status(400)
          .json({ error: `El campo ${field} es requerido.` });
      }
    }

    // Validación de subdocumentos: who_said_it
    const { who_said_it } = phraseData;
    if (
      !who_said_it ||
      !who_said_it.actor ||
      !who_said_it.character ||
      !who_said_it.context
    ) {
      return res
        .status(400)
        .json({ error: "Campos dentro de who_said_it son requeridos." });
    }

    // Crea una nueva frase con los datos validados
    const phrase = new Phrase(phraseData);

    // Intenta guardar la frase en la base de datos
    await phrase.save();

    return res.status(201).json(phrase);
  } catch (err) {
    // Loguear el error con más detalles para depurar mejor
    console.error("Error al añadir la frase:", err);
    return next(err);
  }
};

const getPhraseByNumber = async (req, res, next) => {
  try {
    const { phraseNumber } = req.params;
    let phrase = null;

    //Si se pasa un número de frase=0, carga la frase del día
    if (phraseNumber === "0") {
      phrase = await Phrase.findOne().sort({ number: -1 });
    }
    // Buscar la frase con el número proporcionado
    else {
      phrase = await Phrase.findOne({ number: phraseNumber });
    }
    if (!phrase) {
      return res.status(404).json({ message: "No se encuentra la frase" });
    }
    return res.status(200).json(phrase);
  } catch (err) {
    return next(err);
  }
};

const getOldPhrasesStatus = async (req, res, next) => {
  const { playerId } = req.params;
  try {
    const latestPhrase = await PhraseOfTheDay.findOne();

    if (!latestPhrase) {
      return res
        .status(200)
        .json({ message: "No se encontraron citas anteriores" });
    }
    const maxNumber = latestPhrase.number; // Máximo número de frase
    const phraseNumbers = Array.from({ length: maxNumber }, (_, i) => i + 1);

    // Consulta todos los juegos de ese jugador con las frases obtenidas
    const games = await Game.find({
      phraseNumber: { $in: phraseNumbers },
      userId: playerId,
    });

    // Creamos un objeto con los resultados de las frases jugadas
    const gameStatusMap = {};
    games.forEach((game) => {
      gameStatusMap[game.phraseNumber] = game.gameStatus;
    });

    // Construimos el objeto result, asignando "np" a las frases no jugadas
    const result = {};
    let counts = { win: 0, lose: 0, playing: 0, np: 0 };
    phraseNumbers.forEach((number) => {
      const status = gameStatusMap[number] || "np";
      result[number] = status;
      counts[status]++;
    });
    const totalPlayed = counts.win + counts.lose;
    const percentages = {
      win:
        totalPlayed > 0
          ? Math.round((counts.win / totalPlayed) * 100) + "%"
          : "0%",
      lose:
        totalPlayed > 0
          ? Math.round((counts.lose / totalPlayed) * 100) + "%"
          : "0%",
    };
    return res.status(200).json({
      result, // Estados de las frases
      percentages, // Porcentajes de win y lose
      playing: counts.playing,
      np: counts.np,
    });
  } catch (err) {
    return next(err);
  }
};

// getPhrase()

module.exports = {
  getPhrase,
  getPhraseOfTheDay,
  addPhrase,
  getPhraseByNumber,
  getOldPhrasesStatus,
  getPhraseOfTheDayNumber,
};

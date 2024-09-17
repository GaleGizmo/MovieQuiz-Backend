/* eslint-disable no-undef */
const Phrase = require("./phrases.model.js");

const PhraseOfTheDay = require("./phraseoftheday.model.js");
const Game = require("../game/game.model.js");

// coge una frase de las que no han sido usadas, la copia a FraseDelDia y la marca como usada
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
    howManyUsed++;
    //Elige una frase al azar entre las no usadas
    const randomIndex = Math.floor(Math.random() * unusedPhrases.length);
    let randomPhrase = unusedPhrases[randomIndex];

    // Marca la frase elegida como usada y numérala en la base de datos
    await Phrase.updateOne(
      { _id: randomPhrase._id },
      { $set: { used: true, number: howManyUsed } }
    );
    //los juegos del día anterior que no estén terminados se consideran perdidos
    await Game.updateMany(
      { phraseNumber: { $lt: howManyUsed }, gameStatus: "playing" },
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
      return res.status(400).json({ error: "Los datos de la frase son requeridos." });
    }

    // Validación manual de campos requeridos
    const requiredFields = ['quote', 'movie', 'year', 'director', 'who_said_it', 'poster'];
    for (let field of requiredFields) {
      if (!phraseData[field]) {
        return res.status(400).json({ error: `El campo ${field} es requerido.` });
      }
    }

    // Validación de subdocumentos: who_said_it
    const { who_said_it } = phraseData;
    if (!who_said_it || !who_said_it.actor || !who_said_it.character || !who_said_it.context) {
      return res.status(400).json({ error: "Campos dentro de who_said_it son requeridos." });
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
    const oldPhrases = await Phrase.find({ used: true })
      .select("number")
      .sort("number");
    oldPhrases.pop()
    if (oldPhrases.length === 0) {
      return res
        .status(200)
        .json({ message: "No se encontraron citas anteriores" });
    }
    const phraseNumbers = oldPhrases.map((phrase) => phrase.number);
    const result = {};
    for (const number of phraseNumbers) {
      const game = await Game.findOne({
        phraseNumber: number,
        userId: playerId,
      });

      if (!game) {
        result[number] = "np";
      } else {
        result[number] = game.gameStatus;
      }
    }

    return res.status(200).json(result);
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

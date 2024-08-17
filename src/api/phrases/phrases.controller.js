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
      console.log("No hay citas disponibles");
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
    await Game.updateMany({phraseNumber:{ $lt: howManyUsed }, gameResult:""},{$set:{gameResult:"lose"}})
   
    randomPhrase.number = howManyUsed;
    // Eliminar el campo _id de la frase del día
    randomPhrase = randomPhrase.toObject();
    // delete randomPhrase._id;

    // Guardar randomPhrase en PhraseOfTheDay tras borrar la anterior
    await PhraseOfTheDay.deleteMany({});
    const phraseOfTheDay = new PhraseOfTheDay({
      ...randomPhrase,
      _id: randomPhrase._id,
    });
    await phraseOfTheDay.save();
    console.log("Frase del día:", randomPhrase);
  } catch (err) {
    console.error("Error al obtener la frase del día:", err);
  }
};
const getPhraseOfTheDay = async (req, res, next) => {
  try {
    const phraseOfTheDay = await Phrase.findOne().sort({ number: -1 });
    if (phraseOfTheDay === null) {
      return res.status(404).json({ message: "No hay frase del día" });
    }
    return res.status(200).json(phraseOfTheDay);
  } catch (err) {
    return next(err);
  }
};

const addPhrase = async (req, res, next) => {
  try {
    const phrase = new Phrase(req.body.phraseData);
    await phrase.save();
    return res.status(201).json(phrase);
  } catch (err) {
    return next(err);
  }
};

const getPhraseByNumber = async (req, res, next) => {
  try {
    const { phraseNumber } = req.params;
    let phrase=null
    console.log("buscar frase con number", phraseNumber);
    //Si se pasa un número de frase=0, carga la frase del día
    if (phraseNumber === "0") {
       phrase = await Phrase.findOne().sort({ number: -1 });
    } else
    // Buscar la frase con el número proporcionado
    { phrase = await Phrase.findOne({ number: phraseNumber });}
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
        if (game.gameResult === "") {
          result[number] = "uf";
        } else {
          result[number] = game.gameResult;
        }
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

};

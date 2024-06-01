/* eslint-disable no-undef */
const Phrase = require("./phrases.model.js");
const PhraseOfTheDay = require("./phraseoftheday.model.js");

// coge una frase de las que no han sido usadas, la copia a FraseDelDia y la marca como usada
const getPhrase = async (req, res, next) => {
  try {
    // Buscar todas las frases que no han sido usadas
    const unusedPhrases = await Phrase.find({ used: false });
    if (unusedPhrases.length === 0) {
      return res.status(404).json({ message: "No hay citas disponibles" });
    }
    //cuenta las frases que han sido usadas
    let howManyUsed= await Phrase.countDocuments({ used: true });
    howManyUsed++;
    //Elige una frase al azar entre las no usadas
    const randomIndex = Math.floor(Math.random() * unusedPhrases.length);
    let randomPhrase = unusedPhrases[randomIndex];

    // Marca la frase elegida como usada y numérala en la base de datos
    await Phrase.updateOne({ _id: randomPhrase._id }, { $set: { used: true, number: howManyUsed }});

    randomPhrase.number = howManyUsed;
    // Eliminar el campo _id de la frase del día
    randomPhrase = randomPhrase.toObject();
    // delete randomPhrase._id;
    
    // Guardar randomPhrase en PhraseOfTheDay tras borrar la anterior
    await PhraseOfTheDay.deleteMany({});
    const phraseOfTheDay = new PhraseOfTheDay({ ...randomPhrase, _id: randomPhrase._id });
    await phraseOfTheDay.save();
    return res.status(200).json(randomPhrase);
  } catch (err) {
    return next(err);
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


module.exports = { getPhrase, getPhraseOfTheDay};

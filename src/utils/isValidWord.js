/* eslint-disable no-undef */
const fs = require("fs").promises; // Utiliza fs.promises para usar Promises en lugar de callbacks
const path = require("path");

 async function isValidWord(wordToCheck) {
  try {
    const filePath = path.join(
      __dirname,
      "../../assets",
      `palabrasCon${wordToCheck.charAt(0)}.json`
    );

    // Lee el archivo de manera asíncrona
    const data = await fs.readFile(filePath, "utf8");

    const jsonData = JSON.parse(data);
    return jsonData.palabras.includes(wordToCheck);

  } catch (err) {
    // Maneja el error y retorna false si ocurre un problema
    console.error("Error leyendo el archivo de palabras:", err);
    return false;
  }
}
module.exports = isValidWord;

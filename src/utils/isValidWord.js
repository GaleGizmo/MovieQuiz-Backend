/* eslint-disable no-undef */

const fs = require("fs").promises;
const path = require("path");
const getRandomInvalidWordMessage = require("./randomInvalidWordMessages");

// Almacenará todas las palabras en memoria, agrupadas por letra
const wordsByLetter = {};

// Función para cargar las palabras en memoria al iniciar el servidor
async function loadWordsIntoMemory() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZÑ".split(""); // Letras del alfabeto y ñ

  for (const letter of letters) {
    const filePath = path.join(__dirname, "../../assets", `palabrasCon${letter}.json`);
    try {
      const data = await fs.readFile(filePath, "utf8");
      const jsonData = JSON.parse(data);
      // Guardamos las palabras en memoria (Set para búsquedas rápidas)
      wordsByLetter[letter] = new Set(jsonData.palabras);
      console.log(`Palabras con ${letter} cargadas correctamente.`);
    } catch (err) {
      console.error(`Error cargando palabras con ${letter}:`, err);
    }
  }
}

// Función que verifica si una palabra es válida
function isValidWord(wordToCheck) {
  const normalizedWord = wordToCheck.trim(); 
  const firstLetter = normalizedWord.charAt(0); 

  // Verificamos si la palabra está en la memoria
  if (wordsByLetter[firstLetter] && wordsByLetter[firstLetter].has(normalizedWord)) {
    return {wordIsValid:true};
  } else {
    const message = getRandomInvalidWordMessage();
    return {wordIsValid:false, message:message};
  }

  // Si no existe, retornamos false
 
}

module.exports = { isValidWord, loadWordsIntoMemory };



/* eslint-disable no-undef */
function setMaximumTries(text) {
  let maximumTries = 0;

  let lessFrequentConsonants = "qhfzjñxkw";

  // Convertimos el texto a minúsculas para hacer la comparación de manera uniforme
  text = text.toLowerCase();

  // Definimos un conjunto para almacenar las consonantes encontradas
  const consonants = new Set();

  // Definimos una expresión regular que coincida con todas las letras del alfabeto excepto las vocales
  const regex = /[bcdfghjklmnñpqrstvwxyz]/g;

  // Buscamos todas las consonantes en el texto y las agregamos al conjunto
  let match;
  while ((match = regex.exec(text)) !== null) {
    consonants.add(match[0]);
  }
  maximumTries +=Math.ceil(consonants.size/3); 
  let countUnfrequentConsonants = 0;
  for (let letter of lessFrequentConsonants) {
    if (consonants.has(letter)) {
      countUnfrequentConsonants++;
    }
  }
  
  //Si no hay letras infrecuentes devuelve el número de intentos tal cual,
  // y si las hay añade un intento por cada tres letras infrecuentes
  if (countUnfrequentConsonants === 0) {
    return maximumTries;
  } else {
    maximumTries += Math.floor(countUnfrequentConsonants / 3);
  }
 
  //Añade un intento de cortesía
  maximumTries++;
  //Limita el máximo y mínimo de intentos
  maximumTries = Math.min(Math.max(maximumTries, 3), 7);


  // Devolvemos el número de intentos
  return maximumTries;
}
module.exports = setMaximumTries;

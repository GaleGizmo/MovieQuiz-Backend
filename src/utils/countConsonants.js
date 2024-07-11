/* eslint-disable no-undef */
function countDistinctConsonants(text) {
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

    // Devolvemos el número de consonantes distintas encontradas
    return consonants.size;
}
module.exports= countDistinctConsonants;
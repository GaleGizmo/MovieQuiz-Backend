/* eslint-disable no-undef */
function removeAccents(str) {
    const accents = {
      'á': 'a',
      'é': 'e',
      'í': 'i',
      'ó': 'o',
      'ú': 'u',
      'Á': 'A',
      'É': 'E',
      'Í': 'I',
      'Ó': 'O',
      'Ú': 'U'
    };
   let strToShow=(str.split('').map(char => accents[char] || char).join(''))
    return strToShow.toUpperCase();
  }
  
  module.exports= removeAccents
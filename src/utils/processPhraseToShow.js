/* eslint-disable no-undef */

const isLetter = require("./isLetter");



function processPhraseToShow (phrase, lettersToCheck) {
    
    return phrase
      .split("")
      .map((char) => {
        if (isLetter(char) && !lettersToCheck.includes(char)) {
          return "_";
        }
        return char;
      })
      .join("");
  }

  module.exports=processPhraseToShow;
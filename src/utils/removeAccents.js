/* eslint-disable no-undef */

const { LETTERS_EQUIVALENTS } = require("./constants");

function removeAccents(str) {
  const accents = LETTERS_EQUIVALENTS;

  let strToShow = str
    .split("")
    .map((char) => accents[char] || char)
    .join("");
  return strToShow.toUpperCase();
}

module.exports = removeAccents;

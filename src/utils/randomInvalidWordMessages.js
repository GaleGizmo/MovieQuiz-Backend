/* eslint-disable no-undef */
const { INVALID_WORD_MESSAGES } = require("./constants");

const getRandomInvalidWordMessage = () => {
    const randomIndex = Math.floor(Math.random() * INVALID_WORD_MESSAGES.length);
    return INVALID_WORD_MESSAGES[randomIndex];
  };
module.exports= getRandomInvalidWordMessage;
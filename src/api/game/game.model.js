/* eslint-disable no-undef */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const gameSchema = new Schema({
    userId: String,
    phrase: String,
    phraseNumber: Number,
    maximumTries: Number,
    triedWords: [String],
    lettersFound: [String],
   
    currentTry: Number,
    isGameOver: String,
    
    },
    {
        timestamps: true,
        collection: "game",
      }
);
const Game = mongoose.model("game", gameSchema);
module.exports = Game;
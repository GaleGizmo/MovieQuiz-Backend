/* eslint-disable no-undef */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const gameSchema = new Schema({
    userId: String,
    phrase: String,
    maximumTries: Number,
    triedWords: [String],
    currentTry: Number,
    isGameOver: Boolean,
    isWin: Boolean,
    },
    {
        timestamps: true,
        collection: "game",
      }
);
const Game = mongoose.model("game", gameSchema);
module.exports = Game;
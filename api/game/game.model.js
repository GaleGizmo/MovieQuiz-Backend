/* eslint-disable no-undef */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const gameSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    phrase: String,
    maximumTries: Number,
    triedWords: [String],
    currentTry: Number,
    isGameOver: Boolean,
    isWin: Boolean,
    },
);
const Game = mongoose.model("Game", gameSchema);
module.exports = Game;
/* eslint-disable no-undef */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const gameSchema = new Schema(
  {
    userId: String,
    phrase: String,
    phraseNumber: Number,
    maximumTries: Number,
    triedWords: [String],
    lettersFound: [String],
    lettersFailed: [String],
    earnedPoints: Number,
    clues: {
      actor: {
        status: { type: Boolean, default: true },
        price: { type: Number, default: 10 },
        value: { type: String },
      },
      director: {
        status: { type: Boolean, default: true },
        price: { type: Number, default: 10 },
        value: { type: String },
      },
      letter: {
        status: { type: Boolean, default: true },
        price: { type: Number, default: 30 },
        value: { type: String },
      },
      lettersRight: {
        status: { type: Boolean, default: true },
        price: { type: Number, default: 20 },
        value: {
          commons: { type: Number },
          word: { type: String },
        },
      },
    },

    gameResultNotification: { type: Boolean, default: false },
    hasBoughtDetails: { type: Boolean, default: false },
    currentTry: { type: Number, default: 0 },
    gameStatus: {type: String, default:"playing"}
  },
  {
    timestamps: true,
    collection: "game",
  }
);
const Game = mongoose.model("game", gameSchema);
module.exports = Game;

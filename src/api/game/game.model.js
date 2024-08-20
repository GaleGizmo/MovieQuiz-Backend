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
    clues:{
      actor:{type:Boolean,default:true},
      director:{type:Boolean,default:true},
      letter:{type:Boolean,default:true},
      lettersRight:{type:Boolean,default:true}
    },
    gameResultNotification: { type: Boolean, default: false },
    currentTry: Number,
    gameResult: String,
  },
  {
    timestamps: true,
    collection: "game",
  }
);
const Game = mongoose.model("game", gameSchema);
module.exports = Game;

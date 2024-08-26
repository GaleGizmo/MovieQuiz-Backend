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
      actor:{status:{type:Boolean,default:true}, price:{type:Number, default:15}},
      director:{status:{type:Boolean,default:true}, price:{type:Number, default:15}},
      letter:{status:{type:Boolean,default:true}, price:{type:Number, default:25}},
      lettersRight:{status:{type:Boolean,default:true}, price:{type:Number, default:25}}
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

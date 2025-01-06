/* eslint-disable no-undef */
const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
   
    points: { type: Number, default: 0, min: [0, "Points cannot be negative"] },
    ranking: { type: Number, default: null },
    rankingTrend: {type:String, default:""},
    email: { type: String, required: false, unique: true },
    dontShowInstructions:{type: Boolean, default:false},
    phrasesWon: [{type: Number}],
    phrasesLost: [{type: Number}],
    playingStrike: {type: Number, default: 0},
    winningStrike: {type: Number, default: 0},
    hasPlayingStrikeBonus: {type: Boolean, default: false},
    hasWinningStrikeBonus: {type: Boolean, default: false},
   
  },

  {
    timestamps: true,
    collection: "user",
  }
);

const User = mongoose.model("user", userSchema);
module.exports = User;

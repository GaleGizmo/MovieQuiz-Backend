/* eslint-disable no-undef */
const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
   
    points: { type: Number, default: 0, min: [0, "Points cannot be negative"] },
    email: { type: String, required: false, unique: true },
    dontShowInstructions:{type: Boolean, default:false},
    phrasesWon: [{type: Number}],
    phrasesLost: [{type: Number}],
  },

  {
    timestamps: true,
    collection: "user",
  }
);

const User = mongoose.model("user", userSchema);
module.exports = User;

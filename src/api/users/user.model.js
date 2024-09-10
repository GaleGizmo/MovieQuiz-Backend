/* eslint-disable no-undef */
const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
   
    points: { type: Number, default: 0, min: [0, "Points cannot be negative"] },
    email: { type: String, required: false, unique: true },
    dontShowInstructions:{type: Boolean, default:false},
    phrasesPlayed: [{ type: mongoose.Schema.Types.ObjectId, ref: "phrases" }],
    phrasesCorrect: [{ type: mongoose.Schema.Types.ObjectId, ref: "phrases" }],
  },

  {
    timestamps: true,
    collection: "user",
  }
);

const User = mongoose.model("user", userSchema);
module.exports = User;

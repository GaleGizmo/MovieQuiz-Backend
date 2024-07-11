/* eslint-disable no-undef */
const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
   
    userId: { type: String, required: true, unique: true },
   
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
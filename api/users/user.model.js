/* eslint-disable no-undef */
const mongoose = require("mongoose");

const usuarioSchema = mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    username: { type: String, required: true, unique: true },
    role: { type: Number, required: true, unique: false, enum: [0, 1, 2] },
    phrasesPlayed: [{ type: mongoose.Schema.Types.ObjectId, ref: "phrases" }],
    phrasesCorrect: [{ type: mongoose.Schema.Types.ObjectId, ref: "phrases" }],
  },
  
  {
    timestamps: true,
    collection: "usuario",
  }
);

const User = mongoose.model("usuario", usuarioSchema);
module.exports = User;
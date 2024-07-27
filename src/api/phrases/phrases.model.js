/* eslint-disable no-undef */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const phraseSchema = new Schema(
  {
    number: {
      type: Number,
      required: true,
      default: 0,
    },
    quote: {
      type: String,
      required: true,
    },
    movie: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    director: {
      type: String,
      required: true,
    },
    original: {
      type: String,
      required: false,
    },
    who_said_it: {
      actor: {
        type: String,
        required: true,
      },
      character: {
        type: String,
        required: true,
      },
      context: {
        type: String,
        required: true,
      },
    },
    poster: {
      type: String,
      required: true,
    },
    used: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "phrases",
  }
);

const Phrase = mongoose.model("phrases", phraseSchema);

module.exports = Phrase;

/* eslint-disable no-undef */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const phraseOfTheDaySchema = new Schema(
  {
    number: {
      type: Number,
      required: true,
    },
    quote: {
      type: String,
      required: true,
    },
    movie: {
      type: String,
      required: true,
    },
    director: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
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
    
  },
  {
    timestamps: true,
    collection: "phraseoftheday",
  }
);

const PhraseOfTheDay = mongoose.model("phraseoftheday", phraseOfTheDaySchema);

module.exports = PhraseOfTheDay;

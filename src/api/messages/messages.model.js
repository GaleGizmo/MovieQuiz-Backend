/* eslint-disable no-undef */
const mongoose = require("mongoose");

const messagesSchema = mongoose.Schema(
  {
   
    name: {type: String, required: false, unique: false },
    email: { type: String, required: false, unique: false },
    type: { type: String, required: true, unique: false, enum: ["error", "suggestion", "question", "other"] },
    
    content: { type: String, required: false, unique: false },
    newMessage: { type: Boolean, required: true, default: true },
  },

  {
    timestamps: true,
    collection: "messages",
  }
);

const Messages = mongoose.model("messages", messagesSchema);
module.exports = Messages;

/* eslint-disable no-undef */
const mongoose = require("mongoose");

const DB_ACCESS = process.env.DB_URL;

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    const db = await mongoose.connect(DB_ACCESS);
    const { host } = db.connection;
    console.log("conexión exitosa en el host:" + host);
  } catch (error) {
    console.log("no se puede conectar a la base de datos, melón ->>", error);
  }
};

module.exports = { connectDB };
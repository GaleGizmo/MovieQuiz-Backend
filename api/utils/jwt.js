/* eslint-disable no-undef */
const jwt = require("jsonwebtoken");

const generateSign = (id, username, role) => {
  return jwt.sign({ id, username, role }, process.env.JWT_SECRET, {
    expiresIn: "90d",
  });
};

const verifyJwt = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        reject(err);
      } else {
        resolve(decodedToken);
      }
    });
  });
};

module.exports = { generateSign, verifyJwt };
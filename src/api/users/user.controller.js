/* eslint-disable no-undef */

const User = require("./user.model");



  const registerUser = async (req, res, next) => {
    try {
      const { userIDD } = req.body;

      // Verifica si el usuario ya existe
      const existingUser = await User.findOne({
       userId: userIDD 
      });
      if (existingUser) {
        return res.status(409).json({ message: "El usuario ya existe" });
      }

      // Crea el usuario
      
      const user = new User({
        userId:userIDD,
       
      });
      await user.save();

     
      return res.status(201).json({  user });
    } catch (error) {
      return next(error);
    }
  };

  

  module.exports = {  registerUser };
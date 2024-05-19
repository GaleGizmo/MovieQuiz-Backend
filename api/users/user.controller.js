/* eslint-disable no-undef */
const { generateSign, generateTempToken } = require("../utils/jwt");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./usuario.model");

const login = async (req, res, next) => {
    try {
      const { username, password } = req.body;
  
      // Busca al usuario por  username
      const user = await User.findOne({
        $or: [{ username: username }, { email: username }],
      });
  
      if (!user) {
        return res.status(401).json({ message: "Credenciales erróneas" });
      }
  
      // Verifica la contraseña
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Credenciales erróneas" });
      }
  
      // Genera el token
      const token = generateSign(user._id, user.username, user.role);
      user.password = null;
      return res.status(200).json({ token, user });
    } catch (error) {
      return next(error);
    }
  };

  const register = async (req, res, next) => {
    try {
      const { username, email, password } = req.body;

      // Verifica si el usuario ya existe
      const existingUser = await User.findOne({
        $or: [{ username: username }, { email: email }],
      });
      if (existingUser) {
        return res.status(409).json({ message: "El usuario ya existe" });
      }

      // Crea el usuario
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        username,
        email,
        password: hashedPassword,
      });
      await user.save();

      // Genera el token
      const token = generateSign(user._id, user.username, user.role);
      user.password = null;
      return res.status(201).json({ token, user });
    } catch (error) {
      return next(error);
    }
  };
  const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      const token = generateTempToken(user._id);
      console.log(token, user);
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // Token válido por 1 hora
      await user.save();
      await enviarCorreoRecuperacion(user, token);
      res.status(200).json({
        token,
        message:
          "Enviouse un email de recuperación de contrasinal",
      });
    } catch (error) {
      console.error(
        "Error ao procesar a solicitude de recuperación de contrasinal:",
        error
      );
      res.status(500).json({
        message: "Error ao procesar a solicitude de recuperación de contrasinal",
      });
    }
  };
  const resetPassword = async (req, res, next) => {
    const { token, password } = req.body;
  
    try {
      // Buscar al usuario por el token de recuperación de contraseña
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });
      if (!user) {
        return res.status(400).json({ message: "Token inválido ou expirado" });
      }
  
      // Actualizar la contraseña del usuario
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
  
      res.status(200).json({ message: "Contrasinal restablecido exitosamente" });
    } catch (error) {
      console.error("Error ao restablecer o contrasinal:", error);
      next(error);
    }
  };
  const deleteUsuario = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const { idUsuario } = req.params;
      
    
  
      // Eliminar usuario
      const usuarioToDelete = await User.findByIdAndDelete(idUsuario, { session });
      
      if (!usuarioToDelete) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Usuario non encontrado" });
      } else {
        
  
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json(usuarioToDelete);
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return next(error);
    }
  };

  module.exports = { login, deleteUsuario, forgotPassword, resetPassword, register };
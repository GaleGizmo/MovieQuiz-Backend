/* eslint-disable no-undef */
const express = require('express');
const {  isAdminOrOwner, authenticate } = require("../middleware/auth.js")
const usuarioRoutes=express.Router();   

const { createUsuario, deleteUsuario, login, editUsuario, forgotPassword, resetPassword,  } = require('./user.controller.js');

usuarioRoutes.post('/register',createUsuario);
usuarioRoutes.post('/login', login);
usuarioRoutes.put('/:idUsuario',[authenticate], editUsuario);

usuarioRoutes.delete('/:idUsuario',[isAdminOrOwner], deleteUsuario);
usuarioRoutes.post('/recuperar-password', forgotPassword)
usuarioRoutes.post('/reset-password', resetPassword)

module.exports=usuarioRoutes;
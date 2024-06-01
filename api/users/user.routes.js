/* eslint-disable no-undef */
const express = require('express');
const userRoutes=express.Router();   

const { registerUser  } = require('./user.controller.js');

userRoutes.post('/register',registerUser);


module.exports=userRoutes;
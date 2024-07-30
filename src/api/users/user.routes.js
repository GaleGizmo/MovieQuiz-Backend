/* eslint-disable no-undef */
const express = require('express');
const userRoutes=express.Router();   

const { registerUser, updatePoints, getUserPoints  } = require('./user.controller.js');

userRoutes.post('/register',registerUser);
userRoutes.patch('/updatepoints', updatePoints);
userRoutes.get('/getpoints', getUserPoints)


module.exports=userRoutes;
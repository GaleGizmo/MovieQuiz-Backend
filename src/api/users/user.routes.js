/* eslint-disable no-undef */
const express = require('express');
const userRoutes=express.Router();   

const { registerUser,  getUserPoints, notifyMe  } = require('./user.controller.js');

userRoutes.post('/register',registerUser);

userRoutes.get('/getpoints/:userId', getUserPoints)
userRoutes.post("/notifyme", notifyMe)

module.exports=userRoutes;
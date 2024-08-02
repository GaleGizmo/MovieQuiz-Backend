/* eslint-disable no-undef */
const express = require('express');
const userRoutes=express.Router();   

const { registerUser, updatePoints, getUserPoints, notifyMe  } = require('./user.controller.js');

userRoutes.post('/register',registerUser);
userRoutes.patch('/updatepoints', updatePoints);
userRoutes.get('/getpoints', getUserPoints)
userRoutes.post("/notifyme", notifyMe)

module.exports=userRoutes;
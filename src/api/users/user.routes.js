/* eslint-disable no-undef */
const express = require('express');
const userRoutes=express.Router();   

const { registerUser,  getUserPoints, notifyMe, updateUser, getUserData  } = require('./user.controller.js');

userRoutes.get('/getuser/:userId', getUserData)
userRoutes.post('/register',registerUser);
userRoutes.patch('/updateuser/:userId', updateUser);
userRoutes.get('/getpoints/:userId', getUserPoints)
userRoutes.post("/notifyme", notifyMe)

module.exports=userRoutes;
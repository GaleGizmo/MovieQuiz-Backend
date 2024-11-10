/* eslint-disable no-undef */
const express = require('express');
const userRoutes=express.Router();   

const { registerUser,  getUserPoints, notifyMe, updateUser, getUserData, getUserRanking  } = require('./user.controller.js');

userRoutes.get('/getuser/:userId', getUserData)
userRoutes.post('/register',registerUser);
userRoutes.patch('/updateuser/:userId', updateUser);
userRoutes.get('/getpoints/:userId', getUserPoints);
userRoutes.get('/getranking/:userId', getUserRanking)
userRoutes.post("/notifyme", notifyMe)

module.exports=userRoutes;
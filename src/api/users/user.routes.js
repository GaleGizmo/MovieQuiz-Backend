/* eslint-disable no-undef */
const express = require('express');
const userRoutes=express.Router();   

const { registerUser,  getUserPoints, updateUser, getUserData, getUserRanking, buyPhraseDetails, updateUsersField  } = require('./user.controller.js');

userRoutes.get('/getuser/:userId', getUserData)
userRoutes.post('/register',registerUser);
userRoutes.patch('/updateuser/:userId/:gameId?', updateUser);
userRoutes.get('/getpoints/:userId', getUserPoints);
userRoutes.get('/getranking/:userId', getUserRanking)
// userRoutes.post("/notifyme", notifyMe)
userRoutes.get("/buydetails/:userId", buyPhraseDetails)
userRoutes.post("/updateusersfield/:keyword", updateUsersField)

module.exports=userRoutes;
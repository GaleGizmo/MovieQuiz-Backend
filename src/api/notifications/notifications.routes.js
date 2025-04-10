// src/api/notifications/routes.js
const express = require("express");
const router = express.Router();
const {
  getNotificationsForUser,
  markAsRead,
  createNotification,
} = require("./notifications.controller.js");
const { checkKeyword } = require("../../middleware/auth.js");


router.get("/:userId", getNotificationsForUser);
router.post("/mark-as-read", markAsRead);
router.post("/", checkKeyword, createNotification); 

module.exports = router;

const express = require("express");
const router = express.Router();
const { runMorningTasks } = require("../../cronjobs");
const { checkKeyword } = require("../middleware/auth");


router.post("/run-morning-tasks", checkKeyword, async (req, res) => {
  try {
    await runMorningTasks();
    res.status(200).json({ message: "Tareas ejecutadas correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al ejecutar las tareas", details: error.message });
  }
});

module.exports = router;

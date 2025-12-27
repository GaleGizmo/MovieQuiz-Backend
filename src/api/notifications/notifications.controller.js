/* eslint-disable no-undef */
const Notification = require("./notifications.model.js");
const User = require("../users/user.model.js");

const getNotificationsForUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const groupTags = [];
    if (user.hasWinningStrikeBonus) groupTags.push("hasWinningStrikeBonus");
    if (user.hasPlayingStrikeBonus) groupTags.push("hasPlayingStrikeBonus");
    if (user.playingStrike == 0 && !user.hasPlayingStrikeBonus)
      groupTags.push("playing-strike-lost");
    if (user.winningStrike == 0 && !user.hasWinningStrikeBonus)
      groupTags.push("winning-strike-lost");

    const now = new Date();
    const notifications = await Notification.find({
      $and: [
        {
          $or: [
            { userId: user._id },
            { groupTag: { $in: groupTags } },
            { userId: null, groupTag: null },
          ],
        },
        { readBy: { $ne: user._id } },
        {
          $or: [
            { expiresAt: null },
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: now } },
          ],
        },
      ],
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener notificaciones" });
  }
};

const markAsRead = async (req, res) => {
  const { userId, notificationId } = req.body;

  try {
    await Notification.updateMany(
      { _id: notificationId },
      { $addToSet: { readBy: userId } }
    );
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al marcar como leídas" });
  }
};

const createNotification = async (req, res) => {
  const { userId, groupTag, title, message } = req.body;

  try {
    const newNotif = new Notification({
      userId: userId || null,
      groupTag: groupTag || null,
      title,
      message,
    });

    await newNotif.save();
    res.status(201).json(newNotif);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear notificación" });
  }
};
const createThreKingsNotification = async () => {
  try {
    const year = new Date().getUTCFullYear();
    const expiresAt = new Date(Date.UTC(year, 0, 7, 6, 59, 59, 999));

    const newNotif = new Notification({
      title: "¡Regalo de Reyes!",
      message:
        "La cita del 6 de enero tiene todas las pistas gratis 🎁. ¡Aprovéchalo!",
      expiresAt,
    });
    // Se crea la notificación sin userId ni groupTag, para que sea general
    await newNotif.save();
    console.log("Notificación especial de Reyes creada");
  } catch (error) {
    console.error("Error al crear la notificación de Reyes:", error.message);
  }
};

module.exports = {
  getNotificationsForUser,
  markAsRead,
  createNotification,
  createThreKingsNotification,
};

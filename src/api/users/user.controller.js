/* eslint-disable no-undef */


const User = require("./user.model");

const registerUser = async (req, res, next) => {
  try {
    const { userIDD } = req.body;

    // Verifica si el usuario ya existe
    const existingUser = await User.findOne({
      userId: userIDD,
    });
    if (existingUser) {
      return res.status(409).json({ message: "El usuario ya existe" });
    }

    // Crea el usuario

    const user = new User({
      userId: userIDD,
    });
    await user.save();

    return res.status(201).json({ user });
  } catch (error) {
    return next(error);
  }
};

const getUserPoints = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ userId: userId });
    if (!user) {
      return res.status(404).json({ message: "Usuario no existe" });
    }
    return res.status(200).json({ points: user.points });
  } catch (error) {
    return next(error);
  }
};
const updatePoints = async (userId, pointsToAdd) => {
  try {
    if (!userId || pointsToAdd === undefined) {
      throw new Error("UserId y pointsToAdd son requeridos.");
    }

    // Obtener el usuario actual
    const user = await User.findOne({ userId: userId });

    if (!user) {
      throw new Error("Usuario no existe");
    }

    // Actualizar puntos en usuario
    const updatedUser = await User.findOneAndUpdate(
      { userId: userId },
      { $inc: { points: pointsToAdd } },
      { new: true, runValidators: true }
    );

    return {
      userId: updatedUser.userId,
      points: updatedUser.points,
    };
  } catch (error) {
    console.error("Error en updatePoints:", error);
    throw error;
  }
};
const notifyMe = async (req, res, next) => {
  try {
    const { userId, email } = req.body;
    let user = await User.findOne({ userId: userId });
    if (user) {
      return res.status(404).json({ message: "Ya hay un email asignado" });
    } else {
      user = new User({
        userId: userId,
        email: email,
      });
      await user.save();
      return res.status(200).json({ message: "Usuario creado" });
    }
  } catch (error) {
    return next(error);
  }
};
module.exports = { registerUser, updatePoints, getUserPoints, notifyMe };

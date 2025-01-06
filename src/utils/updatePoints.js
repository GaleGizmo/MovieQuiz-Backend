/* eslint-disable no-undef */
const User = require("../api/users/user.model");

const updatePoints = async (userId, pointsToAdd) => {
  try {
    if (!userId || pointsToAdd === undefined) {
      throw new Error("UserId y pointsToAdd son requeridos.");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Usuario no existe");
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { points: pointsToAdd } },
      { new: true, runValidators: true }
    );

    return {
      userId: updatedUser._id,
      points: updatedUser.points,
    };
  } catch (error) {
    console.error("Error en updatePoints:", error);
    throw error;
  }
};

module.exports = {
  updatePoints,
};

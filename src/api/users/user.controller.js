/* eslint-disable no-undef */

const User = require("./user.model");

const getUserData = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "UserId es requerido." });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no existe" });
    }
    const userForFront = {
      _id: user._id,
      dontShowInstructions: user.dontShowInstructions,
      
    };
    return res.status(200).json(userForFront);
  } catch (error) {
    return next(error);
  }
};
const registerUser = async (req, res, next) => {
  try {
    const user = new User();
    await user.save();
    const userForFront = {
      _id: user._id,
      instructions: user.dontShowInstructions,
    };

   

    return res.status(201).json(userForFront);
  } catch (error) {
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { userData } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "UserId es requerido." });
    }

    // Inicializamos el objeto de actualización
    const update = { ...userData }; // Copiamos los demás campos de userData

    // Si está presente phrasesWon, lo añadimos al array correspondiente usando $push
    if (userData.phrasesWon !== undefined) {
      update.$push = { phrasesWon: userData.phrasesWon };
      delete update.phrasesWon; // Eliminamos phrasesWon de los demás campos para evitar conflictos
    }

    // Si está presente phrasesLost, lo añadimos al array correspondiente usando $push
    if (userData.phrasesLost !== undefined) {
      update.$push = { phrasesLost: userData.phrasesLost };
      delete update.phrasesLost; // Eliminamos phrasesLost para evitar conflictos
    }

    // Actualizamos el usuario con los campos correspondientes
    const user = await User.findByIdAndUpdate(
      userId,
      update,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Usuario no existe" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};


const getUserPoints = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "UserId es requerido." });
    }
    const user = await User.findById(userId);
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
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("Usuario no existe");
    }

    // Actualizar puntos en usuario
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
const notifyMe = async (req, res, next) => {
  try {
    const { userId, email } = req.body;
    let user = await User.findOne({ _id: userId });
    if (user) {
      return res.status(404).json({ message: "Ya hay un email asignado" });
    } else {
      user = new User({
        email: email,
      });
      await user.save();
      return res.status(200).json({ message: "Usuario creado" });
    }
  } catch (error) {
    return next(error);
  }
};
module.exports = { registerUser, getUserData, updateUser, updatePoints, getUserPoints, notifyMe };

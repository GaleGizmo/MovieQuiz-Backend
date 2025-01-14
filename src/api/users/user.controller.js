/* eslint-disable no-undef */

// const Game = require("../game/game.model");
const { checkGameForStrike } = require("../game/game.controller");
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
      points: user.points,
      phrasesWon: user.phrasesWon,
      phrasesLost: user.phrasesLost,
      dontShowInstructions: user.dontShowInstructions,
    };
    return res.status(200).json(userForFront);
  } catch (error) {
    return next(error);
  }
};
const registerUser = async (req, res, next) => {
  try {
    const lowestRankingUser = await User.findOne({ points: 0 }).sort({
      ranking: -1,
    });
    const newUserRanking = lowestRankingUser
      ? lowestRankingUser.ranking
      : lowestRankingUser.ranking + 1;
    const user = new User({
      points: 0,
      ranking: newUserRanking,
    });
    await user.save();
    const userForFront = {
      _id: user._id,
      instructions: user.dontShowInstructions,
      ranking: user.ranking,
    };

    return res.status(201).json(userForFront);
  } catch (error) {
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { userId, gameId } = req.params;

    const { userData } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "UserId es requerido." });
    }
    const userStrike = await User.findById(
      userId,
      "playingStrike winningStrike hasPlayingStrikeBonus hasWinningStrikeBonus"
    );
    console.log("userStrike", userStrike)
    if (!userStrike._id) {
      return res.status(404).json({ message: "Usuario no existe" });
    }

    // Inicializamos el objeto de actualización
    const update = { ...userData }; // Copiamos los demás campos de userData
    console.log("update recibido:", update)
    

    if (gameId) {
    
      const addToStrike = await checkGameForStrike(gameId);
     
      const newPlayingStrikeAndBonus = calculateNewStrike(
        userStrike.playingStrike,
        userStrike.hasPlayingStrikeBonus,
        addToStrike.playingStrike
      );
      const newWinningStrikeAndBonus = calculateNewStrike(
        userStrike.winningStrike,
        userStrike.hasWinningStrikeBonus,
        addToStrike.winningStrike
      );
      update.playingStrike = newPlayingStrikeAndBonus.strike;
      update.hasPlayingStrikeBonus = newPlayingStrikeAndBonus.bonus;
      update.winningStrike = newWinningStrikeAndBonus.strike;
      update.hasWinningStrikeBonus = newWinningStrikeAndBonus.bonus;
    }

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
    console.log("update", update);
    // Actualizamos el usuario con los campos correspondientes
    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no existe" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};

const calculateNewStrike = (strike, hasBonus, addOne) => {
  const newStrike = addOne && !hasBonus ? strike + 1 : strike;
  let newHasBonus;
  if (hasBonus || newStrike === 10) newHasBonus = true;
  return { strike: newStrike, bonus: newHasBonus };
};

const buyPhraseDetails = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "UserId es requerido." });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no existe" });
    }
    if (user.points < 20) {
      return res.status(400).json({ message: "Puntos insuficientes." });
    }
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { points: -20 } },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      userId: updatedUser._id,
      points: updatedUser.points,
    });
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
    return res.status(200).json({
      points: user.points,
      ranking: user.ranking,
      trend: user.rankingTrend,
    });
  } catch (error) {
    return next(error);
  }
};
const getUserRanking = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "UserId es requerido." });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no existe" });
    }
    // Obtener las tres puntuaciones más altas únicas
    const topScores = await User.aggregate([
      { $group: { _id: "$points", count: { $sum: 1 } } }, // Agrupar por ranking
      { $sort: { _id: -1 } },
      { $limit: 3 }, // Tomar las tres puntuaciones más altas
    ]).exec();
    const uniqueTopRankings = topScores.map((score) => score._id);

    const previousUserPoints = await User.findOne({
      ranking: { $eq: user.ranking - 1 },
    });
    const nextUserPoints = await User.findOne({
      ranking: { $eq: user.ranking + 1 },
    });
    return res.status(200).json({
      podiumScores: uniqueTopRankings,
      previousUser: previousUserPoints?.points || null,
      nextUser: nextUserPoints?.points || null,
      ranking: user.ranking,
      trend: user.rankingTrend,
    });
  } catch (error) {
    return next(error);
  }
};


// const notifyMe = async (req, res, next) => {
//   try {
//     const { userId, email } = req.body;
//     let user = await User.findOne({ _id: userId });
//     if (user) {
//       return res.status(404).json({ message: "Ya hay un email asignado" });
//     } else {
//       user = new User({
//         email: email,
//       });
//       await user.save();
//       return res.status(200).json({ message: "Usuario creado" });
//     }
//   } catch (error) {
//     return next(error);
//   }
// };

const updateDailyRanking = async () => {
  try {
    // Obtener todos los usuarios y ordenarlos por puntos en orden descendente
    const users = await User.find().sort({ points: -1 });

    // Crear el array de operaciones de escritura en bloque
    const bulkOperations = [];
    let currentRank = 1; // Puesto en el ranking visible

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const previousRank = user.ranking || null;

      // Determinar si el usuario actual tiene la misma puntuación que el anterior
      if (i > 0 && user.points < users[i - 1].points) {
        currentRank++; // Incrementar el ranking solo si la puntuación es menor
      }

      // Determinar la tendencia del ranking
      let currentTrend = "";
      if (previousRank !== null) {
        if (currentRank > previousRank) {
          currentTrend = "↓";
        } else if (currentRank < previousRank) {
          currentTrend = "↑";
        }
      }

      // Añadir la operación de actualización al array de operaciones en bloque
      bulkOperations.push({
        updateOne: {
          filter: { _id: user._id },
          update: {
            $set: { ranking: currentRank, rankingTrend: currentTrend },
          },
        },
      });
    }

    // Ejecutar las operaciones en una sola llamada a la base de datos
    const resultado = await User.bulkWrite(bulkOperations);
    console.log(
      `Ranking actualizado exitosamente. ${resultado.modifiedCount} usuarios modificados.`
    );
  } catch (error) {
    console.error("Error al actualizar el ranking:", error);
  }
};

// const añadirCampos = async () => {
//   try {
//     const resultado = await User.updateMany(
//       {},
//       {
//         $set: {
//           playingStrike: 0,
//           winningStrike: 0,
//           hasPlayingStrikeBonus: false,
//           hasWinningStrikeBonus: false,
//         },
//       }
//     );

//     console.log(`Campos añadidos a ${resultado.modifiedCount} usuarios.`);
//   } catch (error) {
//     console.error("Error al añadir el campo 'ranking':", error);
//   }
// };
// añadirCampos();

// updateDailyRanking();

const updateUsersField=async(req,res,next)=>{
  try {
    const {keyword}=req.params;
    const {field,value}=req.body;
    if (!keyword) {
      return res.status(400).json({ message: "Keyword es requerido." });
    }
    if (keyword!="Est@sb0rr@ch0M@nu31") {
      return res.status(400).json({ message: "Keyword incorrecto." });
    }
    const resultado = await User.updateMany(
      {},
      {
        $set: {
          [field]: value,
        },
      }
    );
    return res.status(200).json({updatedCount: resultado.modifiedCount});
} catch (error) {
  return next(error);
}
}
module.exports = {
  registerUser,
  getUserData,
  updateUser,
  updateUsersField,
  getUserPoints,
  getUserRanking,
  
  updateDailyRanking,
  buyPhraseDetails,
};

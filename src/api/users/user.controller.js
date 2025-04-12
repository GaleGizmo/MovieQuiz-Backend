/* eslint-disable no-undef */

// const Game = require("../game/game.model");
const { checkGameForStrike } = require("../game/game.controller");
const User = require("./user.model");
const Notification = require("../notifications/notifications.model");

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
      id: user._id,
      points: user.points,
      phrasesWon: user.phrasesWon,
      phrasesLost: user.phrasesLost,
      dontShowInstructions: user.dontShowInstructions,
      playingStrike: user.playingStrike,
      winningStrike: user.winningStrike,
      hasPlayingStrikeBonus: user.hasPlayingStrikeBonus,
      hasWinningStrikeBonus: user.hasWinningStrikeBonus,
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
      id: user._id,
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
   
    if (!userStrike) {
      return res.status(404).json({ message: "Usuario no existe" });
    }

    // Inicializamos el objeto de actualización
    const update = { ...userData }; // Copiamos los demás campos de userData
    

    if (gameId) {
      //Comprueba si hay que actualizar las rachas de partidas y victorias
      // Si el usuario ha ganado, se añade 1 a la racha de victorias
      // Si el usuario ha perdido, se añade 1 a la racha de partidas
      const addToStrike = await checkGameForStrike(gameId);
      
        let newPlayingStrike = userStrike.playingStrike;
        let newWinningStrike = userStrike.winningStrike;

        if (addToStrike.playingStrike) {
          newPlayingStrike = newPlayingStrike + 1;

          if (addToStrike.resetWinningStrike) {
            newWinningStrike = 0;
          } 
           if (addToStrike.winningStrike) {
            newWinningStrike = newWinningStrike + 1;
          }
        }
        update.playingStrike = newPlayingStrike;

        update.winningStrike = newWinningStrike;
      
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
    
    // Actualizamos el usuario con los campos correspondientes
    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    });

    const userForFront = {
      dontShowInstructions: user.dontShowInstructions,
      playingStrike: user.playingStrike,
      winningStrike: user.winningStrike,
      hasPlayingStrikeBonus: user.hasPlayingStrikeBonus,
      hasWinningStrikeBonus: user.hasWinningStrikeBonus,
    };

    return res.status(200).json(userForFront);
  } catch (error) {
    return next(error);
  }
};


//Comprar info de la frase
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
      { $inc: { points: -5 } },
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

const updateUsersBonuses = async (previousPhraseNumber) => {
  try {
    const usersWithPreviousPlayingBonusIds = await User.distinct("_id", { hasPlayingStrikeBonus: true });
    const usersWithPreviousWinningBonusIds = await User.distinct("_id", { hasWinningStrikeBonus: true });
    // Quitar las notificaciones de los usuarios que lo tenían el dia anterior
    await Notification.updateOne(
      { groupTag: "hasPlayingStrikeBonus" },
      { $pull: { readBy: { $in: usersWithPreviousPlayingBonusIds } } }
    );
    await Notification.updateOne(
      { groupTag: "hasWinningStrikeBonus" },
      { $pull: { readBy: { $in: usersWithPreviousWinningBonusIds } } }
    );
    // Quitar el bono de los usuarios que lo tenían el dia anterior
    await User.updateMany(
      { hasPlayingStrikeBonus: true },
      { $set: { hasPlayingStrikeBonus: false } }
    );
    await User.updateMany(
      { hasWinningStrikeBonus: true },
      { $set: { hasWinningStrikeBonus: false } }
    );
   
    // Se asigna el bono a los usuarios que han llegado a 7 rachas de partidas o victorias
    const playersWithPlayingStrike = await User.updateMany(
      {
        playingStrike: 7,
      },
      {
        $set: {
          playingStrike: 0,
          hasPlayingStrikeBonus: true,
        },
      }
    );
    const playersWithWinningStrike = await User.updateMany(
      {
        winningStrike: 7,
      },
      {
        $set: {
          winningStrike: 0,
          hasWinningStrikeBonus: true,
        },
      }
    );
    console.log(
      `Bonificaciones actualizadas. Hay ${playersWithPlayingStrike.modifiedCount} jugadores con bonificación de racha de partidas y ${playersWithWinningStrike.modifiedCount} jugadores con bonificación de racha de victorias. `
    );
  } catch (error) {
    console.error("Error al actualizar bonus racha partidas:", error);
  }
  try {
    const usersWithActiveStrike = await User.find({
      playingStrike: { $gt: 0 }, // sólo los que están en racha
    });

    const updates = [];

    for (const user of usersWithActiveStrike) {
      const hasPlayedYesterday =
        user.phrasesWon.includes(previousPhraseNumber) ||
        user.phrasesLost.includes(previousPhraseNumber);

      if (!hasPlayedYesterday) {
        updates.push(
          User.updateOne(
            { _id: user._id },
            {
              $set: {
                playingStrike: 0,
                hasPlayingStrikeBonus: false,
                winningStrike: 0,
                hasWinningStrikeBonus: false,
              },
            }
          )
        );
      }
    }

    const results = await Promise.all(updates);

    console.log(
      `Se actualizaron ${results.length} usuarios que no jugaron ayer`
    );
  } catch (error) {
    console.error("Error al resetear rachas de usuarios inactivos:", error);
  }
};

const specialDayBonuses = async () => {
  try {
   

    // Pistas gratuitas para todos los usuarios
    await User.updateMany(
      { hasWinningStrikeBonus: false} ,
      { $set: { hasWinningStrikeBonus: true } }
     
    );

    console.log(
      `Se han activado pistas gratis a todos los usuarios.`
    );
  } catch (error) {
    console.error("Error al actualizar los bonos por día especial", error);
  }
}

const updateUsersField = async (req, res, next) => {
  try {
    const { field, value } = req.body;
    if (!field || value === null) {
      return res.status(400).json({ message: "Campo y valor son requeridos." });
    }
    // Validar el campo que se va a actualizar
    const validFields = Object.keys(User.schema.paths); // Obtener las claves del esquema
    if (!validFields.includes(field)) {
      return res
        .status(400)
        .json({ message: `El campo '${field}' no existe en el modelo User.` });
    }
    const resultado = await User.updateMany(
      {},
      {
        $set: {
          [field]: value,
        },
      }
    );
    return res.status(200).json({ updatedCount: resultado.modifiedCount });
  } catch (error) {
    return next(error);
  }
};
module.exports = {
  registerUser,
  getUserData,
  updateUser,
  updateUsersField,
  getUserPoints,
  getUserRanking,
  updateUsersBonuses,
  updateDailyRanking,
  buyPhraseDetails,
  specialDayBonuses,
};

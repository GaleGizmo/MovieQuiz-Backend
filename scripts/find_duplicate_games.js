const mongoose = require('mongoose');
require('dotenv').config();

// Import the Game model
const Game = require('../src/api/game/game.model');

async function findDuplicateGames() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.DB_URL);
        console.log('Connected to MongoDB');

        // Aggregate to find duplicates
        const duplicates = await Game.aggregate([
            // Group by userId and phraseNumber
            {
                $group: {
                    _id: {
                        userId: "$userId",
                        phraseNumber: "$phraseNumber"
                    },
                    count: { $sum: 1 },
                    games: { 
                        $push: {
                            gameId: "$_id",
                            createdAt: "$createdAt",
                            points: "$earnedPoints",
                            
                        }
                    }
                }
            },
            // Filter only groups with more than 1 game (duplicates)
            {
                $match: {
                    count: { $gt: 1 }
                }
            },
            // Sort by count descending (most duplicates first)
            {
                $sort: {
                    count: -1
                }
            }
        ]);

        if (duplicates.length === 0) {
            console.log('No duplicate games found.');
            return;
        }

        console.log(`Found ${duplicates.length} cases of duplicate games:\n`);

        duplicates.forEach((dup, index) => {
            console.log(`Case ${index + 1}:`);
            console.log(`User ID: ${dup._id.userId}`);
            console.log(`Phrase Number: ${dup._id.phraseNumber}`);
            console.log(`Number of times played: ${dup.count}`);
            console.log('\nGame details:');
            
            dup.games.forEach((game, i) => {
                console.log(`\nGame ${i + 1}:`);
                console.log(`- Game ID: ${game.gameId}`);
                console.log(`- Created: ${game.createdAt}`);
                console.log(`- Points: ${game.points}`);
                console.log(`- Attempts Left: ${game.attemptsLeft}`);
            });
            console.log('\n-------------------\n');
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the script
findDuplicateGames();
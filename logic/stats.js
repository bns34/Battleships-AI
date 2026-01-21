const { getDatabase } = require('./databaseManagement');

// Create a new player
function createPlayer(displayName) {
    const db = getDatabase();
    try {
        const stmt = db.prepare('INSERT INTO Player (DisplayName) VALUES (?)');
        const info = stmt.run(displayName);
        const playerID = info.lastInsertRowid;
        
        // Initialize stats for the new player
        const statsStmt = db.prepare('INSERT INTO Stats (PlayerID, GamesPlayed, Wins, AverageTime) VALUES (?, 0, 0, 0)');
        statsStmt.run(playerID);
        
        db.close();
        return playerID;
    } catch (err) {
        db.close();
        throw err;
    }
}

// Update player display name
function updatePlayerName(playerID, displayName) {
    const db = getDatabase();
    try {
        const stmt = db.prepare('UPDATE Player SET DisplayName = ? WHERE PlayerID = ?');
        const info = stmt.run(displayName, playerID);
        db.close();
        return info.changes;
    } catch (err) {
        db.close();
        throw err;
    }
}

// Get player by ID
function getPlayer(playerID) {
    const db = getDatabase();
    try {
        const stmt = db.prepare('SELECT * FROM Player WHERE PlayerID = ?');
        const row = stmt.get(playerID);
        db.close();
        return row;
    } catch (err) {
        db.close();
        throw err;
    }
}

function getStats(playerID) { // Retrieve stats from database
    const db = getDatabase();
    try {
        const stmt = db.prepare(`
            SELECT 
                s.GamesPlayed, 
                s.Wins, 
                s.AverageTime,
                (s.GamesPlayed - s.Wins) as Losses,
                p.DisplayName
            FROM Stats s
            JOIN Player p ON s.PlayerID = p.PlayerID
            WHERE s.PlayerID = ?
        `);
        const row = stmt.get(playerID);
        db.close();
        
        if (!row) {
            return {
                gamesPlayed: 0,
                wins: 0,
                losses: 0,
                averageTime: 0,
                displayName: null
            };
        }
        
        return {
            gamesPlayed: row.GamesPlayed,
            wins: row.Wins,
            losses: row.Losses,
            averageTime: row.AverageTime || 0,
            displayName: row.DisplayName
        };
    } catch (err) {
        db.close();
        throw err;
    }
}

function updateStats(game) { // Update the statistics after a game concludes
    console.log("Updating stats...");
    
    if (!game.playerID) {
        console.error("No playerID found in game object");
        return;
    }

    const db = getDatabase();
    const timeTaken = (new Date() - game.startedAt) / 1000; // Time in seconds
    const timestamp = Math.floor(new Date().getTime() / 1000); // Unix timestamp in seconds

    try {
        // Use transaction for atomicity
        const insertGame = db.prepare('INSERT INTO Game (PlayerID, Winner, Duration, Timestamp) VALUES (?, ?, ?, ?)');
        const getStatsStmt = db.prepare('SELECT GamesPlayed, Wins, AverageTime FROM Stats WHERE PlayerID = ?');
        const updateStatsStmt = db.prepare('UPDATE Stats SET GamesPlayed = ?, Wins = ?, AverageTime = ? WHERE PlayerID = ?');
        
        // Start transaction
        const transaction = db.transaction(() => {
            // Insert game record
            const gameInfo = insertGame.run(game.playerID, game.winner, timeTaken, timestamp);
            console.log(`Game record inserted with ID: ${gameInfo.lastInsertRowid}`);
            
            // Get current stats
            const row = getStatsStmt.get(game.playerID);
            
            const newGamesPlayed = row.GamesPlayed + 1;
            const newWins = game.winner === "Player" ? row.Wins + 1 : row.Wins;
            const totalTime = (row.AverageTime * row.GamesPlayed) + timeTaken;
            const newAverageTime = totalTime / newGamesPlayed;
            
            // Update stats
            updateStatsStmt.run(newGamesPlayed, newWins, newAverageTime, game.playerID);
            
            console.log("Stats updated successfully");
        });
        
        transaction();
        db.close();
    } catch (err) {
        db.close();
        console.error('Error updating stats:', err);
        throw err;
    }
}


module.exports = { getStats, updateStats, createPlayer, updatePlayerName, getPlayer };


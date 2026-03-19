const express = require('express');

const { getStats, createPlayer, updatePlayerName, getPlayer } = require('../logic/stats.js');

const {Game} = require('../logic/game.js');
const app = express.Router();
let games = {}; // Store active games in memory

function validateDifficultyString(difficulty){
    const validDifficulties = ['easy', 'medium']; // Currently only easy and medium is implemented
    return validDifficulties.includes(difficulty);
}

app.post('/start-game', (req, res) => {
    try {
        const difficulty = req.body.difficulty || 'easy'; // Use easy as a default difficulty incase none is specified
        const playerID = req.body.playerID; // Get playerID from request
        
        if (!playerID) {
            return res.status(400).json({ error: "Player ID is required" });
        }
        
        if (!validateDifficultyString(difficulty)) {
            return res.status(400).json({ error: "Invalid difficulty level" });
        }
        const gameId = Date.now().toString(); // Unique ID based on current timestamp. Not suitable long-term, but will work for now

        games[gameId] = new Game(difficulty, playerID);
        return res.json({ gameId, message: 'Game started' });
    } catch (error) {
        console.error('Error starting game:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/place-ship', (req, res) => { // Endpoint used when the player places their ships
    const { gameId, shipType, startRow, startCol, orientation } = req.body; // Retrieve these values from the request body
    const game = games[gameId];
    if (!game) return res.status(404).json({ error: "Game not found" }); // Return 404 if the game ID is invalid

    const result = game.placeShip(shipType, startRow, startCol, orientation); // Call the placeShip method
    if (!result.success) {
        return res.status(400).json({ error: result.message }); // Return 400 if something is wrong
    }
    res.json(result);
});

app.post("/player-move", (req, res) => { // Endpoint used when the player makes a move
    const { gameId, row, col } = req.body;
    const game = games[gameId];
    if (!game) return res.status(404).json({ error: "Game not found" });

    const result = game.processPlayerMove(row, col); // Process the player's move
    if (result.error) {
        return res.status(400).json({ error: result.error }); // Return 400 if there was an error
    }
    if (!game.gameOver) {
        // If the game isn't over, immediately make the AI's move and return the result to the user
        const aiResult = game.aiMove(); 
        return res.json({ playerResult: result, aiResult });
    }
    res.json({ playerResult: result, aiResult: null }); // This happens if the game is over. Result contains the move result and also the gameOver status
});

app.post("/ai-move", (req, res) => { // Endpoint used to get the AI's move - mainly for testing purposes
    const { gameId } = req.body;
    const game = games[gameId];
    if (!game) return res.status(404).json({ error: "Game not found" });

    const result = game.aiMove(); // Process the AI's move
    if (result.error) {
        return res.status(400).json({ error: result.error }); // Return 400 if there was an error
    }
    res.json({ aiResult: result }); // Return the AI's move result
});

app.get("/check-game-over", (req, res) => { // Endpoint to check if the game is over
    const { gameId } = req.query;
    const game = games[gameId];
    if (!game) return res.status(404).json({ error: "Game not found" });

    if(game.gameOver) { // If the game is already over, return the winner
        return res.json({ gameOver: true, winner: game.winner });
    }

    if (game.checkGameOver(game.aiBoard.grid)) { // Check if all AI ships are sunk
        this.gameOver = true;
        this.winner = "Player";
        updateStats(game); // Update stats if game is over
    } else if (game.checkGameOver(game.playerBoard.grid)) { // Check if all player ships are sunk
        this.gameOver = true;
        this.winner = "AI";
        updateStats(game); // Update stats if game is over
    }

    res.json({ gameOver: game.gameOver, winner: game.winner });
});

app.get("/get-game-state", (req, res) => { // Endpoint to retrieve the current game state
    /* This endpoint will return:
        masked AI grid
        full player grid
        correct turn
        correct gameOver flag
    */
    const { gameId } = req.query;
    const game = games[gameId];
    if (!game) return res.status(404).json({ error: "Game not found" });

    // Mask the AI grid to hide remaining ships
    const maskedAIBoard = game.aiBoard.grid.map(row => 
        row.map(cell => (cell === 1 ? 0 : cell)) // Replaces existing ships with empty spaces (0)
    );

    res.json({
        playerBoard: game.playerBoard.grid,
        aiBoard: maskedAIBoard,
        isPlayerTurn: game.isPlayerTurn,
        gameOver: game.gameOver,
        winner: game.winner
    });
});


app.get("/stats", (req, res) => { // Endpoint to retrieve game statistics
    try {
        const { playerID } = req.query;
        if (!playerID) {
            return res.status(400).json({ error: "Player ID is missing" });
        }
        const stats = getStats(parseInt(playerID)); // Retrieve stats using the function in stats.js
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Player management endpoints
app.post("/create-player", (req, res) => {
    try {
        const { displayName } = req.body;
        if (!displayName) {
            return res.status(400).json({ error: "Display name is required" });
        }
        const playerID = createPlayer(displayName);
        res.json({ playerID, displayName });
    } catch (error) {
        console.error('Error creating player:', error);
        res.status(400).json({ error: 'Invalid display name.' });
    }
});

app.put("/update-player-name", (req, res) => {
    try {
        const { playerID, displayName } = req.body;
        if (!playerID || !displayName) {
            return res.status(400).json({ error: "Player ID and display name are required" });
        }
        updatePlayerName(parseInt(playerID), displayName);
        res.json({ success: true, displayName });
    } catch (error) {
        console.error('Error updating player name:', error);
        res.status(400).json({ error: 'Invalid display name.' });
    }
});

app.get("/player", (req, res) => {
    try {
        const { playerID } = req.query;
        if (!playerID) {
            return res.status(400).json({ error: "Player ID is missing" });
        }
        const player = getPlayer(parseInt(playerID));
        if (!player) {
            return res.status(404).json({ error: "Player not found" });
        }
        res.json(player);
    } catch (error) {
        console.error('Error fetching player:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = app;
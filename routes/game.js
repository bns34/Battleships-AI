const express = require('express');

const {Game} = require('../logic/game.js');
const app = express.Router();
let games = {}; // Store active games in memory

app.post('/start-game', (req, res) => {
  const difficulty = req.body.difficulty || 'easy'; // Use easy as a default difficulty incase none is specified
  const gameId = Date.now().toString(); // Unique ID based on current timestamp. Not suitable long-term, but will work for now

  games[gameId] = new Game(difficulty);
  res.json({ gameId, message: 'Game started' });
});

app.post('/place-ship', (req, res) => { // Endpoint used when the player places their ships
  const { gameId, shipType, startRow, startCol, orientation } = req.body; // Retrieve these values from the request body
  const game = games[gameId];
  if (!game) return res.status(404).json({ error: "Game not found" }); // Return 404 if the game ID is invalid

  const result = game.placeShip(shipType, startRow, startCol, orientation); // Call the placeShip method
  res.json(result);
  console.log(`Boards:\nPlayer Board: ${JSON.stringify(game.playerBoard)}\nAI Board: ${JSON.stringify(game.aiBoard)}`);
});

app.post("/player-move", (req, res) => { // Endpoint used when the player makes a move
  const { gameId, row, col } = req.body;
  const game = games[gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });

  const result = game.processPlayerMove(row, col); // Process the player's move
  console.log(`Boards:\nPlayer Board: ${JSON.stringify(game.playerBoard)}\nAI Board: ${JSON.stringify(game.aiBoard)}`);
  if (!game.gameOver) {
    // If the game isn't over, immediately make the AI's move and return the result to the user
    const aiResult = game.aiMove(); 
    return res.json({ playerResult: result, aiResult });
  }
  res.json(result); // This happens if the game is over. Result contains the move result and also the gameOver status
});

module.exports = app;
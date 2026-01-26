const { generateShips, validateShipPlacement } = require('./ships');
const { aiMoveEasy, aiMoveMed } = require('./ai');
const { updateStats } = require('./stats');


class Board {
    constructor() {
        this.grid = this.createEmptyGrid();
        this.ships = [];
    }

    // Create a 10x10 grid for the game board
    createEmptyGrid() { 
        return Array.from({ length: 10 }, () => Array(10).fill(0)); // No point setting a height attribute because grid is square
    }
}

class Game {
    constructor(difficulty = "easy", playerID = null) {
        this.gridSize = 10;
        this.difficulty = difficulty;
        this.playerBoard = new Board(); // Player's board
        this.aiBoard = new Board(); // AI's board
        this.isPlayerTurn = true;
        this.gameOver = false;
        this.winner = null;
        this.startedAt = new Date();
        this.playerID = playerID; // Store player ID for keeping stats separate

        this.placeAIShips();
    }

    // Randomly place AI ships
    placeAIShips() {
        const shipsToPlace = generateShips(); // Creates a list of Ship objects
        shipsToPlace.forEach(ship => {
        let valid = false;
        while (!valid) {
            const orientation = Math.random() < 0.5 ? 'H' : 'V'; // Choose a random orientation
            const row = Math.floor(Math.random() * this.gridSize);
            const col = Math.floor(Math.random() * this.gridSize);
            valid = validateShipPlacement(ship.size, row, col, orientation, this.aiBoard.grid);
            if (valid) { // Ship placement is valid (not out of bounds and not overlapping)
                this.placeShipOnGrid(ship.size, row, col, orientation, this.aiBoard.grid); // Place each ship on the AI's board
                this.aiBoard.ships.push({ ...ship, row, col, orientation, hits: 0 });
                break;
            }
        }
        });
    }

    // Function for placing ships on the grid
    placeShipOnGrid(size, startRow, startCol, orientation, grid) {
        for (let i = 0; i < size; i++) { // For each grid cell the ship occupies
            if (orientation === "H") grid[startRow][startCol + i] = 1; // Set to 1 to indicate there is a ship
            else grid[startRow + i][startCol] = 1;
        }
    }

    // Function for player placing a ship
    placeShip(shipType, startRow, startCol, orientation) {
        const ships = generateShips();
        const ship = ships.find(s => s.name.toLowerCase() === shipType?.toLowerCase()); // Use lowercase incase of case differences
        if (!ship) return { success: false, message: "Invalid ship type" };

        if(orientation !== "H" && orientation !== "V") {
            return { success: false, message: "Invalid orientation" };
        }
        if(startRow < 0 || startRow >= this.gridSize || startCol < 0 || startCol >= this.gridSize) {
            return { success: false, message: "Invalid co-ordinate" };
        }

        const valid = validateShipPlacement(ship.size, startRow, startCol, orientation, this.playerBoard.grid); // Validate the ship placement
        if (!valid) return { success: false, message: "Invalid ship placement" }; // Return both a boolean flag and a message

        this.placeShipOnGrid(ship.size, startRow, startCol, orientation, this.playerBoard.grid);
        this.playerBoard.ships.push({ ...ship, row: startRow, col: startCol, orientation, hits: 0 });
        return { success: true, message: "" }; // A message isnt really relevant if its successful
    }

    // Function to process player move
    processPlayerMove(row, col) {
        if (!this.isPlayerTurn) return { error: "Not player's turn" }; // Prevent player from making two moves in a row
        console.log(`Player attacking row ${row}, col ${col}`);

        // Check if row or column is out of range
        if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) {
            return { error: "Invalid coordinates" };
        }

        if (this.aiBoard.grid[row][col] === "hit" || this.aiBoard.grid[row][col] === "miss") { // Prevent attacking the same grid square twice
            return { error: "Cell already attacked" }; // Return a error message to the client
        }

        let result = "miss"; // Set default result as miss
        if (this.aiBoard.grid[row][col] === 1) { // 1 indicates a ship is present in that coordinate
            this.aiBoard.grid[row][col] = "hit"; // Mark the grid square as hit - currently mixing data types but will work for testing purposes
            result = "hit"; // Update result to hit
        } else {
            this.aiBoard.grid[row][col] = "miss"; // Mark the grid square as miss
        }

        this.isPlayerTurn = false; // Set the player turn to false, indicating it's the AI's turn
        if (this.checkGameOver(this.aiBoard.grid)) { // Check if all AI ships are sunk
            this.gameOver = true;
            this.winner = "Player";
            updateStats(this); // Update stats if game is over
        }

        return { result, gameOver: this.gameOver }; // Return the result of the move and also whether or not the game is over
    }

    // Function to process AI moves
    aiMove() {
        if (this.gameOver) return { result: "Game already over" }; // Make sure AI doesn't move if game is over

        const difficulty = this.difficulty;

        let move;
        if(difficulty === "easy") {
            move = aiMoveEasy(this.playerBoard.grid); // Returns a row and column
        } else if (difficulty === "medium") {
            move = aiMoveMed(this.playerBoard.grid);
        }
        // Move shouldnt ever be undefined so a fallback isnt necessary
        
        const { row, col } = move;
        let result = "miss";
        if (this.playerBoard.grid[row][col] === 1) { // Indicates a ship is present
            this.playerBoard.grid[row][col] = "hit"; // Mark the grid square as hit
            result = "hit";
        } else {
            this.playerBoard.grid[row][col] = "miss";
        }

        this.isPlayerTurn = true;
        if (this.checkGameOver(this.playerBoard.grid)) { // Check if all player ships are sunk
            this.gameOver = true;
            this.winner = "AI";
            updateStats(this); // Update stats if game is over
        }

        return { row, col, result, gameOver: this.gameOver }; // Return the AI's move to the client
    }

    // Check if all ships are sunk
    checkGameOver(board) {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (board[row][col] === 1){
                    return false; // 1 indicates theres a ship that hasnt been hit yet
                }
            }
        }
        return true;
    }
}

module.exports = { Board, Game };
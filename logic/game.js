const { generateShips, validateShipPlacement } = ('./ships')


export class Board {
    constructor() {
        this.grid = this.createEmptyGrid();
        this.ships = [];
    }

    // Create a 10x10 grid for the game board
    createEmptyGrid() { 
        return Array.from({ length: 10 }, () => Array(10).fill(0)); // No point setting a height attribute because grid is square
    }
}

export class Game {
    constructor(difficulty = "easy") {
        this.difficulty = difficulty;
        this.playerBoard = new Board(); // Player's board
        this.aiBoard = new Board(); // AI's board
        this.isPlayerTurn = true;
        this.gameOver = false;
        this.winner = null;

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
    placePlayerShip(ship, startRow, startCol, orientation) {
        const valid = validateShipPlacement(ship.size, startRow, startCol, orientation, this.playerBoard.grid); // Validate the ship placement
        if (!valid) return { success: false, message: "Invalid ship placement" }; // Return both a boolean flag and a message

        this.placeShipOnGrid(ship.size, startRow, startCol, orientation, this.playerBoard.grid);
        this.playerBoard.ships.push({ ...ship, row: startRow, col: startCol, orientation, hits: 0 });
        return { success: true, message: "" }; // A message isnt really relevant if its successful
    }

    // Function to process player move
    processPlayerMove(row, col) {
        if (!this.isPlayerTurn) return { error: "Not player's turn" }; // Prevent player from making two moves in a row
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
        if (this.checkGameOver(this.aiBoard)) { // Check if all AI ships are sunk
            this.gameOver = true;
            this.winner = "Player";
        }

        return { result, gameOver: this.gameOver }; // Return the result of the move and also whether or not the game is over
    }

    // Function to process AI moves
    aiMove() {
        if (this.gameOver) return { result: "Game already over" }; // Make sure AI doesn't move if game is over
        const move = aiMoveEasy(this.playerBoard); // Returns a row and column

        const { row, col } = move;
        let result = "miss";
        if (this.playerBoard[row][col] === 1) { // Indicates a ship is present
            this.playerBoard[row][col] = "hit"; // Mark the grid square as hit
            result = "hit";
        } else {
            this.playerBoard[row][col] = "miss";
        }

        this.isPlayerTurn = true;
        if (this.checkGameOver(this.playerBoard)) { // Check if all player ships are sunk
            this.gameOver = true;
            this.winner = "AI";
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
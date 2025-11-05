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
} /*
  // Function to process player move
  processPlayerMove(row, col) {
    if (!this.isPlayerTurn) return { error: "Not player's turn" };
    if (this.aiBoard.grid[row][col] === "hit" || this.aiBoard.grid[row][col] === "miss") {
      return { error: "Cell already attacked" };
    }

    let result = "miss";
    if (this.aiBoard.grid[row][col] === 1) {
      this.aiBoard.grid[row][col] = "hit";
      result = "hit";
    } else {
      this.aiBoard.grid[row][col] = "miss";
    }

    this.isPlayerTurn = false;
    if (this.checkGameOver(this.aiBoard)) {
      this.gameOver = true;
      this.winner = "Player";
    }

    return { result, gameOver: this.gameOver };
  }

  // AI takes turn
  aiMove() {
    if (this.gameOver) return { result: "Game already over" };
    const move =
      this.difficulty === "hard"
        ? aiMoveHard(this.playerBoard)
        : aiMoveEasy(this.playerBoard);

    const { row, col } = move;
    let result = "miss";
    if (this.playerBoard[row][col] === 1) {
      this.playerBoard[row][col] = "hit";
      result = "hit";
    } else {
      this.playerBoard[row][col] = "miss";
    }

    this.isPlayerTurn = true;
    if (this.checkGameOver(this.playerBoard)) {
      this.gameOver = true;
      this.winner = "AI";
    }

    return { row, col, result, gameOver: this.gameOver };
  }

  // Check if all ships are sunk
  checkGameOver(board) {
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        if (board[r][c] === 1) return false;
      }
    }
    return true;
  }
}
*/
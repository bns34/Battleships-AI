function validateShipPlacement(size, startRow, startCol, orientation, grid) {
  const gridSize = grid.length;

  if (orientation === "H" && startCol + size > gridSize) return false;
  if (orientation === "V" && startRow + size > gridSize) return false;

  // Check the area including the ship and its adjacent cells to prevent touching
  let minRow, maxRow, minCol, maxCol;
  if (orientation === "H") {
    minRow = Math.max(0, startRow - 1);
    maxRow = Math.min(gridSize - 1, startRow + 1);
    minCol = Math.max(0, startCol - 1);
    maxCol = Math.min(gridSize - 1, startCol + size);
  } else { // Vertical
    minRow = Math.max(0, startRow - 1);
    maxRow = Math.min(gridSize - 1, startRow + size);
    minCol = Math.max(0, startCol - 1);
    maxCol = Math.min(gridSize - 1, startCol + 1);
  }

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      if (grid[r][c] !== 0) return false;
    }
  }

  // Ship placement valid
  return true;
}



class Ship {
  constructor(name, size, status = 0) {
    this.name = name;
    this.size = size;
    this.status = status;
  }
}

function generateShips() {
  return [
    new Ship("Carrier", 5),
    new Ship("Battleship", 4),
    new Ship("Cruiser", 3),
    new Ship("Submarine", 3),
    new Ship("Destroyer", 2)
  ];
}

module.exports = { validateShipPlacement, Ship, generateShips };





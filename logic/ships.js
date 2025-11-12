function validateShipPlacement(size, startRow, startCol, orientation, grid) {
  const gridSize = grid.length;

  if (orientation === "H" && startCol + size > gridSize) return false;
  if (orientation === "V" && startRow + size > gridSize) return false;

  // At this point, the ship is within the bounds of the grid but may overlap other ships still

  for (let i = 0; i < size; i++) { // Check each grid square to see if it's already occupied by a ship
    if (orientation === "H" && grid[startRow][startCol + i] !== 0) return false;
    if (orientation === "V" && grid[startRow + i][startCol] !== 0) return false;
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





function aiMoveEasy(grid) { // Random targetting
    console.log("grid:", grid);
    let row = Math.floor(Math.random() * grid.length); // Choose a random row
    let col = Math.floor(Math.random() * grid.length); // Choose a random column
    // While the chosen grid square has already been attacked, repeat the random selection
    console.log(`AI selecting row ${row}, col ${col}`);
    console.log(grid[row][col]);
    while (grid[row][col] === 3 || grid[row][col] === 2) {
        row = Math.floor(Math.random() * grid.length);
        col = Math.floor(Math.random() * grid.length);
    }
    return { row, col }; // Return both the row and column in separate variables
}

function aiMoveMed(grid) { // Grid targetting - attacks adjacent cells of hits
    // Check for existing hits on the board
    const hits = [];
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] === 3) { // The cell is hit (not sunk though)
                hits.push({ row: r, col: c }); // Put the coordinates in the hits array
            }
        }
    }
    
    // If there is at least 1 hit cell
    if (hits.length > 0) {
        const adjacentCells = [];
        
        for (const hit of hits) { // Check all 4 adjacent cells
            const directions = [
                { row: hit.row - 1, col: hit.col }, // up
                { row: hit.row + 1, col: hit.col }, // down
                { row: hit.row, col: hit.col - 1 }, // left
                { row: hit.row, col: hit.col + 1 }  // right
            ];
            
            for (const direction of directions) { 
                // Check if the cell is within bounds and isnt already attacked
                if (direction.row >= 0 &&  // Row in range (lower bound)
                    direction.row < grid.length && // Row in range (upper bound)
                    direction.col >= 0 && // Column in range (lower bound)
                    direction.col < grid[direction.row].length && // Column in range (upper bound)
                    grid[direction.row][direction.col] !== 3 &&  // Not already hit
                    grid[direction.row][direction.col] !== 2) // Not already missed
                    {
                        adjacentCells.push(direction); // Add to potential target list
                    }
            }
        }
        
        // If there are valid adjacent cells then pick one randomly
        if (adjacentCells.length > 0) {
            const target = adjacentCells[Math.floor(Math.random() * adjacentCells.length)];
            return target; // End here
        }
    }
    
    // If no hits are foundthen resort to using checkerboard pattern (a bit more effective than random)
    const checkerboardCells = [];
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if ((r + c) % 2 === 0 && 
                grid[r][c] !== 3 && 
                grid[r][c] !== 2) {
                checkerboardCells.push({ row: r, col: c });
            }
        }
    }
    
    // If checkerboard cells available then use one
    if (checkerboardCells.length > 0) {
        const target = checkerboardCells[Math.floor(Math.random() * checkerboardCells.length)];
        console.log(`Opponent using checkerboard pattern: row ${target.row}, col ${target.col}`);
        return target;
    }
    
    // Fallback to completely random if no checkerboard cells are left
    return aiMoveEasy(grid); // Returns { row, col }
}

function aiMoveHard(grid) {
    // I will add this function at a later stage of development.
}

module.exports = { aiMoveEasy, aiMoveMed, aiMoveHard };
export function aiMoveEasy(grid) {
    let row = Math.floor(Math.random() * grid.length); // Choose a random row
    let col = Math.floor(Math.random() * grid.length); // Choose a random column
    // While the chosen grid square has already been attacked, repeat the random selection
    while (grid[row][col] === "hit" || grid[row][col] === "miss") {
        row = Math.floor(Math.random() * grid.length);
        col = Math.floor(Math.random() * grid.length);
    }
    return { row, col }; // Return both the row and column in separate variables
}

export function aiMoveHard(grid) {
    // I will add this function at a later stage of development.
}

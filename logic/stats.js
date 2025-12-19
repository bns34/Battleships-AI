function getStats() { // Retrieve stats from JSON file
    const data = fs.readFileSync('stats.json', 'utf-8');
    return JSON.parse(data);
}

function updateStats(game) { // Update the statistics after a game concludes
    const stats = getStats();
    stats.gamesPlayed += 1;
    if (game.winner === "Player") {
        stats.wins += 1;
    } else if (game.winner === "AI") {
        stats.losses += 1;
    }
    const timeTaken = (new Date() - game.startedAt) / 1000; // Time in seconds
    stats.totalTime += timeTaken;
    stats.averageTime = stats.totalTime / stats.gamesPlayed;

    fs.writeFileSync('stats.json', JSON.stringify(stats, null, 2)); // Save to file for persistence
}


module.exports = { getStats, updateStats };


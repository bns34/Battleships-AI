const fs = require('fs');

function getStats() { // Retrieve stats from JSON file
    try {
        const data = fs.readFileSync('stats.json', 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        const data = {
            "gamesPlayed": 0,
            "losses": 0,
            "totalTime": 0,
            "averageTime": 0
        };
        return data;
    }
}

function updateStats(game) { // Update the statistics after a game concludes
    console.log("Updating stats...");
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
    console.log("Stats updated:", stats);
}


module.exports = { getStats, updateStats };


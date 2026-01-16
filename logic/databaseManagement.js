const Database = require('better-sqlite3');
const path = require('path');

// Path for the database file
const dbPath = path.join(__dirname, '..', 'data.db');

// Create the database
function createDatabase() {
    const db = new Database(dbPath);
    
    // Enable foreign keys so playerID can be used in the other tables
    db.pragma('foreign_keys = ON');
    
    // Player table
    db.exec(`
        CREATE TABLE IF NOT EXISTS Player (
            PlayerID INTEGER PRIMARY KEY AUTOINCREMENT,
            DisplayName TEXT NOT NULL CHECK(length(DisplayName) >= 3 AND length(DisplayName) <= 50)
        )
    `);
    
    // Game table
    db.exec(`
        CREATE TABLE IF NOT EXISTS Game (
            GameID INTEGER PRIMARY KEY AUTOINCREMENT,
            PlayerID INTEGER NOT NULL,
            Winner TEXT DEFAULT 'Unknown',
            Duration REAL NOT NULL CHECK(Duration > 0),
            Timestamp INTEGER NOT NULL CHECK(Timestamp > 0),
            FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID)
        )
    `);

    // Stats table
    db.exec(`
        CREATE TABLE IF NOT EXISTS Stats (
            PlayerID INTEGER PRIMARY KEY NOT NULL,
            GamesPlayed INTEGER NOT NULL CHECK(GamesPlayed >= 0),
            Wins INTEGER NOT NULL CHECK(Wins >= 0),
            AverageTime REAL,
            FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID)
        )
    `);

    db.close();
}

// Get the database connection
function getDatabase() {
    const db = new Database(dbPath);
     db.pragma('foreign_keys = ON'); // Enable foreign keys on the database
    return db; // Return the db connection
}

module.exports = { createDatabase, getDatabase };

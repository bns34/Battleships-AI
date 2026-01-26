let gameId = null;
const gridSize = 10;
let currentPlayerID = null;

const playerBoardEl = document.getElementById("playerBoard");
const aiBoardEl = document.getElementById("aiBoard");
const statusEl = document.getElementById("status"); // Status element for messages about game state etc

document.getElementById("startGameBtn").addEventListener("click", startGame);
document.getElementById("playBtn").addEventListener("click", showPlay);
document.getElementById("statsBtn").addEventListener("click", showStats);
document.getElementById("updateNameBtn").addEventListener("click", updatePlayerName);

// Initialise player when the page loads
window.addEventListener("DOMContentLoaded", async () => {
    await initialisePlayer();
});

// Initialise or load player
async function initialisePlayer() {
    const storedPlayerID = localStorage.getItem("playerID");
    if (storedPlayerID) { // Load an existing player
        try {
            const res = await fetch(`/api/game/player?playerID=${storedPlayerID}`);
            if (res.ok) {
                const player = await res.json();
                currentPlayerID = player.PlayerID;
                document.getElementById("playerNameInput").value = player.DisplayName;
                document.getElementById("playerNameStatus").textContent = `${player.DisplayName} loaded`;
                return;
            }
        } catch (error) {
            console.error("Error loading player:", error);
        }
    }
    
    // If the user hasnt played before, create a new guest player
    await createNewPlayer("Player" + Math.floor(Math.random() * 1000)); // Use a 3 digit random number to reduce chances of clashes
}

// Create a new player
async function createNewPlayer(displayName) {
    try {
        const res = await fetch("/api/game/create-player", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({displayName})
        });
        
        const data = await res.json();
        if (res.ok) {
            currentPlayerID = data.playerID;
            localStorage.setItem("playerID", currentPlayerID);
            document.getElementById("playerNameInput").value = data.displayName;
            document.getElementById("playerNameStatus").textContent = `Player created: ${data.displayName}`;
        } else {
            document.getElementById("playerNameStatus").textContent = data.error || "Error creating player";
        }
    } catch (error) {
        console.error("Error creating player:", error);
        document.getElementById("playerNameStatus").textContent = "Error creating player";
    }
}

// Update player name
async function updatePlayerName() {
    const newName = document.getElementById("playerNameInput").value.trim();
    
    if (!newName || newName.length < 3 || newName.length > 50) {
        document.getElementById("playerNameStatus").textContent = "Name invalid";
        return;
    }
    
    try {
        const res = await fetch("/api/game/update-player-name", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playerID: currentPlayerID, displayName: newName })
        });
        
        const data = await res.json();
        if (res.ok) {
            document.getElementById("playerNameStatus").textContent = `Name updated to: ${data.displayName}`;
        } else {
            document.getElementById("playerNameStatus").textContent = data.error || "Error updating name";
        }
    } catch (error) {
        console.error("Error updating player name:", error);
        document.getElementById("playerNameStatus").textContent = "Error updating name";
    }
}

// Show the main game page (shown by default)
function showPlay() {
    document.getElementById("play-page").style.display = "block";
    document.getElementById("stats-page").style.display = "none";
}

// Show the stats page
function showStats() {
    document.getElementById("play-page").style.display = "none";
    document.getElementById("stats-page").style.display = "block";
    loadStats(); // Dont really need to await it because nothing requires the results
}

async function loadStats() {
    if (!currentPlayerID) {
        document.getElementById("playerNameStatus").textContent = "No player loaded";
        return;
    }
    
    const res = await fetch(`/api/game/stats?playerID=${currentPlayerID}`);
    const stats = await res.json();

    const gamesPlayedCounter = document.getElementById("games-played-counter");
    const playerWinsCounter = document.getElementById("player-wins-counter");
    const aiWinsCounter = document.getElementById("ai-wins-counter");
    const winRateDisplay = document.getElementById("win-rate");
    const avgGameTimeDisplay = document.getElementById("avg-game-time");

    const winRate = stats.gamesPlayed > 0 ? ((stats.wins / stats.gamesPlayed) * 100).toFixed(2) : 0;
    gamesPlayedCounter.textContent = `Games Played: ${stats.gamesPlayed}`;
    playerWinsCounter.textContent = `Player Wins: ${stats.wins || 0}`;
    aiWinsCounter.textContent = `AI Wins: ${stats.losses || 0}`;
    winRateDisplay.textContent = `Win Rate: ${winRate}%`;
    avgGameTimeDisplay.textContent = `Average Game Time: ${stats.averageTime.toFixed(2)} seconds`; // Limits to 2 decimal places
}

async function startGame() {
    if (!currentPlayerID) {
        statusEl.textContent = "Error: No player is set";
        return;
    }

    const difficulty = document.getElementById("difficultySelect").value.toLowerCase();
    
    const res = await fetch("/api/game/start-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: difficulty, playerID: currentPlayerID })
    });

    const data = await res.json();
    gameId = data.gameId;
    statusEl.textContent = "Game started";
    gameOver = false;
    await updateGameState();
}

let gameOver = false;

async function updateGameState() {
    const res = await fetch(`/api/game/get-game-state?gameId=${gameId}`);
    const data = await res.json();

    renderBoard(playerBoardEl, data.playerBoard, false);
    renderBoard(aiBoardEl, data.aiBoard, true);

    if (data.gameOver) {
        statusEl.textContent = `Game Over. Winner: ${data.winner}`;
        gameOver = true;
    }
}

function renderBoard(table, grid, isEnemy) {
    table.innerHTML = "";

    for (let r = 0; r < gridSize; r++) {
        const row = document.createElement("tr"); // tr = table row

        for (let c = 0; c < gridSize; c++) {
            const cell = document.createElement("td"); // td = table data cell
            const value = grid[r][c];

            if (value === "hit") cell.className = "hit";
            else if (value === "miss") cell.className = "miss";
            else if (value === 1 && !isEnemy) cell.className = "ship";
            else cell.className = "water";

            // Ship placement
            if (!isEnemy && placementStage) {
                // Attach an event listener to each cell for placing ships
                cell.addEventListener("click", () => placeShip(r, c));
            }

            // Attacking AI (only after placement)
            if (isEnemy && !placementStage && value === 0) {
                // Attach an event listener to each cell for attacking
                cell.addEventListener("click", () => playerMove(r, c));
            }

            row.appendChild(cell);
        }

        table.appendChild(row);
    }
}


async function playerMove(row, col) {
    if (gameOver) return;
    const res = await fetch("/api/game/player-move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, row, col })
    });

    const data = await res.json();

    if (data.error) {
        statusEl.textContent = data.error;
        return;
    }

    await updateGameState();
}



let placementStage = true;

const ships = {
    Carrier: 5,
    Battleship: 4,
    Cruiser: 3,
    Submarine: 3,
    Destroyer: 2
};

const placedShips = new Set();


async function placeShip(row, col) {
    const shipName = document.getElementById("shipSelect").value;

    if (placedShips.has(shipName)) {
        statusEl.textContent = "Ship already placed";
        return;
    }

    let orientationVal = document.getElementById("orientationSelect").value;
    const orientation = orientationVal === "horizontal" ? "H" : "V";

    const res = await fetch("/api/game/place-ship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            gameId,
            shipType: shipName,
            startRow: row,
            startCol: col,
            orientation
        })
    });

    const data = await res.json();

    if (!data.success) {
        statusEl.textContent = data.message;
        return;
    }

    placedShips.add(shipName);
    statusEl.textContent = `${shipName} placed`;

    if (placedShips.size === Object.keys(ships).length) {
        placementStage = false;
        document.getElementById("placementStatus").textContent = "All ships placed.";
    }

    await updateGameState();
}

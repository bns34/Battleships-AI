let gameId = null;
const gridSize = 10;

const playerBoardEl = document.getElementById("playerBoard");
const aiBoardEl = document.getElementById("aiBoard");
const statusEl = document.getElementById("status"); // Status element for messages about game state etc

document.getElementById("startGameBtn").addEventListener("click", startGame);

async function startGame() {
    const res = await fetch("/api/game/start-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: "easy" })
    });

    const data = await res.json();
    gameId = data.gameId;
    statusEl.textContent = "Game started";
    await updateGameState();
}

async function updateGameState() {
    const res = await fetch(`/api/game/get-game-state?gameId=${gameId}`);
    const data = await res.json();

    renderBoard(playerBoardEl, data.playerBoard, false);
    renderBoard(aiBoardEl, data.aiBoard, true);

    if (data.gameOver) {
        statusEl.textContent = `Game Over. Winner: ${data.winner}`;
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
            if (isEnemy && !placementStage && value === null) {
                // Attach an event listener to each cell for attacking
                cell.addEventListener("click", () => playerMove(r, c));
            }

            row.appendChild(cell);
        }

        table.appendChild(row);
    }
}


async function playerMove(row, col) {
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

    await updateGameState();

    if (placedShips.size === Object.keys(ships).length) {
        placementStage = false;
        document.getElementById("placementStatus").textContent = "All ships placed.";
    }
}

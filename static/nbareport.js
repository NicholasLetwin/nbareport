
let adjustedDateOffset = 0; // Offset from today in days
let adjustedDate = getAdjustedDate(adjustedDateOffset); // Initialize with today's date

// Function to get today's date in YYYY-MM-DD format
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Function to get an adjusted date by offsetting a certain number of days
function getAdjustedDate(offsetDays = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays); // Adjust the date by offsetDays
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function updateDateDisplay() {
    const dateDisplayElement = document.getElementById('current-date');
    if (dateDisplayElement) {
        dateDisplayElement.textContent = `Games for ${adjustedDate}`;
    } else {
        console.warn("Element with ID 'current-date' not found.");
    }
}

function getApiUrl() {
    return `/api/games?date=${adjustedDate}`;
}
// const API_URL = `/api/games?date=${adjustedDate}`;

// Update the displayed date
updateDateDisplay();

// Initial fetch and interval for periodic updates
fetchGameScores();
setInterval(fetchGameScores, 30000);

async function fetchGameScores() {
    const API_URL = getApiUrl();
    try {
        const response = await fetch(API_URL); // Add this line
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP Error! status: ${response.status}, message: ${errorText}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error("Received unexpected data format");
        }
        displayGameScores(data);
    } catch (error) {
        console.error("Error fetching data: ", error);
        const gameContainer = document.getElementById('game-scores');
        gameContainer.innerHTML = `<div class="error-message">Error loading games: ${error.message}</div>`;
    }
}


document.getElementById('previous-day').addEventListener('click', () => {
    adjustedDateOffset -= 1; // Move one day back
    adjustedDate = getAdjustedDate(adjustedDateOffset);
    updateDateDisplay();
    fetchGameScores();
});

document.getElementById('next-day').addEventListener('click', () => {
    adjustedDateOffset += 1; // Move one day forward
    adjustedDate = getAdjustedDate(adjustedDateOffset);
    updateDateDisplay();
    fetchGameScores();
});


function displayGameScores(data) {
    const gameContainer = document.getElementById('game-scores');
    gameContainer.innerHTML = ''; // Clear previous content

    // Group data by GAME_ID to pair teams
    const gamesMap = {};
    data.forEach(teamData => {
        const gameId = teamData.GAME_ID;
        if (!gamesMap[gameId]) {
            gamesMap[gameId] = [];
        }
        gamesMap[gameId].push(teamData);
    });

    // Iterate over each game
    Object.values(gamesMap).forEach(gameTeams => {
        if (gameTeams.length !== 2) {
            console.warn(`Both teams not found for game ID: ${gameTeams[0].GAME_ID}`);
            return;
        }

        const [team1, team2] = gameTeams;
        const homeTeam = team1.HOME_TEAM_ID === team1.TEAM_ID ? team1 : team2;
        const visitorTeam = team1.HOME_TEAM_ID === team1.TEAM_ID ? team2 : team1;

        let homeTeamName = `${homeTeam.TEAM_CITY_NAME} ${homeTeam.TEAM_NAME}`;
        let visitorTeamName = `${visitorTeam.TEAM_CITY_NAME} ${visitorTeam.TEAM_NAME}`;

        const gameDiv = document.createElement('div');
        gameDiv.className = 'game-card';

        const gameStatus = homeTeam.GAME_STATUS_TEXT || "Status Unknown";
        const isGameInProgress = gameStatus && (gameStatus.includes('Q') || gameStatus.includes('Half'));
        const gameEnded = !isGameInProgress && (homeTeam.PTS !== null && visitorTeam.PTS !== null);

        let homeTeamClass = 'team-name';
        let visitorTeamClass = 'team-name';

        // Determine winner colors if the game has ended
        if (gameEnded) {
            if (homeTeam.PTS > visitorTeam.PTS) {
                homeTeamClass += ' winner'; // Green for winner
                visitorTeamClass += ' loser'; // Red for loser
                homeTeamName = "*" + homeTeamName + "*"; // Add asterisks around winner
            } else {
                homeTeamClass += ' loser';
                visitorTeamClass += ' winner';
                visitorTeamName = "*" + visitorTeamName + "*"; // Add asterisks around winner
            }
        }

        const statusText = gameStatus.includes('ET') ? 'Start' : 'Status';

        gameDiv.innerHTML = `
        <h3>
            <span class="${visitorTeamClass}">${visitorTeamName}</span>
            <span class="at">at</span>
            <span class="${homeTeamClass}">${homeTeamName}</span>
        </h3>
        <p class="score-text">Score: ${visitorTeam.PTS || 0} - ${homeTeam.PTS || 0}</p>
        <p>${statusText}: ${gameStatus}</p>
    `;

        // Append a live indicator if the game is in progress
        if (isGameInProgress) {
            const liveIndicator = document.createElement('span');
            liveIndicator.className = 'live-indicator';
            gameDiv.appendChild(liveIndicator);
        }

        // Add a click event to open a details page for each game
        gameDiv.addEventListener('click', () => {
            // Use the adjustedDate variable that was used to fetch the games
            window.location.href = `game.html?id=${homeTeam.GAME_ID}&date=${adjustedDate}`;
        });

        gameContainer.appendChild(gameDiv);
    });

}

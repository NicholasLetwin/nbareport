// Import API key if needed for your Flask API
import { API_KEY } from './config.js';

const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get('id');
const gameDate = urlParams.get('date'); // Use date from the URL

let homeTeamId;
let visitorTeamId;
let gameEnded = false;


console.log('Requesting gameId:', gameId, 'on date:', gameDate);

// Define a function to fetch and display game details and player stats
function fetchGameAndPlayerDetails() {
    console.log('Requesting gameId:', gameId, 'on date:', gameDate);

    if (gameId && gameDate) {
        fetch(`/api/games?gameId=${gameId}&date=${gameDate}`, {
            headers: {
                'Authorization': API_KEY // Only include if required by your Flask API
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            const gameData = data.filter(g => g.GAME_ID === gameId.toString());

            if (gameData.length >= 2) {
                const homeTeam = gameData.find(g => g.TEAM_ID === g.HOME_TEAM_ID);
                const visitorTeam = gameData.find(g => g.TEAM_ID === g.VISITOR_TEAM_ID);
                displayGameDetails(homeTeam, visitorTeam, homeTeam);

                if (homeTeam.GAME_STATUS_TEXT === 'Final') {
                    gameEnded = true;
                    clearInterval(updateInterval); // Stop further updates
                }

                // Fetch and display player stats after loading game details
                fetchPlayerStats(gameId);
            } else {
                throw new Error('Game data incomplete');
            }
        })
        .catch(error => {
            console.error("Error fetching game details:", error);
            document.getElementById('game-details').innerHTML = `
                <p class="error-message">Error fetching game details. Please try again later.</p>
            `;
        });
    } else {
        const gameDetailsContainer = document.getElementById('game-details');
        gameDetailsContainer.innerHTML = `
            <p class="error-message">No game selected. Please go back and select a game.</p>
        `;
    }
}


function displayPlayerStats(playerStats) {
    const teamBoxScore = document.getElementById('team-box-score');
    console.log("Complete PlayerStats:", playerStats); // Log full playerStats for debugging
    playerStats.forEach(player => {
        console.log("Individual Player Data:", player); // Check each player’s data for START_POSITION
    });
    // Group players by team using the global variables
    const homeTeamPlayers = playerStats.filter(player => player.TEAM_ID === homeTeamId);
    const visitorTeamPlayers = playerStats.filter(player => player.TEAM_ID === visitorTeamId);

    // Display stats for the home team by default
    teamBoxScore.innerHTML = generatePlayerStatsTable(homeTeamPlayers);

     // Get references to the buttons
    const homeButton = document.getElementById('home-team-btn');
    const visitorButton = document.getElementById('visitor-team-btn');

    // Set the home button as active initially
    homeButton.classList.add('active');
    visitorButton.classList.remove('active');

    // Set event listeners for the buttons with active class toggle
    homeButton.onclick = () => {
        teamBoxScore.innerHTML = generatePlayerStatsTable(homeTeamPlayers);
        homeButton.classList.add('active');
        visitorButton.classList.remove('active');
    };

    visitorButton.onclick = () => {
        teamBoxScore.innerHTML = generatePlayerStatsTable(visitorTeamPlayers);
        visitorButton.classList.add('active');
        homeButton.classList.remove('active');
    };
}

function generatePlayerStatsTable(players) {
    return `
        <table class="box-score-table">
            <thead>
                <tr>
                    <th>Player</th>
                    <th>MIN</th>
                    <th>PTS</th>
                    <th>AST</th>
                    <th>REB</th>
                    <th>FGM</th>
                    <th>FGA</th>
                    <th>3PM</th>
                    <th>3PA</th>
                    <th>FTM</th>
                    <th>FTA</th>
                    <th>TO</th>
                </tr>
            </thead>
            <tbody>
                ${players.map(player => `
                    <tr>
                        <td class="${!player.MIN || player.MIN === 0 ? 'did-not-play' : ''}">
                            ${player.PLAYER_NAME} ${player.START_POSITION ? `(${player.START_POSITION})` : ''}
                        </td>
                        <td>${!isNaN(parseFloat(player.MIN)) ? Math.round(parseFloat(player.MIN)) : "-"}</td>
                        <td>${player.PTS !== null ? player.PTS : 0}</td>
                        <td>${player.AST !== null ? player.AST : 0}</td>
                        <td>${player.REB !== null ? player.REB : 0}</td>
                        <td>${player.FGM !== null ? player.FGM : 0}</td>
                        <td>${player.FGA !== null ? player.FGA : 0}</td>
                        <td>${player.FG3M !== null ? player.FG3M : 0}</td>
                        <td>${player.FG3A !== null ? player.FG3A : 0}</td>
                        <td>${player.FTM !== null ? player.FTM : 0}</td>
                        <td>${player.FTA !== null ? player.FTA : 0}</td>
                        <td>${player.TO !== null ? player.TO : 0}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}









async function fetchPlayerStats(gameId) {
    try {
        const response = await fetch(`/api/player_stats?gameId=${gameId}`);
        if (!response.ok) throw new Error(`Error fetching player stats: ${response.statusText}`);
        
        const playerStats = await response.json();
        displayPlayerStats(playerStats);
    } catch (error) {
        console.error("Error fetching player stats:", error);
    }
}


function displayGameDetails(homeTeam, visitorTeam, gameInfo) {
    console.log("Home Team Data:", homeTeam);
    console.log("Visitor Team Data:", visitorTeam);

    homeTeamId = homeTeam.TEAM_ID;
    visitorTeamId = visitorTeam.TEAM_ID;

    const gameDetailsContainer = document.getElementById('game-details');

    const homeTeamLogoUrl = `https://cdn.nba.com/logos/nba/${homeTeam.TEAM_ID}/primary/L/logo.svg`;
    const visitorTeamLogoUrl = `https://cdn.nba.com/logos/nba/${visitorTeam.TEAM_ID}/primary/L/logo.svg`;

    let homeTeamName = `${homeTeam.TEAM_CITY_NAME} ${homeTeam.TEAM_NAME}`;
    let visitorTeamName = `${visitorTeam.TEAM_CITY_NAME} ${visitorTeam.TEAM_NAME}`;

    

    const homeTeamScore = homeTeam.PTS !== null ? homeTeam.PTS : 0;
    const visitorTeamScore = visitorTeam.PTS !== null ? visitorTeam.PTS : 0;

    const gameStatusText = gameInfo.GAME_STATUS_TEXT || 'Scheduled';
    const isScheduledGame = gameStatusText.includes('ET'); // Checks if it contains a time like "7:00 PM ET"

    // Set labels and values based on game status
    const statusLabel = isScheduledGame ? 'Start Time' : 'Status';
    const statusValue = isScheduledGame ? gameStatusText : gameStatusText === 'Final' ? 'Final' : gameStatusText;

    const homeTeamAbbreviation = homeTeam.TEAM_ABBREVIATION || "N/A";
    const visitorTeamAbbreviation = visitorTeam.TEAM_ABBREVIATION || "N/A";

    document.getElementById('home-team-btn').textContent = homeTeamAbbreviation;
    document.getElementById('visitor-team-btn').textContent = visitorTeamAbbreviation;

    const isGameFinal = gameStatusText === 'Final';

    // Determine winner and add celebratory graphic
    const winnerGraphic = " 🎉";
    
    if (isGameFinal) {
    if (homeTeamScore > visitorTeamScore) {
        homeTeamName = winnerGraphic + " " + homeTeamName + winnerGraphic; // Add graphic to home team if they win
    } else if (visitorTeamScore > homeTeamScore) {
        visitorTeamName = winnerGraphic + " " + visitorTeamName + winnerGraphic; // Add graphic to visitor team if they win
    }
}
    // Populate the abbreviation display area
    document.querySelector('.matchup-abbreviation').innerHTML = `
        <span class="team-abbr">${homeTeamAbbreviation}</span>
        <span class="vs">vs.</span>
        <span class="team-abbr">${visitorTeamAbbreviation}</span>
    `;

    gameDetailsContainer.innerHTML = `
        <div class="scoreboard">
            <div class="team home-team">
                <img src="${homeTeamLogoUrl}" alt="${homeTeam.TEAM_NAME} Logo" class="team-logo">
                <h2>${homeTeamName}</h2>
                <div class="score">${homeTeamScore}</div>
            </div>
            <div class="versus">VS</div>
            <div class="team visitor-team">
                <img src="${visitorTeamLogoUrl}" alt="${visitorTeam.TEAM_NAME} Logo" class="team-logo">
                <h2>${visitorTeamName}</h2>
                <div class="score">${visitorTeamScore}</div>
            </div>
        </div>
        <div class="game-info">
            <p class="game-status">${statusLabel}: ${statusValue}</p>
            <p class="arena-name">Arena: ${gameInfo.ARENA_NAME || 'Unknown'}</p>
        </div>
    `;
}







fetchGameAndPlayerDetails();

const updateInterval = setInterval(fetchGameAndPlayerDetails, 30000); // 30 seconds


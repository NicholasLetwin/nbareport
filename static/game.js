// Import API key if needed for your Flask API
import { API_KEY } from './config.js';

const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get('id');
const gameDate = urlParams.get('date'); // Use date from the URL

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
        console.log('Fetched game data:', data);
    
        const gameData = data.filter(g => g.GAME_ID === gameId.toString());
    
        if (gameData.length >= 2) {
            const homeTeam = gameData.find(g => g.TEAM_ID === g.HOME_TEAM_ID);
            const visitorTeam = gameData.find(g => g.TEAM_ID === g.VISITOR_TEAM_ID);
    
            const gameInfo = homeTeam; // Shared game details
            displayGameDetails(homeTeam, visitorTeam, gameInfo);
        } else {
            throw new Error('Game data incomplete');
        }
    })
    .catch(error => {
        console.error("Error fetching game details:", error);
        const gameDetailsContainer = document.getElementById('game-details');
        gameDetailsContainer.innerHTML = `
            <p class="error-message">Error fetching game details. Please try again later.</p>
        `;
    });
} else {
    const gameDetailsContainer = document.getElementById('game-details');
    gameDetailsContainer.innerHTML = `
        <p class="error-message">No game selected. Please go back and select a game.</p>
    `;
}

function displayGameDetails(homeTeam, visitorTeam, gameInfo) {
    console.log("Home Team Data:", homeTeam);
    console.log("Visitor Team Data:", visitorTeam);

    const gameDetailsContainer = document.getElementById('game-details');

    const homeTeamLogoUrl = `https://cdn.nba.com/logos/nba/${homeTeam.TEAM_ID}/primary/L/logo.svg`;
    const visitorTeamLogoUrl = `https://cdn.nba.com/logos/nba/${visitorTeam.TEAM_ID}/primary/L/logo.svg`;

    const homeTeamName = `${homeTeam.TEAM_CITY_NAME} ${homeTeam.TEAM_NAME}`;
    const visitorTeamName = `${visitorTeam.TEAM_CITY_NAME} ${visitorTeam.TEAM_NAME}`;

    const homeTeamScore = homeTeam.PTS !== null ? homeTeam.PTS : 0;
    const visitorTeamScore = visitorTeam.PTS !== null ? visitorTeam.PTS : 0;

    const gameStatusText = gameInfo.GAME_STATUS_TEXT || 'Scheduled';
    const isScheduledGame = gameStatusText.includes('ET'); // Checks if it contains a time like "7:00 PM ET"

    // Set labels and values based on game status
    const statusLabel = isScheduledGame ? 'Start Time' : 'Status';
    const statusValue = isScheduledGame ? gameStatusText : gameStatusText === 'Final' ? 'Final' : gameStatusText;

    const homeTeamAbbreviation = homeTeam.TEAM_ABBREVIATION || "N/A";
    const visitorTeamAbbreviation = visitorTeam.TEAM_ABBREVIATION || "N/A";

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

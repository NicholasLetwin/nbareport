// Import API key if needed for your Flask API
import { API_KEY } from './config.js';

const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get('id');
console.log('gameId:', gameId);

// Check if gameId exists, then fetch details
if (gameId) {
    // Update to fetch from Flask API
    fetch(`http://127.0.0.1:5000/api/games?gameId=${gameId}`, {
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
            const game = data.find(g => g.GAME_ID === gameId); // Filter the data by gameId
            if (game) {
                displayGameDetails(game);
            } else {
                throw new Error('Game not found');
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

function displayGameDetails(gameData) {
    const gameDetailsContainer = document.getElementById('game-details');

    // Assume gameData is an object with separate entries for home and visitor teams
    const homeTeam = gameData.home_team || null;
    const visitorTeam = gameData.visitor_team || null;

    // Render the game details, ensuring both home and visitor data are included
    gameDetailsContainer.innerHTML = `
        <div class="scoreboard">
            <div class="team home-team">
                <h2>${homeTeam ? `${homeTeam.TEAM_CITY_NAME} ${homeTeam.TEAM_NAME}` : 'Home Team'}</h2>
                <div class="score">${homeTeam && homeTeam.PTS !== null ? homeTeam.PTS : 'N/A'}</div>
            </div>
            <div class="versus">VS</div>
            <div class="team visitor-team">
                <h2>${visitorTeam ? `${visitorTeam.TEAM_CITY_NAME} ${visitorTeam.TEAM_NAME}` : 'Visitor Team'}</h2>
                <div class="score">${visitorTeam && visitorTeam.PTS !== null ? visitorTeam.PTS : 'N/A'}</div>
            </div>
        </div>
        <p class="game-status">Status: ${homeTeam && homeTeam.GAME_STATUS_TEXT ? homeTeam.GAME_STATUS_TEXT : 'Scheduled'}</p>
        <p class="arena-name">Arena: ${homeTeam && homeTeam.ARENA_NAME ? homeTeam.ARENA_NAME : 'Unknown'}</p>
        <p class="start-time">Start Time: ${homeTeam && homeTeam.GAME_DATE_EST ? homeTeam.GAME_DATE_EST : 'TBD'}</p>
    `;
}


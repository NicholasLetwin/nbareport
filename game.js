import { API_KEY } from './config.js';


const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get('id');
console.log('gameId:', gameId);


if (gameId) {
    fetch(`https://api.balldontlie.io/v1/games/${gameId}`, {
        headers: {
            'Authorization': API_KEY // Include your API key here if required
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(responseData => {
            console.log('Fetched game data:', responseData); // Debugging
            const game = responseData.data; // Access the game object directly
            displayGameDetails(game);
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


function displayGameDetails(game) {
    const gameDetailsContainer = document.getElementById('game-details');
    gameDetailsContainer.innerHTML = `
        <div class="scoreboard">
            <div class="team home-team">
                <h2>${game.home_team.full_name}</h2>
                <div class="score">${game.home_team_score}</div>
            </div>
            <div class="versus">VS</div>
            <div class="team visitor-team">
                <h2>${game.visitor_team.full_name}</h2>
                <div class="score">${game.visitor_team_score}</div>
            </div>
        </div>
        <p class="game-status">Status: ${game.status}</p>
        <!-- Add more details as needed -->
    `;
}

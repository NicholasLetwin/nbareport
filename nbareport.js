
import { API_KEY } from './config.js';

/// Function to get today's date in YYYY-MM-DD format
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const day = String(today.getDate()).padStart(2, '0') ;
    return `${year}-${month}-${day}`;
}

const todayDate = getTodayDate();
// const API_URL = `http://127.0.0.1:5000/api/games?date=${"2024-10-28"}`;
const API_URL = `https://nbareport.vercel.app/api/games?date=${getTodayDate()}`;

fetchGameScores();
setInterval(fetchGameScores, 60000);

async function fetchGameScores(){
    try{
        const response = await fetch(API_URL);
        if(!response.ok){
            throw new Error(`HTTP Error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        displayGameScores(data);
    } catch (error){
        console.error("Error fetching data: ", error);
    }
}

function displayGameScores(data) {
    const gameContainer = document.getElementById('game-scores');
    gameContainer.innerHTML = '';

    // Group data by GAME_ID
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

        // Determine home and visitor teams
        const [team1, team2] = gameTeams;
        const homeTeam = team1.HOME_TEAM_ID === team1.TEAM_ID ? team1 : team2;
        const visitorTeam = team1.HOME_TEAM_ID === team1.TEAM_ID ? team2 : team1;

        const gameDiv = document.createElement('div');
        gameDiv.className = 'game-card';

        // Safely determine game status
        const gameStatus = homeTeam.GAME_STATUS_TEXT || "Status Unknown";
        const isGameInProgress = gameStatus && (gameStatus.includes('Q') || gameStatus.includes('Half'));

        gameDiv.innerHTML = `
            <h3>
                <span class="team-name">${homeTeam.TEAM_CITY_NAME} ${homeTeam.TEAM_NAME}</span>
                <span class="vs">vs.</span>
                <span class="team-name">${visitorTeam.TEAM_CITY_NAME} ${visitorTeam.TEAM_NAME}</span>
            </h3>
            <p>Score: ${homeTeam.PTS} - ${visitorTeam.PTS}</p>
            <p>Status: ${gameStatus}</p>
        `;

        // Append live indicator if the game is in progress
        if (isGameInProgress) {
            const liveIndicator = document.createElement('span');
            liveIndicator.className = 'live-indicator';
            gameDiv.appendChild(liveIndicator);
        }

        gameDiv.addEventListener('click', () => {
            window.location.href = `game.html?id=${homeTeam.GAME_ID}`;
        });

        gameContainer.appendChild(gameDiv);
    });
}


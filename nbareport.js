
// import { API_KEY } from './config.js';

// /// Function to get today's date in YYYY-MM-DD format
// function getTodayDate() {
//     const today = new Date();
//     const year = today.getFullYear();
//     const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-based
//     const day = String(today.getDate()).padStart(2, '0') ;
//     return `${year}-${month}-${day}`;
// }

// const todayDate = getTodayDate();
// // const API_URL = `http://127.0.0.1:5000/api/games?date=${"2024-10-28"}`;
// // const API_URL = `https://nbareport.onrender.com/api/games?date=${getTodayDate()}`;
// // const API_URL = `http://127.0.0.1:5000/api/games?date=${getTodayDate()}`;

// const API_URL = `http://127.0.0.1:5000/api/games?date=${getTodayDate()}`;

// fetchTest();
// async function fetchTest() {
//     try {
//         const response = await fetch(API_URL);
//         if (!response.ok) {
//             throw new Error(`HTTP Error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         console.log(data);
//     } catch (error) {
//         console.error("Error fetching data: ", error);
//     }
// }

// fetchGameScores();
// setInterval(fetchGameScores, 60000);

// async function fetchGameScores(){
//     try{
//         const response = await fetch(API_URL);
//         if(!response.ok){
//             throw new Error(`HTTP Error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         console.log("Fetched data:", data);       
//          displayGameScores(data);
//     } catch (error){
//         console.error("Error fetching data: ", error);
//     }
// }

// function displayGameScores(data) {
//     const gameContainer = document.getElementById('game-scores');
//     gameContainer.innerHTML = '';

//     // Group data by GAME_ID
//     const gamesMap = {};

//     data.forEach(teamData => {
//         const gameId = teamData.GAME_ID;
//         if (!gamesMap[gameId]) {
//             gamesMap[gameId] = [];
//         }
//         gamesMap[gameId].push(teamData);
//     });

//     // Iterate over each game
//     Object.values(gamesMap).forEach(gameTeams => {
//         if (gameTeams.length !== 2) {
//             console.warn(`Both teams not found for game ID: ${gameTeams[0].GAME_ID}`);
//             return;
//         }

//         // Determine home and visitor teams
//         const [team1, team2] = gameTeams;
//         const homeTeam = team1.HOME_TEAM_ID === team1.TEAM_ID ? team1 : team2;
//         const visitorTeam = team1.HOME_TEAM_ID === team1.TEAM_ID ? team2 : team1;

//         const gameDiv = document.createElement('div');
//         gameDiv.className = 'game-card';

//         // Safely determine game status
//         const gameStatus = homeTeam.GAME_STATUS_TEXT || "Status Unknown";
//         const isGameInProgress = gameStatus && (gameStatus.includes('Q') || gameStatus.includes('Half'));


//         gameDiv.innerHTML = `
//             <h3>
//                 <span class="team-name">${homeTeam.TEAM_CITY_NAME} ${homeTeam.TEAM_NAME}</span>
//                 <span class="vs">vs.</span>
//                 <span class="team-name">${visitorTeam.TEAM_CITY_NAME} ${visitorTeam.TEAM_NAME}</span>
//             </h3>
//             <p>Score: ${homeTeam.PTS} - ${visitorTeam.PTS}</p>
//             <p>Status: ${gameStatus}</p>
//         `;

//         // Append live indicator if the game is in progress
//         if (isGameInProgress) {
//             const liveIndicator = document.createElement('span');
//             liveIndicator.className = 'live-indicator';
//             gameDiv.appendChild(liveIndicator);
//         }

//         gameDiv.addEventListener('click', () => {
//             window.location.href = `game.html?id=${homeTeam.GAME_ID}`;
//         });

//         gameContainer.appendChild(gameDiv);
//     });
// }

// Import API key if needed
import { API_KEY } from './config.js';

/// Function to get today's date in YYYY-MM-DD format
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
const todayDate = getTodayDate();
const isLocalhost = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
const API_URL = isLocalhost
    ? `http://127.0.0.1:5000/api/games?date=${todayDate}`
    : `https://nbareport.onrender.com/api/games?date=${todayDate}`;

// Initial fetch and interval for periodic updates
fetchGameScores();
setInterval(fetchGameScores, 60000);

async function fetchGameScores() {
    try {
        console.log("Attempting to fetch from:", API_URL); // Log the URL being called
        
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log("Response status:", response.status); // Log the response status
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error response:", errorText);
            throw new Error(`HTTP Error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Fetched data:", data);
        
        if (!Array.isArray(data)) {
            console.error("Received non-array data:", data);
            throw new Error("Received unexpected data format");
        }
        
        displayGameScores(data);
    } catch (error) {
        console.error("Error fetching data: ", error);
        // Display error message to user
        const gameContainer = document.getElementById('game-scores');
        gameContainer.innerHTML = `<div class="error-message">Error loading games: ${error.message}</div>`;
    }
}

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

    // Iterate over each game (each game should have exactly 2 teams)
    Object.values(gamesMap).forEach(gameTeams => {
        if (gameTeams.length !== 2) {
            console.warn(`Both teams not found for game ID: ${gameTeams[0].GAME_ID}`);
            return;
        }

        // Determine home and visitor teams based on IDs
        const [team1, team2] = gameTeams;
        const homeTeam = team1.HOME_TEAM_ID === team1.TEAM_ID ? team1 : team2;
        const visitorTeam = team1.HOME_TEAM_ID === team1.TEAM_ID ? team2 : team1;

        const gameDiv = document.createElement('div');
        gameDiv.className = 'game-card';

        // Get game status and progress info
        const gameStatus = homeTeam.GAME_STATUS_TEXT || "Status Unknown";
        const isGameInProgress = gameStatus && (gameStatus.includes('Q') || gameStatus.includes('Half'));

        // Populate game information
        gameDiv.innerHTML = `
            <h3>
                <span class="team-name">${homeTeam.TEAM_CITY_NAME} ${homeTeam.TEAM_NAME}</span>
                <span class="vs">vs.</span>
                <span class="team-name">${visitorTeam.TEAM_CITY_NAME} ${visitorTeam.TEAM_NAME}</span>
            </h3>
            <p>Score: ${homeTeam.PTS || 0} - ${visitorTeam.PTS || 0}</p>
            <p>Status: ${gameStatus}</p>
        `;

        // Append a live indicator if the game is in progress
        if (isGameInProgress) {
            const liveIndicator = document.createElement('span');
            liveIndicator.className = 'live-indicator';
            gameDiv.appendChild(liveIndicator);
        }

        // Add a click event to open a details page for each game
        gameDiv.addEventListener('click', () => {
            window.location.href = `game.html?id=${homeTeam.GAME_ID}`;
        });

        // Append gameDiv to the container
        gameContainer.appendChild(gameDiv);
    });
}

// Add event listener for button (if testing fetch separately)
document.getElementById("fetchFlaskData").addEventListener("click", fetchGameScores);


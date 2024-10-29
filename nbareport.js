
import { API_KEY } from './config.js';

// Function to get today's date in YYYY-MM-DD format
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const day = String(today.getDate()).padStart(2, '0') ;
    return `${year}-${month}-${day}`;
}

const todayDate = getTodayDate();
const API_URL = `https://api.balldontlie.io/v1/games?start_date=${todayDate}&end_date=${todayDate}`;

fetchGameScores();
setInterval(fetchGameScores, 60000);


async function fetchGameScores(){
    try{
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': API_KEY
            }
        });
        if(!response.ok){
            throw new Error(`HTTP Error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        displayGameScores(data)
    }catch (error){
        console.error("Error fetching data: ", error);
    }
}

function displayGameScores(data) {
    const gameContainer = document.getElementById('game-scores');
    gameContainer.innerHTML = '';
    
    data.data.forEach(game => {
        let gameStatus = '';
        let isGameInProgress = false; // Initialize the flag
        
        if (game.status === 'Final') {
            gameStatus = 'Final';
        } else if (game.period === 0 && game.status.includes("T")) { // Check for ISO format in status
            // Convert ISO time to a readable format
            const gameStartTime = new Date(game.status);
            if (!isNaN(gameStartTime)) { // Check if date parsing was successful
                const formattedTime = gameStartTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
                gameStatus = `Starts at: ${formattedTime}`;
            } else {
                gameStatus = 'Start time unavailable';
            }
        } else {
            isGameInProgress = true; // Game is in progress
            gameStatus = `In Progress - ${game.status}, ${game.time} left`;
        }

        const gameDiv = document.createElement('div');
        gameDiv.className = 'game-card'; 

        gameDiv.innerHTML = `
            <h3>
                <span class="team-name">${game.home_team.full_name}</span>
                <span class="vs">vs.</span>
                <span class="team-name">${game.visitor_team.full_name}</span>
            </h3>
            <p>Score: ${game.home_team_score} - ${game.visitor_team_score}</p>
            <p>${gameStatus}</p>
        `;

        // Append live indicator if the game is in progress
        if (isGameInProgress) {
            const liveIndicator = document.createElement('span');
            liveIndicator.className = 'live-indicator';
            gameDiv.appendChild(liveIndicator);
        }

        gameDiv.addEventListener('click', () => {
            window.location.href = `game.html?id=${game.id}`;
        });

        gameContainer.appendChild(gameDiv);
    });

    document.getElementById("fetchFlaskData").addEventListener("click", async () => {
        try {
            const testDate = "2024-10-28"; 
            const response = await fetch(`http://127.0.0.1:5000/api/games?date=${testDate}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
    
            // Display data in the flask-output div
            document.getElementById("flask-output").innerText = JSON.stringify(data, null, 2);
        } catch (error) {
            console.error("Error fetching data from Flask API:", error);
            document.getElementById("flask-output").innerText = "Error fetching data from Flask API";
        }
    });
    
}


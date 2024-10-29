const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get('id');

// Fetch and display game details if the ID is available
if (gameId) {
    fetch(`https://api.balldontlie.io/v1/games/${gameId}`)
        .then(response => response.json())
        .then(game => displayGameDetails(game))
        .catch(error => console.error("Error fetching game details:", error));
}


function displayGameDetails(game) {
    const gameDetailsContainer = document.getElementById('game-details');
    gameDetailsContainer.innerHTML = `
        <h2>${game.home_team.full_name} vs. ${game.visitor_team.full_name}</h2>
        <p>Score: ${game.home_team_score} - ${game.visitor_team_score}</p>
        <p>Status: ${game.status}</p>
        <!-- Add more details as needed -->
    `;
}

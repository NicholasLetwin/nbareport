from flask import Flask, jsonify, request, render_template, url_for
from flask_cors import CORS
from nba_api.stats.endpoints import ScoreboardV2
import pandas as pd
from datetime import datetime

app = Flask(__name__)

CORS(app, resources={
    r"/api/*": {
        "origins": ["http://127.0.0.1:5500", "https://nbareport.onrender.com"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/game.html')
def game_page():
    return render_template('game.html')

@app.route('/api/games', methods=['GET'])
def get_games():
    date_str = request.args.get('date')
    game_id = request.args.get('gameId')  # Get the gameId parameter if provided

    # Default to today's date if no date is provided
    if not date_str:
        date_str = datetime.now().strftime('%Y-%m-%d')

    try:
        # Format the date for the NBA API
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        formatted_date = date_obj.strftime('%m/%d/%Y')

        # Fetch game data
        games = ScoreboardV2(game_date=formatted_date)
        game_header = games.game_header.get_data_frame()
        line_score = games.line_score.get_data_frame()

        # Merge data
        merged_data = pd.merge(line_score, game_header, on='GAME_ID', how='left')
        data = merged_data.to_dict(orient='records')

        # If gameId is provided, filter the data to return only the specific game
        if game_id:
            data = [game for game in data if game['GAME_ID'] == game_id]

        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Health check route
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True)

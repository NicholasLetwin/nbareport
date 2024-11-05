from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from nba_api.stats.endpoints import ScoreboardV2, BoxScoreTraditionalV2
import pandas as pd
from datetime import datetime
import numpy as np
import traceback
import time
import requests

app = Flask(__name__)

CORS(app, resources={
    r"/api/*": {
        "origins": ["http://127.0.0.1:5500", "https://nbareport.onrender.com"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

@app.route('/api/games', methods=['GET'])
def get_games():
    date_str = request.args.get('date')
    game_id = request.args.get('gameId')  # Get the gameId parameter if provided

    # Default to today's date if no date is provided
    if not date_str:
        date_str = datetime.now().strftime('%Y-%m-%d')

    # Attempt to fetch data with retry logic
    max_retries = 3
    retry_delay = 5  # Delay between retries in seconds
    formatted_date = datetime.strptime(date_str, '%Y-%m-%d').strftime('%m/%d/%Y')
    
    for attempt in range(max_retries):
        try:
            # Fetch game data for the specified date
            games = ScoreboardV2(game_date=formatted_date, timeout=15)  # Add timeout parameter
            game_header = games.game_header.get_data_frame()
            line_score = games.line_score.get_data_frame()

            # Merge data
            merged_data = pd.merge(line_score, game_header, on='GAME_ID', how='left')
            merged_data = merged_data.replace({np.nan: None})  # Replace NaN values with None
            data = merged_data.to_dict(orient='records')

            # Filter by gameId if it is provided
            if game_id:
                data = [game for game in data if game['GAME_ID'] == game_id]

            return jsonify(data)
        
        except requests.exceptions.Timeout:
            print(f"Timeout encountered for attempt {attempt + 1}/{max_retries}. Retrying...")
            time.sleep(retry_delay)  # Delay before retrying

        except Exception as e:
            print("Unexpected error:", e)
            traceback.print_exc()
            return jsonify({'error': str(e)}), 500
    
    # Return error response if max retries reached
    return jsonify({'error': 'Request to NBA API timed out after multiple attempts.'}), 500

@app.route('/api/player_stats', methods=['GET'])
def get_player_stats():
    game_id = request.args.get('gameId')
    
    if not game_id:
        return jsonify({"error": "Missing gameId parameter"}), 400

    try:
        print("Fetching BoxScoreTraditionalV2 for game ID:", game_id)
        box_score = BoxScoreTraditionalV2(game_id=game_id, timeout=15)  # Add timeout here as well

        player_stats_df = box_score.player_stats.get_data_frame()
        player_stats_df = player_stats_df[['PLAYER_NAME', 'TEAM_ID', 'PTS', 'AST', 'REB', 'MIN', 'FGM', 'FGA', 'FG3M', 'FG3A', 'FTM', 'FTA', 'TO']]
        player_stats_df = player_stats_df.replace({np.nan: None})  # Replace NaN values with None
        player_stats = player_stats_df.to_dict(orient='records')

        return jsonify(player_stats)
    except requests.exceptions.Timeout:
        print("Timeout encountered in fetching player stats.")
        return jsonify({'error': 'Request to NBA API timed out for player stats.'}), 500
    except Exception as e:
        print("Error encountered in fetching BoxScoreTraditionalV2:", e)
        traceback.print_exc()
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

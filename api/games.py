# api/games.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from nba_api.stats.endpoints import ScoreboardV2
import pandas as pd
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://127.0.0.1:5500", "https://nbareport.vercel.app"]}})

@app.route('/api/games', methods=['GET'])
def get_games():
    date_str = request.args.get('date')
    if not date_str:
        date_str = datetime.now().strftime('%Y-%m-%d')  # Default to today's date

    try:
        # Format the date for the NBA API
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        formatted_date = date_obj.strftime('%m/%d/%Y')

        # Fetch game data
        games = ScoreboardV2(game_date=formatted_date)
        game_header = games.game_header.get_data_frame()
        line_score = games.line_score.get_data_frame()

        # Merge and structure data
        merged_data = pd.merge(line_score, game_header, on='GAME_ID', how='left')
        data = merged_data.to_dict(orient='records')
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Export as a handler for Vercel
def handler(request):
    return app(request)

# from flask import Flask, jsonify, request
# from flask_cors import CORS
# from nba_api.stats.endpoints import ScoreboardV2
# import pandas as pd
# from datetime import datetime


# app = Flask(__name__)
# # CORS(app, resources={r"/api/*": {"origins": "http://127.0.0.1:5500"}})  # Only allow requests from your frontend
# CORS(app, supports_credentials=True)

# # @app.route('/')
# # def index():
# #     return 'Flask app is running!'


# @app.route('/api/games')
# def get_games():
#     date_str = request.args.get('date')
#     if not date_str:
#         date_str = get_today_date()  # 'YYYY-MM-DD'
#     try:
#         from datetime import datetime
#         date_obj = datetime.strptime(date_str, '%Y-%m-%d')
#         date = date_obj.strftime('%m/%d/%Y')  # Convert to 'MM/DD/YYYY' for ScoreboardV2

#         games = ScoreboardV2(game_date=date)
#         game_header = games.game_header.get_data_frame()
#         line_score = games.line_score.get_data_frame()
#         # Merge game header and line score data
#         merged_data = pd.merge(line_score, game_header, on='GAME_ID', how='left')


#         data = merged_data.to_dict(orient='records')
#         return jsonify(data)
#     except Exception as e:
#         print(f'Error occurred: {e}')
#         return jsonify({'error': str(e)}), 500


# def get_today_date():
#     return datetime.now().strftime('%Y-%m-%d')  # Keep this as 'YYYY-MM-DD'

# if __name__ == '__main__':
#     app.run(debug=True)

from flask import Flask, jsonify, request
from flask_cors import CORS
from nba_api.stats.endpoints import ScoreboardV2
import pandas as pd
from datetime import datetime
import os

app = Flask(__name__)
# Allow both local development and production URLs
CORS(app)

@app.route('/api/games')
def get_games():
    date_str = request.args.get('date')
    if not date_str:
        date_str = datetime.now().strftime('%Y-%m-%d')  # Default to today's date
    
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        formatted_date = date_obj.strftime('%m/%d/%Y')

        games = ScoreboardV2(game_date=formatted_date)
        game_header = games.game_header.get_data_frame()
        line_score = games.line_score.get_data_frame()
        
        merged_data = pd.merge(line_score, game_header, on='GAME_ID', how='left')
        data = merged_data.to_dict(orient='records')
        return jsonify(data)
    except Exception as e:
        print(f'Error occurred: {e}')
        return jsonify({'error': str(e)}), 500

# For production deployment on Render
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
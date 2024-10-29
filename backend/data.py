from flask import Flask, jsonify, request
from flask_cors import CORS
from nba_api.stats.endpoints import ScoreboardV2

app = Flask(__name__)
# CORS(app, resources={r"/api/*": {"origins": "http://127.0.0.1:5500"}})  # Only allow requests from your frontend
CORS(app, supports_credentials=True)

# @app.route('/')
# def index():
#     return 'Flask app is running!'


@app.route('/api/games')
def get_games():
    date_str = request.args.get('date')
    if not date_str:
        date_str = get_today_date()  # 'YYYY-MM-DD'
    try:
        from datetime import datetime
        print(f"Received date_str: {date_str}")
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        date = date_obj.strftime('%m/%d/%Y')  # Convert to 'MM/DD/YYYY' for ScoreboardV2
        print(f"Formatted date for ScoreboardV2: {date}")

        games = ScoreboardV2(game_date=date)
        print("Successfully called ScoreboardV2")
        data_frames = games.get_data_frames()
        print(f"Number of data frames received: {len(data_frames)}")
        if len(data_frames) > 1:
            data = data_frames[1].to_dict(orient='records')
            print(f"Data to be returned: {data}")
            return jsonify(data)
        else:
            print("No game data available for the specified date.")
            return jsonify({'error': 'No game data available for the specified date.'}), 404
    except Exception as e:
        # Log the error for debugging
        print(f'Error occurred: {e}')
        return jsonify({'error': str(e)}), 500


def get_today_date():
    from datetime import datetime
    return datetime.now().strftime('%Y-%m-%d')  # Keep this as 'YYYY-MM-DD'

# if __name__ == '__main__':
#     app.run(debug=True)

from flask import Flask, jsonify, request
from flask_cors import CORS
from nba_api.stats.endpoints import ScoreboardV2
from datetime import datetime


date_str = '2023-11-03'
try:
    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
    date = date_obj.strftime('%m/%d/%Y')  # 'MM/DD/YYYY'
    print(f"Formatted date: {date}")

    games = ScoreboardV2(game_date=date)
    print("Successfully called ScoreboardV2")
    data_frames = games.get_data_frames()
    print(f"Number of data frames received: {len(data_frames)}")
    if len(data_frames) > 1:
        data = data_frames[1].to_dict(orient='records')
        print(f"Game data: {data}")
    else:
        print("No game data available for the specified date.")
except Exception as e:
    print(f'Error occurred: {e}')

# utils/game_state.py

import json
from pathlib import Path

class GameState:
    def __init__(self, question_file_path):
        self.players = []  # List of dicts: {id, name, score}
        self.current_question_index = 0
        self.questions = self._load_questions(question_file_path)

    def _load_questions(self, path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    def set_players(self, names):
        self.players = [{"id": i+1, "name": name, "score": 0} for i, name in enumerate(names)]

    def get_current_question(self):
        if self.current_question_index < len(self.questions):
            return self.questions[self.current_question_index]
        return None
    
    def reset_game(self):
        self.current_question_index = 0

    def next_question(self):
        if self.current_question_index + 1 < len(self.questions):
            self.current_question_index += 1
            return True
        return False  # No more questions

    def add_points(self, player_id, points):
        for player in self.players:
            if player["id"] == player_id:
                player["score"] += points
                return player
        return None

    def get_players(self):
        return self.players

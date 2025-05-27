from app.question_loader import load_questions, get_random_question

# === Game State === #

class GameState:
    def __init__(self):
        self.teams = {"Team A": 0, "Team B": 0}
        self.current_question = None
        self.round = 0
        self.chaos_mode = False

    def add_points(self, team, points):
        if team in self.teams:
            self.teams[team] += points

    def toggle_chaos(self):
        self.chaos_mode = not self.chaos_mode

# === Controller === #

state = GameState()
questions = load_questions()


def get_next_question():
    state.current_question = get_random_question(questions)
    print(state.current_question)
    return state.current_question

def add_points(team, points):
    state.add_points(team, points)

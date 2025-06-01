from flask import Flask, render_template, request, redirect, session, jsonify, Blueprint, url_for
from utils.game_state import GameState

app_bp = Blueprint("game", __name__)

# Global game instance
game = GameState("data/questions.json")

@app_bp.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@app_bp.route("/start_game", methods=["POST"])
def start_game():
    players = []
    for i in range(1, 10):
        name = request.form.get(f"player{i}")
        if name:
            players.append(name)
    game.set_players(players) 
    game.reset_game()
    return redirect(url_for("game.game_view"))


# ------ In Game ----- #
@app_bp.route("/game")
def game_view():
    question = game.get_current_question()
    players = game.get_players()
    return render_template("game.html", question=question, players=players)

@app_bp.route("/reveal_answer")
def reveal_answer():
    question = game.get_current_question()
    return jsonify(question)

@app_bp.route("/next_question", methods=["POST"])
def next_question():
    if game.next_question():
        return jsonify({"success": True})
    return jsonify({"success": False})

@app_bp.route("/update_score", methods=["POST"])
def update_score():
    data = request.get_json()
    player_id = int(data["player_id"])
    delta = int(data["delta"])
    player = game.add_points(player_id, delta)
    return jsonify({"success": True, "player": player})

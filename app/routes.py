from flask import Blueprint, render_template, jsonify
from .game_controller import get_next_question, state, add_points

game_bp = Blueprint("game", __name__)

@game_bp.route("/")
def index():
    return render_template("game.html")

@game_bp.route("/api/points/<team>/<int:points>", methods=["POST"])
def update_points(team, points):
    add_points(team, points)
    return jsonify(state.teams)

@game_bp.route("/api/question")
def api_question():
    question = get_next_question()
    return jsonify(question)

@game_bp.route("/api/state")
def get_state():
    return jsonify({
        "teams": state.teams,
        "round": state.round,
        "chaos": state.chaos_mode
    })

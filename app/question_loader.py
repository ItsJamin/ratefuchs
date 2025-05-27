import json
import random
import os

# Path to the question file
QUESTIONS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "questions.json")

def load_questions():
    """Load all questions from the JSON file."""
    with open(QUESTIONS_FILE, encoding="utf-8") as f:
        return json.load(f)

def get_random_question(questions, qtype=None):
    print("DASAAAAA")
    """Return a random question, optionally filtered by type."""
    if qtype:
        filtered = [q for q in questions if q.get("type") == qtype]
    else:
        filtered = questions

    if not filtered:
        raise ValueError(f"No questions found for type: {qtype}")

    return random.choice(filtered)

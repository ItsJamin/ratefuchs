from flask import Flask

def create_app():
    app = Flask(__name__)
    app.secret_key = "super-secret-key"  # For session usage
    
    from .routes import app_bp
    app.register_blueprint(app_bp)

    return app
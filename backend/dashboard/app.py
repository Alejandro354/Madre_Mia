"""App factory del backend del dashboard/reportes.

Se monta como una app más dentro del gateway (ver gateway/run.py), igual que
innovacion-social, practicaya y practicantes.
"""
import os

from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from routes.dashboard_routes import dashboard_bp
from routes.reportes_routes import reportes_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})

    app.register_blueprint(dashboard_bp)
    app.register_blueprint(reportes_bp)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    return app


if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    create_app().run(host="0.0.0.0", port=5000, debug=debug)

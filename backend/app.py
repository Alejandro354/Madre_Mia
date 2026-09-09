"""App factory del backend del dashboard.

Ejecutable de forma independiente para desarrollo/pruebas, o puedes registrar
los blueprints en tu app Flask existente:

    from routes.dashboard_routes import dashboard_bp
    from routes.reportes_routes import reportes_bp
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(reportes_bp)
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
    # FIX: debug=True estaba fijo en el código. Si alguien ejecuta este
    # archivo directamente en un servidor real (en vez de solo integrarlo
    # como blueprints, tal como sugiere el docstring), quedaría con el
    # debugger interactivo de Werkzeug expuesto — ejecución remota de código
    # para cualquiera que lo alcance. Ahora depende de FLASK_DEBUG y es
    # False por defecto.
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    create_app().run(host="0.0.0.0", port=5000, debug=debug)

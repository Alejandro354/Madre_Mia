import os
import time

from flask import Flask, g, jsonify, send_from_directory
from werkzeug.exceptions import RequestEntityTooLarge

from config import Config
from extensions import cors, db, jwt


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    db.init_app(app)
    jwt.init_app(app)
    # expose_headers: sin esto el navegador no deja leer X-Response-Time cuando
    # el front no va por el proxy de Vite (mismo origen) sino cross-origin.
    cors.init_app(app, expose_headers=["X-Response-Time"])

    from applications import applications_bp
    from auth import auth_bp
    from favorites import favorites_bp
    from portfolio import portfolio_bp
    from profile import profile_bp
    from socials import socials_bp
    from vacancies import vacancies_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(vacancies_bp)
    app.register_blueprint(portfolio_bp)
    app.register_blueprint(socials_bp)
    app.register_blueprint(applications_bp)
    app.register_blueprint(favorites_bp)

    @app.route("/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    # Tiempo de servidor en cada respuesta. Permite separar, en la pestaña
    # Network, cuánto tardó el backend de cuánto tardaron red y render
    # (criterios de aceptación 2.1 y 3.4).
    @app.before_request
    def _start_timer():
        g._t0 = time.perf_counter()

    @app.after_request
    def _add_response_time(response):
        t0 = g.pop("_t0", None)
        if t0 is not None:
            response.headers["X-Response-Time"] = f"{(time.perf_counter() - t0) * 1000:.1f}ms"
        return response

    @app.errorhandler(RequestEntityTooLarge)
    def handle_too_large(e):
        return (
            jsonify(
                {
                    "errors": {
                        "file": "El archivo supera el tamaño máximo permitido"
                    }
                }
            ),
            413,
        )

    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({"errors": {"general": "Recurso no encontrado"}}), 404

    with app.app_context():
        db.create_all()

    return app


if __name__ == "__main__":
    create_app().run(host="0.0.0.0", port=5000, debug=True)

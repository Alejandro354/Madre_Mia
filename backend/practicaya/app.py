import os
import time

from flask import Flask, g, jsonify, send_from_directory
from werkzeug.exceptions import RequestEntityTooLarge

from config import Config
from extensions import cors, db, jwt, socketio


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, expose_headers=["X-Response-Time"])
    socketio.init_app(app, cors_allowed_origins="*")

    # ── Register Blueprints ──
    from auth import auth_bp
    from student import student_bp
    from company import company_bp
    from vacancies import vacancies_bp
    from portfolio import portfolio_bp
    from socials import socials_bp
    from applications import applications_bp
    from favorites import favorites_bp
    from chat import chat_bp
    from notifications import notifications_bp
    from admin import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(company_bp)
    app.register_blueprint(vacancies_bp)
    app.register_blueprint(portfolio_bp)
    app.register_blueprint(socials_bp)
    app.register_blueprint(applications_bp)
    app.register_blueprint(favorites_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(admin_bp)

    # ── Static uploads ──
    @app.route("/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    # ── Response time header ──
    @app.before_request
    def _start_timer():
        g._t0 = time.perf_counter()

    @app.after_request
    def _add_response_time(response):
        t0 = g.pop("_t0", None)
        if t0 is not None:
            response.headers["X-Response-Time"] = f"{(time.perf_counter() - t0) * 1000:.1f}ms"
        return response

    # ── Error handlers ──
    @app.errorhandler(RequestEntityTooLarge)
    def handle_too_large(e):
        return jsonify({"msg": "El archivo supera el tamaño máximo permitido"}), 413

    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({"msg": "Recurso no encontrado"}), 404

    # ── Create tables ──
    with app.app_context():
        db.create_all()

    return app


if __name__ == "__main__":
    app = create_app()
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, allow_unsafe_werkzeug=True)

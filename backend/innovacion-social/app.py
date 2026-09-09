import os

from flask import Flask, send_from_directory
from flask_cors import CORS

from auth import auth_bp
from blog import blog_bp
from admin import admin_bp
from models import db

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    os.makedirs(app.instance_path, exist_ok=True)

    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(app.instance_path, 'cdn_blog.db')}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET'] = os.environ.get('JWT_SECRET', 'dev-secret-cambiar-en-produccion')
    app.config['UPLOAD_FOLDER'] = os.path.join(BASE_DIR, 'uploads')

    CORS(app)
    db.init_app(app)

    with app.app_context():
        db.create_all()

    app.register_blueprint(auth_bp)
    app.register_blueprint(blog_bp)
    app.register_blueprint(admin_bp)

    @app.route('/uploads/<path:filename>')
    def uploads(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    return app


app = create_app()

if __name__ == '__main__':
    app.run(port=5000, debug=True)

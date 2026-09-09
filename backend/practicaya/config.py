import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "super-secret-key-practicaya")
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(basedir, "practicaya.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get(
        "JWT_SECRET_KEY", "jwt-super-secret-key-practicaya"
    )
    JWT_ACCESS_TOKEN_EXPIRES = 30 * 60          # 30 minutos
    JWT_REFRESH_TOKEN_EXPIRES = 7 * 24 * 60 * 60  # 7 días
    UPLOAD_FOLDER = os.path.join(basedir, "uploads")
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024       # 10 MB
    MAX_PHOTO_SIZE = 5 * 1024 * 1024            # 5 MB
    MAX_PORTFOLIO_SIZE = 10 * 1024 * 1024       # 10 MB
    ALLOWED_PHOTO_EXTENSIONS = {"jpg", "jpeg", "png"}
    ALLOWED_PORTFOLIO_EXTENSIONS = {"pdf", "jpg", "jpeg", "png"}

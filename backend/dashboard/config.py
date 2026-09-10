"""Configuración central del backend del dashboard."""
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Config:
    # Cada dominio conserva su propia base SQLite (las mismas que usan sus
    # backends). Se pueden reemplazar por rutas absolutas mediante variables
    # de entorno en despliegues externos.
    PRACTICAYA_DB_PATH = os.environ.get(
        "PRACTICAYA_DB_PATH", os.path.join(BASE_DIR, "practicaya", "practicaya.db")
    )
    PRACTICANTES_DB_PATH = os.environ.get(
        "PRACTICANTES_DB_PATH", os.path.join(BASE_DIR, "practicantes", "data", "practicantes.db")
    )

    # Misma clave que usa el backend de innovacion-social para firmar sus JWT
    # (ver backend/innovacion-social/app.py), así la sesión del admin del
    # sitio también sirve para entrar al panel de reportes.
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET", "dev-secret-cambiar-en-produccion")

    # Orígenes permitidos para CORS (frontend Vite).
    CORS_ORIGINS = os.environ.get(
        "CORS_ORIGINS", "http://localhost:5173"
    ).split(",")

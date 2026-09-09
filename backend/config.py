"""Configuración central del backend del dashboard."""
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Config:
    # Cada dominio conserva su propia base SQLite. Se pueden reemplazar por
    # rutas absolutas mediante variables de entorno en despliegues externos.
    PRACTICAYA_DB_PATH = os.environ.get(
        "PRACTICAYA_DB_PATH", os.path.join(BASE_DIR, "practicaya.db")
    )
    PRACTICANTES_DB_PATH = os.environ.get(
        "PRACTICANTES_DB_PATH", os.path.join(BASE_DIR, "practicantes.db")
    )

    # Orígenes permitidos para CORS (frontend Vite).
    CORS_ORIGINS = os.environ.get(
        "CORS_ORIGINS", "http://localhost:5173"
    ).split(",")

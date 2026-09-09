"""Gateway: monta los tres backends (innovacion-social, practicaya,
practicantes) como un solo proceso WSGI en un solo puerto, sin fusionar su
código. Cada uno mantiene su propia base de datos, su propio secreto/JWT y
su propio CORS — esto solo combina cómo se sirven.

Los tres backends usan imports "planos" (from models import X, asumiendo
su propia carpeta como raíz de sys.path) y varios se llaman igual entre sí
(app.py, models.py, auth.py). Por eso cada uno se importa en un bloque
aislado: se agrega su carpeta a sys.path, se importa, se captura la app ya
construida, y luego se limpian de sys.modules los nombres que quedaron
cargados antes de pasar al siguiente backend — así el segundo "from models
import X" no termina resolviendo al models.py del primero.
"""

import sys
from pathlib import Path

from werkzeug.middleware.dispatcher import DispatcherMiddleware
from werkzeug.serving import run_simple

GATEWAY_DIR = Path(__file__).resolve().parent
BACKEND_DIR = GATEWAY_DIR.parent / "backend"

INNOVACION_SOCIAL_BACKEND = BACKEND_DIR / "innovacion-social"
PRACTICAYA_BACKEND = BACKEND_DIR / "practicaya"
PRACTICANTES_BACKEND = BACKEND_DIR / "practicantes"

# Nombres de módulos de nivel superior que cada backend deja registrados en
# sys.modules al importarse (directos + los que sus propios archivos
# importan de forma plana). Se limpian después de capturar la app.
INNOVACION_MODULES = ["app", "auth", "blog", "admin", "models"]
PRACTICAYA_MODULES = [
    "app", "config", "extensions", "auth", "student", "company", "vacancies",
    "portfolio", "socials", "applications", "favorites", "chat",
    "notifications", "admin", "models", "helpers", "utils",
]
PRACTICANTES_MODULES = ["app", "database"]


def _load_flask_app(backend_dir, module_names, factory_attr=None):
    """Importa app.py de una carpeta de backend en aislamiento y devuelve
    la instancia de Flask ya construida (llamando a create_app() si aplica),
    limpiando después los nombres de módulo para no chocar con el siguiente
    backend que se cargue."""
    path_str = str(backend_dir)
    sys.path.insert(0, path_str)
    try:
        import app as backend_app_module  # noqa: PLC0415 (import intencional en runtime)
        if factory_attr:
            flask_app = getattr(backend_app_module, factory_attr)()
        else:
            flask_app = backend_app_module.app
    finally:
        if path_str in sys.path:
            sys.path.remove(path_str)
        for name in module_names:
            sys.modules.pop(name, None)
    return flask_app


def build_gateway():
    innovacion_app = _load_flask_app(INNOVACION_SOCIAL_BACKEND, INNOVACION_MODULES)
    practicaya_app = _load_flask_app(
        PRACTICAYA_BACKEND, PRACTICAYA_MODULES, factory_attr="create_app"
    )

    # practicantes no usa una fábrica create_app(): construye `app` a nivel
    # de módulo y solo inicializa su base de datos dentro de su propio
    # `if __name__ == "__main__":`. Como aquí no se ejecuta ese bloque,
    # replicamos ese único paso (init_db es aditivo/seguro, no borra datos).
    path_str = str(PRACTICANTES_BACKEND)
    sys.path.insert(0, path_str)
    try:
        import database as practicantes_database
        practicantes_database.init_db()
        import app as practicantes_app_module
        practicantes_app = practicantes_app_module.app
    finally:
        if path_str in sys.path:
            sys.path.remove(path_str)
        for name in PRACTICANTES_MODULES:
            sys.modules.pop(name, None)

    application = DispatcherMiddleware(innovacion_app, {
        "/practicaya": practicaya_app,
        "/practicantes": practicantes_app,
    })
    return application


if __name__ == "__main__":
    application = build_gateway()
    print("Gateway corriendo en http://localhost:5000")
    print("  /              -> backend/innovacion-social")
    print("  /practicaya    -> backend/practicaya")
    print("  /practicantes  -> backend/practicantes")
    run_simple(
        "0.0.0.0",
        5000,
        application,
        use_reloader=False,
        use_debugger=True,
        threaded=True,
    )

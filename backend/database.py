import sqlite3
from datetime import datetime
from pathlib import Path
from werkzeug.security import generate_password_hash

BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / "data" / "practicantes.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    nombre TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS practicantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    tipo_documento TEXT NOT NULL DEFAULT 'Cédula de ciudadanía',
    documento TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    telefono TEXT,
    foto TEXT,
    cohorte TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'Activo'
);

CREATE TABLE IF NOT EXISTS documentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    practicante_id INTEGER NOT NULL REFERENCES practicantes(id),
    nombre_original TEXT NOT NULL,
    nombre_archivo TEXT NOT NULL,
    tipo TEXT NOT NULL,
    tamano_kb REAL NOT NULL,
    creado_en TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS notas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    practicante_id INTEGER NOT NULL REFERENCES practicantes(id),
    criterio TEXT NOT NULL,
    periodo TEXT NOT NULL,
    valor REAL NOT NULL,
    creado_en TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS observaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    practicante_id INTEGER NOT NULL REFERENCES practicantes(id),
    texto TEXT NOT NULL,
    autor TEXT NOT NULL,
    creado_en TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS avances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    practicante_id INTEGER NOT NULL REFERENCES practicantes(id),
    descripcion TEXT NOT NULL,
    nombre_original TEXT NOT NULL,
    nombre_archivo TEXT NOT NULL,
    tipo TEXT NOT NULL,
    creado_en TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS historial (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    practicante_id INTEGER NOT NULL REFERENCES practicantes(id),
    evento TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    creado_en TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);
"""

SEED_ADMIN = ("admin", "admin123", "Frank")

# nombres, apellidos, tipo_documento, documento, email, password, telefono, cohorte, estado
SEED_PRACTICANTES = [
    ("Mariana", "Zapata", "Cédula de ciudadanía", "1035421098", "mariana.zapata@correo.com", "1234", "3011234567", "Cohorte 2026-1", "Activo"),
    ("Julián", "Restrepo", "Cédula de ciudadanía", "1128940012", "julian.restrepo@correo.com", "1234", "3022345678", "Cohorte 2026-1", "Activo"),
    ("Valentina", "Ríos", "Tarjeta de identidad", "1042778821", "valentina.rios@correo.com", "1234", "3033456789", "Cohorte 2025-2", "Finalizado"),
    ("Samuel", "Correa", "Cédula de ciudadanía", "1017663345", "samuel.correa@correo.com", "1234", "3044567890", "Cohorte 2026-1", "En pausa"),
    ("Luis", "Álvarez", "Cédula de ciudadanía", "1007894561", "luis.alvarez@correo.com", "1234", "3015557788", "Cohorte 2026-1", "Activo"),
    ("Camila", "Torres", "Cédula de ciudadanía", "1029887744", "camila.torres@correo.com", "1234", "3187654321", "Cohorte 2026-2", "Activo"),
    ("Andrés", "Gómez", "Tarjeta de identidad", "1050112233", "andres.gomez@correo.com", "1234", "3159998877", "Cohorte 2025-2", "Finalizado"),
]


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _esquema_desactualizado(conn) -> bool:
    """Detecta si existe una base de datos de una versión anterior
    (por ejemplo, con la columna 'nombre' en vez de 'nombres'/'apellidos')."""
    tablas = {r["name"] for r in conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    ).fetchall()}
    if "practicantes" not in tablas:
        return False
    columnas = {r["name"] for r in conn.execute("PRAGMA table_info(practicantes)").fetchall()}
    columnas_requeridas = {"nombres", "apellidos", "tipo_documento", "telefono", "foto"}
    return not columnas_requeridas.issubset(columnas)


def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = get_connection()

    if _esquema_desactualizado(conn):
        conn.close()
        respaldo = DB_PATH.with_name(f"practicantes.viejo.{datetime.now().strftime('%Y%m%d%H%M%S')}.db")
        DB_PATH.rename(respaldo)
        print(f"[info] Base de datos de una versión anterior detectada. "
              f"Se movió a: {respaldo.name} y se creó una nueva.")
        conn = get_connection()

    conn.executescript(SCHEMA)

    if conn.execute("SELECT COUNT(*) AS n FROM admins").fetchone()["n"] == 0:
        usuario, password, nombre = SEED_ADMIN
        conn.execute(
            "INSERT INTO admins (usuario, password_hash, nombre) VALUES (?, ?, ?)",
            (usuario, generate_password_hash(password), nombre),
        )

    total_antes = conn.execute("SELECT COUNT(*) AS n FROM practicantes").fetchone()["n"]

    # Siembra aditiva: si ya tienes practicantes guardados, esto NO los borra ni
    # los duplica — solo agrega los de la lista que todavía no existan (por
    # documento o correo). Así puedes agregar usuarios de prueba nuevos sin
    # perder los datos que ya generaste probando la app.
    for nombres, apellidos, tipo_doc, documento, email, password, telefono, cohorte, estado in SEED_PRACTICANTES:
        conn.execute(
            """INSERT OR IGNORE INTO practicantes
               (nombres, apellidos, tipo_documento, documento, email, password_hash, telefono, cohorte, estado)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (nombres, apellidos, tipo_doc, documento, email, generate_password_hash(password), telefono, cohorte, estado),
        )
    conn.commit()

    if total_antes == 0:
        primero = conn.execute("SELECT id FROM practicantes ORDER BY id LIMIT 1").fetchone()["id"]
        conn.execute(
            "INSERT INTO historial (practicante_id, evento, descripcion) VALUES (?, ?, ?)",
            (primero, "Registro creado", "El perfil del practicante fue creado en el sistema."),
        )
        conn.execute(
            "INSERT INTO notas (practicante_id, criterio, periodo, valor) VALUES (?, ?, ?, ?)",
            (primero, "Compromiso y puntualidad", "Corte 1", 4.5),
        )

    conn.commit()
    conn.close()

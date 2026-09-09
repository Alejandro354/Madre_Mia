"""Acceso coordinado a las dos bases SQLite del dashboard."""
import sqlite3

from config import Config


def get_connection():
    """Abre practicaya y adjunta la base de practicantes."""
    conn = sqlite3.connect(Config.PRACTICAYA_DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("ATTACH DATABASE ? AS practicantes", (Config.PRACTICANTES_DB_PATH,))
    return conn


def rows_to_dicts(rows):
    """Convierte una lista de sqlite3.Row en una lista de dicts serializables."""
    return [dict(r) for r in rows]


def query_all(sql, params=()):
    """Ejecuta un SELECT parametrizado y devuelve todas las filas como dicts."""
    conn = get_connection()
    try:
        cur = conn.execute(sql, params)
        return rows_to_dicts(cur.fetchall())
    finally:
        conn.close()


def query_one(sql, params=()):
    """Ejecuta un SELECT parametrizado y devuelve la primera fila (dict) o None."""
    conn = get_connection()
    try:
        cur = conn.execute(sql, params)
        row = cur.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()



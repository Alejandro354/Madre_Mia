"""Sincroniza las columnas de detalle de `vacancies` SIN borrar la base.

El proyecto no usa migraciones y `seed.py` hace drop/create (borra usuarios).
Este script usa ALTER TABLE ADD/DROP COLUMN, que SQLite sí soporta, para
conservar cuentas, perfiles, portafolios y postulaciones existentes.

Es idempotente: se puede correr varias veces sin efecto. Deja la tabla con las
columnas de NEW_COLUMNS y sin las de DROPPED_COLUMNS, venga del estado que venga.

    python migrate_vacancy_detail.py
"""

import os
import sqlite3

from config import Config

# Columnas que este script llegó a crear y que ya no se usan. Se eliminan si
# están presentes (SQLite soporta DROP COLUMN desde 3.35).
DROPPED_COLUMNS = ["salario"]

# (nombre, tipo SQL) — todas nullable, así las filas existentes siguen válidas.
NEW_COLUMNS = [
    ("fecha_limite", "DATE"),
    ("skills", "TEXT"),
    ("experiencia", "VARCHAR(100)"),
    ("nivel_estudios", "VARCHAR(100)"),
    ("area", "VARCHAR(100)"),
    ("industria", "VARCHAR(100)"),
]

# Datos de ejemplo por cargo, para que las vacantes ya sembradas no queden
# vacías en la pantalla de detalle.
SAMPLE = {
    "Desarrollador Frontend Junior": {
        "fecha_limite": "2026-10-15",
        "skills": "React, JavaScript, HTML, CSS, Git",
        "experiencia": "1 - 2 años",
        "nivel_estudios": "Profesional / Técnico",
        "area": "Desarrollo",
        "industria": "Tecnología",
    },
    "Analista de Datos": {
        "fecha_limite": "2026-10-30",
        "skills": "SQL, Excel, Python, Power BI",
        "experiencia": "2 - 3 años",
        "nivel_estudios": "Profesional",
        "area": "Datos",
        "industria": "Retail",
    },
    "Diseñador Gráfico": {
        "fecha_limite": "2026-09-30",
        "skills": "Illustrator, Photoshop, Figma, Branding",
        "experiencia": "1 - 2 años",
        "nivel_estudios": "Técnico / Tecnólogo",
        "area": "Diseño",
        "industria": "Publicidad",
    },
    "Practicante de Finanzas": {
        "fecha_limite": "2026-11-20",
        "skills": "Excel, Análisis financiero, Conciliaciones",
        "experiencia": "Sin experiencia",
        "nivel_estudios": "Estudiante últimos semestres",
        "area": "Finanzas",
        "industria": "Servicios financieros",
    },
}


def db_path():
    uri = Config.SQLALCHEMY_DATABASE_URI
    prefix = "sqlite:///"
    if not uri.startswith(prefix):
        raise SystemExit(f"Este script solo soporta SQLite, no {uri!r}")
    return uri[len(prefix) :]


def run():
    path = db_path()
    if not os.path.exists(path):
        raise SystemExit(f"No existe la base {path}. Corre `python seed.py` primero.")

    con = sqlite3.connect(path)
    cur = con.cursor()

    existing = {row[1] for row in cur.execute("PRAGMA table_info(vacancies)")}

    added = []
    for name, sql_type in NEW_COLUMNS:
        if name in existing:
            continue
        cur.execute(f"ALTER TABLE vacancies ADD COLUMN {name} {sql_type}")
        added.append(name)

    if added:
        print("Columnas agregadas:", ", ".join(added))
    else:
        print("Las columnas ya existían; nada que agregar.")

    dropped = []
    for name in DROPPED_COLUMNS:
        if name not in existing:
            continue
        cur.execute(f"ALTER TABLE vacancies DROP COLUMN {name}")
        dropped.append(name)

    if dropped:
        print("Columnas eliminadas:", ", ".join(dropped))

    filled = 0
    for cargo, values in SAMPLE.items():
        # Solo rellena si está vacío: no pisa datos que alguien ya haya puesto.
        cur.execute(
            """
            UPDATE vacancies
               SET fecha_limite = COALESCE(fecha_limite, ?),
                   skills = COALESCE(skills, ?),
                   experiencia = COALESCE(experiencia, ?),
                   nivel_estudios = COALESCE(nivel_estudios, ?),
                   area = COALESCE(area, ?),
                   industria = COALESCE(industria, ?)
             WHERE cargo = ?
            """,
            (
                values["fecha_limite"],
                values["skills"],
                values["experiencia"],
                values["nivel_estudios"],
                values["area"],
                values["industria"],
                cargo,
            ),
        )
        filled += cur.rowcount

    con.commit()
    con.close()
    print(f"Vacantes con datos de ejemplo: {filled}")
    print("Listo. No se borró ningún usuario ni postulación.")


if __name__ == "__main__":
    run()

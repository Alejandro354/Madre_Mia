"""Datos de DEMO opcionales para probar el dashboard con la BD vacía.

NO se ejecuta automáticamente. Úsalo solo si quieres ver gráficos con datos:
    python seed_demo.py
Es idempotente por lote (limpia sus propios inserts de demo antes de recargar).
"""
import datetime as dt
import random

from db import get_connection

random.seed(7)
COHORTES = ["2025-1", "2025-2", "2026-1"]
PROGRAMAS = ["Ingeniería de Sistemas", "Diseño Gráfico", "Administración"]
ESTADOS_PRAC = ["Activo", "Activo", "Activo", "Inactivo"]
ESTADOS_POST = ["Enviada", "En revisión", "Aceptada", "Rechazada"]
EMPRESAS = ["Globant", "Nequi", "Bancolombia", "Rappi", "Mercado Libre"]


def run():
    conn = get_connection()
    try:
        c = conn.cursor()
        # Practicantes + usuarios + perfiles
        for i in range(1, 41):
            created = (dt.date(2025, 1, 1) + dt.timedelta(days=i * 7)).isoformat()
            c.execute(
                "INSERT INTO users (nombre_completo, email, password_hash, created_at)"
                " VALUES (?,?,?,?)",
                (f"Practicante {i}", f"user{i}@demo.co", "x", created),
            )
            uid = c.lastrowid
            c.execute(
                "INSERT INTO profiles (user_id, institucion, programa, semestre, ciudad)"
                " VALUES (?,?,?,?,?)",
                (uid, "Universidad Demo", random.choice(PROGRAMAS),
                 str(random.randint(4, 10)), "Medellín"),
            )
            c.execute(
                "INSERT INTO practicantes (user_id, cohorte, estado) VALUES (?,?,?)",
                (uid, random.choice(COHORTES), random.choice(ESTADOS_PRAC)),
            )
            pid = c.lastrowid
            for _ in range(random.randint(0, 4)):
                c.execute(
                    "INSERT INTO documentos (practicante_id, nombre_original,"
                    " nombre_archivo, tipo, tamano_kb, creado_en) VALUES (?,?,?,?,?,?)",
                    (pid, "cv.pdf", "cv_x.pdf", "pdf", 120.5, created),
                )
            for _ in range(random.randint(1, 3)):
                c.execute(
                    "INSERT INTO notas (practicante_id, nota, descripcion) VALUES (?,?,?)",
                    (pid, round(random.uniform(3.0, 5.0), 1), "Evaluación demo"),
                )

        # Vacantes
        for i in range(1, 16):
            pub = (dt.date(2025, 2, 1) + dt.timedelta(days=i * 5)).isoformat()
            c.execute(
                "INSERT INTO vacancies (empresa, cargo, ubicacion, modalidad, jornada,"
                " fecha_publicacion, descripcion, requisitos, beneficios, activa,"
                " fecha_limite, area) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
                (random.choice(EMPRESAS), "Practicante TI", "Medellin",
                 random.choice(["Remoto", "Presencial", "Hibrido"]), "Tiempo completo",
                 pub, "Vacante de practica demo", "Sin requisitos", "Aprendizaje",
                 1 if i % 4 else 0, "2026-12-31", "Tecnologia"),
            )

        # Postulaciones
        users = [r[0] for r in c.execute("SELECT id FROM users").fetchall()]
        vacs = [r[0] for r in c.execute("SELECT id FROM vacancies").fetchall()]
        pares = [(u, v) for u in users for v in vacs]
        random.shuffle(pares)
        for u, v in pares[:90]:  # pares únicos: respeta UNIQUE(user_id, vacancy_id)
            created = (dt.date(2025, 3, 1) + dt.timedelta(days=random.randint(0, 180))).isoformat()
            c.execute(
                "INSERT INTO applications (user_id, vacancy_id, estado, created_at)"
                " VALUES (?,?,?,?)",
                (u, v, random.choice(ESTADOS_POST), created),
            )

        conn.commit()
        print("Datos de demo cargados: 40 practicantes, 15 vacantes, 90 postulaciones.")
    finally:
        conn.close()


if __name__ == "__main__":
    run()

"""Servicio de métricas y estadísticas sobre las bases SQLite adjuntas."""
from db import query_all, query_one
from utils.dates import date_where, parse_date_range


def _where(date_col, inicio, fin):
    """Devuelve (fragmento_where, params) para un rango sobre `date_col`."""
    if date_col is None:
        return "1=1", []
    params = []
    clauses = date_where(date_col, inicio, fin, params)
    return (" AND ".join(clauses) if clauses else "1=1"), params


def get_resumen(args):
    """Contadores generales (tarjetas). Acepta fecha_inicio / fecha_fin."""
    inicio, fin = parse_date_range(args)

    # --- Practicantes (practicantes.db) ---
    # practicantes.db no tiene una fecha de registro fiable en su esquema.
    w, p = _where(None, inicio, fin)
    prac = query_one(
        f"""
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN LOWER(COALESCE(estado,'')) LIKE 'activ%' THEN 1 ELSE 0 END) AS activos
        FROM practicantes.practicantes WHERE {w}
        """,
        p,
    )
    total_prac = prac["total"] or 0
    activos = prac["activos"] or 0

    # --- Vacantes ---
    wv, pv = _where("fecha_publicacion", inicio, fin)
    vac_activas = query_one(
        f"SELECT COUNT(*) AS n FROM main.vacancies WHERE activa = 1 AND {wv}", pv
    )["n"]
    # Total de vacantes (activas + inactivas) desde la tabla base.
    wvt, pvt = _where("fecha_publicacion", inicio, fin)
    vac_total = query_one(
        f"SELECT COUNT(*) AS n FROM main.vacancies WHERE {wvt}", pvt
    )["n"]

    # --- Postulaciones (vw_metricas_postulaciones) ---
    wp, pp = _where("fecha_postulacion", inicio, fin)
    post_total = query_one(
        f"SELECT COUNT(*) AS n FROM main.applications WHERE {wp}", pp
    )["n"]
    post_por_estado = query_all(
        f"""
        SELECT COALESCE(estado,'Sin estado') AS estado, COUNT(*) AS total
        FROM main.applications WHERE {wp}
        GROUP BY estado ORDER BY total DESC
        """,
        pp,
    )

    # --- Documentos (tabla base: la view agrega por practicante) ---
    wd, pd = _where("creado_en", inicio, fin)
    docs_total = query_one(
        f"SELECT COUNT(*) AS n FROM practicantes.documentos WHERE {wd}", pd
    )["n"]

    return {
        "practicantes": {
            "total": total_prac,
            "activos": activos,
            "inactivos": total_prac - activos,
        },
        "vacantes": {"total": vac_total, "activas": vac_activas},
        "postulaciones": {"total": post_total, "por_estado": post_por_estado},
        "documentos": {"total": docs_total},
    }


def get_estadisticas(args):
    """Series agrupadas para los gráficos. Acepta fecha_inicio / fecha_fin."""
    inicio, fin = parse_date_range(args)

    wp, pp = _where(None, inicio, fin)
    practicantes_por_estado = query_all(
        f"""
        SELECT COALESCE(estado,'Sin estado') AS label, COUNT(*) AS value
        FROM practicantes.practicantes WHERE {wp}
        GROUP BY estado ORDER BY value DESC
        """,
        pp,
    )
    practicantes_por_cohorte = query_all(
        f"""
        SELECT COALESCE(cohorte,'Sin cohorte') AS label, COUNT(*) AS value
        FROM practicantes.practicantes WHERE {wp}
        GROUP BY cohorte ORDER BY label
        """,
        pp,
    )
    wpost, ppost = _where("fecha_postulacion", inicio, fin)
    postulaciones_por_estado = query_all(
        f"""
        SELECT COALESCE(estado,'Sin estado') AS label, COUNT(*) AS value
        FROM main.applications WHERE {wpost}
        GROUP BY estado ORDER BY value DESC
        """,
        ppost,
    )
    postulaciones_por_empresa = query_all(
        f"""
        SELECT COALESCE(c.nombre_empresa,'Sin empresa') AS label, COUNT(*) AS value
        FROM main.applications a
        LEFT JOIN main.vacancies v ON v.id = a.vacancy_id
        LEFT JOIN main.company_profiles c ON c.id = v.company_id
        WHERE {wpost}
        GROUP BY c.nombre_empresa ORDER BY value DESC LIMIT 10
        """,
        ppost,
    )

    # Promedios desde las notas almacenadas en practicantes.db.
    wn, pn = _where("n.creado_en", inicio, fin)
    prom_global = query_one(
        f"""
        SELECT ROUND(AVG(n.valor), 2) AS promedio_global,
               COUNT(DISTINCT n.practicante_id) AS total_evaluados
        FROM practicantes.notas n WHERE {wn} AND n.valor IS NOT NULL
        """,
        pn,
    )
    promedios_por_cohorte = query_all(
        f"""
         SELECT COALESCE(pr.cohorte,'Sin cohorte') AS label,
             ROUND(AVG(n.valor), 2) AS value
         FROM practicantes.notas n
         LEFT JOIN practicantes.practicantes pr ON pr.id = n.practicante_id
         WHERE {wn} AND n.valor IS NOT NULL
         GROUP BY pr.cohorte ORDER BY label
        """,
        pn,
    )

    # Documentos por periodo (mes) — tabla base con filtro de fecha.
    wd, pd = _where("creado_en", inicio, fin)
    documentos_por_periodo = query_all(
        f"""
        SELECT strftime('%Y-%m', creado_en) AS label, COUNT(*) AS value
        FROM practicantes.documentos WHERE {wd} AND creado_en IS NOT NULL
        GROUP BY label ORDER BY label
        """,
        pd,
    )

    return {
        "practicantes_por_estado": practicantes_por_estado,
        "practicantes_por_cohorte": practicantes_por_cohorte,
        "postulaciones_por_estado": postulaciones_por_estado,
        "postulaciones_por_empresa": postulaciones_por_empresa,
        "promedios": {
            "global": prom_global or {"promedio_global": None, "total_evaluados": 0},
            "por_cohorte": promedios_por_cohorte,
        },
        "documentos_por_periodo": documentos_por_periodo,
    }

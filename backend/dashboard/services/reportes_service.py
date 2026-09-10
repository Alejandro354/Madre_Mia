"""Servicio de reportes sobre practicaya.db y practicantes.db."""
from db import query_all, query_one
from utils.dates import date_where, parse_date_range, parse_pagination

# --- Configuración de cada tipo de reporte (única fuente de identificadores SQL) ---
# base    : FROM (puede combinar esquemas main, practicantes y blog)
# select  : columnas expuestas como "expr AS alias" (los alias son las llaves del JSON)
# keys    : orden de columnas para tabla/exportación
# date_col: columna de fecha para el rango (o None)
# filters : {param_del_cliente: columna_real}
# order   : ORDER BY fijo
REPORTS = {
    "practicantes": {
        "base": "practicantes.practicantes pr",
        "select": [
            "pr.id AS practicante_id",
            "TRIM(COALESCE(pr.nombres, '') || ' ' || COALESCE(pr.apellidos, '')) AS nombre_completo",
            "pr.tipo_documento AS tipo_documento", "pr.documento AS documento",
            "pr.email AS email", "pr.telefono AS telefono", "pr.foto AS foto",
            "pr.cohorte AS cohorte", "pr.estado AS estado",
        ],
        "date_col": None,
        "filters": {"cohorte": "pr.cohorte", "estado": "pr.estado"},
        "order": "pr.cohorte DESC, pr.apellidos, pr.nombres",
        "sheet": "Practicantes",
    },
    "postulaciones": {
        "base": (
            "main.applications a "
            "LEFT JOIN main.vacancies v ON v.id = a.vacancy_id "
            "LEFT JOIN main.company_profiles c ON c.id = v.company_id"
        ),
        "select": [
            "a.id AS aplicacion_id", "a.student_id AS user_id",
            "COALESCE(c.nombre_empresa, 'Sin empresa') AS empresa",
            "v.cargo AS cargo", "v.area AS area",
            "a.estado AS estado_postulacion", "a.fecha_postulacion AS fecha_postulacion",
        ],
        "date_col": "fecha_postulacion",
        "filters": {"estado": "a.estado", "empresa": "c.nombre_empresa"},
        "order": "fecha_postulacion DESC",
        "sheet": "Postulaciones",
    },
    "vacantes": {
        "base": (
            "main.vacancies v "
            "LEFT JOIN main.company_profiles c ON c.id = v.company_id "
            "LEFT JOIN (SELECT vacancy_id, COUNT(*) AS total_postulados "
            "FROM main.applications GROUP BY vacancy_id) a ON a.vacancy_id = v.id "
            "LEFT JOIN (SELECT vacancy_id, COUNT(*) AS total_guardada_favoritos "
            "FROM main.vacancy_favorites GROUP BY vacancy_id) f ON f.vacancy_id = v.id"
        ),
        "select": [
            "v.id AS vacancy_id", "COALESCE(c.nombre_empresa, 'Sin empresa') AS empresa",
            "v.cargo AS cargo", "v.ubicacion AS ubicacion", "v.modalidad AS modalidad",
            "v.fecha_publicacion AS fecha_publicacion", "v.fecha_limite AS fecha_limite",
            "COALESCE(a.total_postulados, 0) AS total_postulados",
            "COALESCE(f.total_guardada_favoritos, 0) AS total_guardada_favoritos",
        ],
        "date_col": "fecha_publicacion",
        "filters": {"empresa": "c.nombre_empresa", "modalidad": "v.modalidad"},
        "order": "fecha_publicacion DESC",
        "sheet": "Vacantes",
    },
    "documentos": {
        "base": (
            "practicantes.practicantes pr "
            "LEFT JOIN practicantes.documentos d ON d.practicante_id = pr.id"
        ),
        "select": [
            "pr.id AS practicante_id",
            "TRIM(COALESCE(pr.nombres, '') || ' ' || COALESCE(pr.apellidos, '')) AS nombre_completo",
            "pr.cohorte AS cohorte", "COUNT(d.id) AS total_documentos",
            "MAX(d.creado_en) AS ultima_carga_documento",
        ],
        "date_col": "d.creado_en",
        "filters": {"cohorte": "pr.cohorte"},
        "order": "total_documentos DESC",
        "group": "pr.id, pr.nombres, pr.apellidos, pr.cohorte",
        "sheet": "Documentos",
    },
    "promedios": {
        "base": (
            "practicantes.practicantes pr "
            "LEFT JOIN practicantes.notas n ON n.practicante_id = pr.id"
        ),
        "select": [
            "pr.id AS practicante_id",
            "TRIM(COALESCE(pr.nombres, '') || ' ' || COALESCE(pr.apellidos, '')) AS nombre_completo",
            "pr.cohorte AS cohorte", "ROUND(AVG(n.valor), 2) AS promedio_general",
            "COUNT(n.id) AS total_evaluaciones",
        ],
        "date_col": None,
        "filters": {"cohorte": "pr.cohorte"},
        "order": "promedio_general DESC",
        "group": "pr.id, pr.nombres, pr.apellidos, pr.cohorte",
        "sheet": "Promedios",
    },
    "mensajes": {
        "base": (
            "main.messages m "
            "LEFT JOIN main.users sender ON sender.id = m.sender_id "
            "LEFT JOIN main.users receiver ON receiver.id = m.receiver_id"
        ),
        "select": [
            "m.id AS mensaje_id", "sender.email AS remitente",
            "receiver.email AS destinatario", "m.contenido AS contenido",
            "m.fecha_envio AS fecha_envio", "m.leido AS leido",
        ],
        "date_col": "fecha_envio",
        "filters": {},
        "order": "fecha_envio DESC",
        "sheet": "Mensajes",
    },
}


def report_types():
    return list(REPORTS.keys())


def _alias(select_expr):
    """Obtiene el alias/columna expuesta de una expresión del SELECT."""
    return select_expr.split(" AS ")[-1].strip() if " AS " in select_expr else select_expr


def _build_where(cfg, args):
    """Arma la cláusula WHERE parametrizada a partir de filtros y fechas."""
    inicio, fin = parse_date_range(args)
    conditions = ["1=1"]
    params = []

    if cfg["date_col"]:
        conditions += date_where(cfg["date_col"], inicio, fin, params)

    for param, column in cfg["filters"].items():
        value = args.get(param)
        if value:
            conditions.append(f"{column} = ?")
            params.append(value)

    return " AND ".join(conditions), params


def fetch_report(tipo, args):
    """Devuelve {total_registros, pagina_actual, limit, columnas, datos}."""
    cfg = REPORTS[tipo]
    where, params = _build_where(cfg, args)
    page, limit, offset = parse_pagination(args)

    columns = [_alias(c) for c in cfg["select"]]
    select_sql = ", ".join(cfg["select"])

    if cfg.get("group"):
        grouped = query_all(
            f"SELECT 1 FROM {cfg['base']} WHERE {where} GROUP BY {cfg['group']}",
            params,
        )
        total = len(grouped)
    else:
        total = query_one(
            f"SELECT COUNT(*) AS n FROM {cfg['base']} WHERE {where}", params
        )["n"]

    datos = query_all(
        f"SELECT {select_sql} FROM {cfg['base']} "
        f"WHERE {where}"
        + (f" GROUP BY {cfg['group']}" if cfg.get("group") else "")
        + f" ORDER BY {cfg['order']} LIMIT ? OFFSET ?",
        params + [limit, offset],
    )

    return {
        "tipo": tipo,
        "total_registros": total,
        "pagina_actual": page,
        "limit": limit,
        "total_paginas": (total + limit - 1) // limit if limit else 1,
        "columnas": columns,
        "datos": datos,
    }


def fetch_all_for_export(tipo, args):
    """Igual que fetch_report pero SIN paginar: respeta filtros de fecha/categoría."""
    cfg = REPORTS[tipo]
    where, params = _build_where(cfg, args)
    select_sql = ", ".join(cfg["select"])
    columns = [_alias(c) for c in cfg["select"]]
    datos = query_all(
        f"SELECT {select_sql} FROM {cfg['base']} WHERE {where}"
        + (f" GROUP BY {cfg['group']}" if cfg.get("group") else "")
        + f" ORDER BY {cfg['order']}",
        params,
    )
    return columns, datos, cfg["sheet"]

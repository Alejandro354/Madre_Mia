"""Validación y normalización de parámetros de entrada.

Centraliza el parseo de fechas y paginación para que las rutas no repitan
lógica y para garantizar que solo entren valores seguros a las consultas.
"""
import datetime as dt


class ValidationError(Exception):
    """Error de validación de parámetros -> se traduce a HTTP 400."""


def parse_date(value, field):
    """Valida una fecha 'YYYY-MM-DD'. Devuelve la cadena o None si viene vacía."""
    if value is None or value == "":
        return None
    try:
        dt.datetime.strptime(value, "%Y-%m-%d")
    except (ValueError, TypeError):
        raise ValidationError(f"El parámetro '{field}' debe tener formato YYYY-MM-DD")
    return value


def parse_date_range(args):
    """Extrae y valida fecha_inicio / fecha_fin de un dict de query params."""
    inicio = parse_date(args.get("fecha_inicio"), "fecha_inicio")
    fin = parse_date(args.get("fecha_fin"), "fecha_fin")
    if inicio and fin and inicio > fin:
        raise ValidationError("'fecha_inicio' no puede ser mayor que 'fecha_fin'")
    return inicio, fin


def parse_pagination(args, default_limit=20, max_limit=200):
    """Valida page (>=1) y limit (1..max_limit). Devuelve (page, limit, offset)."""
    try:
        page = int(args.get("page", 1))
        limit = int(args.get("limit", default_limit))
    except (ValueError, TypeError):
        raise ValidationError("'page' y 'limit' deben ser numéricos")
    if page < 1:
        raise ValidationError("'page' debe ser >= 1")
    if limit < 1 or limit > max_limit:
        raise ValidationError(f"'limit' debe estar entre 1 y {max_limit}")
    return page, limit, (page - 1) * limit


def date_where(column, inicio, fin, params):
    """Construye una condición de rango de fechas parametrizada.

    `column` proviene SIEMPRE de configuración del servidor (nunca del usuario),
    y los valores van como parámetros. Devuelve una lista de fragmentos SQL y
    agrega los valores a `params`.
    """
    clauses = []
    if inicio:
        clauses.append(f"date({column}) >= date(?)")
        params.append(inicio)
    if fin:
        clauses.append(f"date({column}) <= date(?)")
        params.append(fin)
    return clauses

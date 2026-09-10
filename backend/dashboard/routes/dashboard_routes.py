"""Rutas del dashboard: resumen y estadísticas. Requieren sesión iniciada."""
from flask import Blueprint, jsonify, request
import sqlite3

from services.dashboard_service import get_estadisticas, get_resumen
from utils.auth import require_auth
from utils.dates import ValidationError

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.get("/resumen")
@require_auth
def resumen():
    try:
        return jsonify(get_resumen(request.args))
    except ValidationError as e:
        return jsonify({"errors": {"general": str(e)}}), 400
    except sqlite3.Error:
        return jsonify({"errors": {"general": "No se pudo consultar el resumen."}}), 500


@dashboard_bp.get("/estadisticas")
@require_auth
def estadisticas():
    try:
        return jsonify(get_estadisticas(request.args))
    except ValidationError as e:
        return jsonify({"errors": {"general": str(e)}}), 400
    except sqlite3.Error:
        return jsonify({"errors": {"general": "No se pudieron consultar las estadísticas."}}), 500

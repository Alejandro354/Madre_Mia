"""Rutas de reportes: listado paginado y exportación PDF."""
import datetime as dt
import sqlite3

from flask import Blueprint, jsonify, request, send_file
import io

from services.reportes_service import (
    REPORTS,
    fetch_all_for_export,
    fetch_report,
    report_types,
)
from utils.dates import ValidationError
from utils.export import build_pdf

reportes_bp = Blueprint("reportes", __name__, url_prefix="/api/reportes")


def _validate_tipo(tipo):
    if tipo not in REPORTS:
        raise ValidationError(
            f"Tipo de reporte no válido. Opciones: {', '.join(report_types())}"
        )


@reportes_bp.get("/tipos")
def tipos():
    """Lista los tipos de reporte disponibles (para poblar el selector del front)."""
    return jsonify({"tipos": report_types()})


@reportes_bp.get("/<tipo>")
def listar(tipo):
    try:
        _validate_tipo(tipo)
        return jsonify(fetch_report(tipo, request.args))
    except ValidationError as e:
        return jsonify({"errors": {"general": str(e)}}), 400
    except sqlite3.Error:
        return jsonify({"errors": {"general": "No se pudo consultar el reporte."}}), 500


@reportes_bp.get("/<tipo>/exportar")
def exportar(tipo):
    try:
        _validate_tipo(tipo)
        formato = (request.args.get("formato", "pdf") or "pdf").lower()
        if formato != "pdf":
            raise ValidationError("El único formato disponible es 'pdf'")

        headers, rows, sheet = fetch_all_for_export(tipo, request.args)
    except ValidationError as e:
        return jsonify({"errors": {"general": str(e)}}), 400
    except sqlite3.Error:
        return jsonify({"errors": {"general": "No se pudo preparar la exportación."}}), 500

    # Nombre descriptivo con el rango aplicado.
    inicio = request.args.get("fecha_inicio") or "inicio"
    fin = request.args.get("fecha_fin") or dt.date.today().isoformat()
    base_name = f"reporte_{tipo}_{inicio}_{fin}"

    data = build_pdf(
        headers,
        rows,
        sheet_title=sheet,
        filters={"Desde": inicio, "Hasta": fin},
    )
    return send_file(
        io.BytesIO(data),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"{base_name}.pdf",
    )

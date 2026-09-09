import os

from flask import Blueprint, current_app, jsonify, request

from extensions import db
from helpers import get_current_user, require_role, portfolio_item_to_dict
from models import Application, ApplicationDocument, PortfolioItem
from utils import allowed_portfolio_file, is_valid_url, remove_file, save_upload

portfolio_bp = Blueprint("portfolio", __name__, url_prefix="/api/portfolio")

ACTIVE_STATES = ("Enviada", "En revisión")


def _file_size(file_storage):
    file_storage.seek(0, os.SEEK_END)
    size = file_storage.tell()
    file_storage.seek(0)
    return size


@portfolio_bp.route("", methods=["GET"])
@require_role("estudiante")
def list_items():
    user = get_current_user()
    sp = user.student_profile
    if not sp:
        return jsonify({"items": []}), 200
    items = (
        PortfolioItem.query.filter_by(student_id=sp.id)
        .order_by(PortfolioItem.created_at.desc())
        .all()
    )
    return jsonify({"items": [portfolio_item_to_dict(i) for i in items]}), 200


@portfolio_bp.route("", methods=["POST"])
@require_role("estudiante")
def create_item():
    user = get_current_user()
    sp = user.student_profile
    if not sp:
        return jsonify({"msg": "Perfil no encontrado"}), 404

    titulo = (request.form.get("titulo") or "").strip()
    enlace = (request.form.get("enlace") or "").strip()
    file = request.files.get("file")

    if not titulo:
        return jsonify({"errors": {"titulo": "Este campo es obligatorio"}}), 400

    if file and file.filename != "":
        if not allowed_portfolio_file(file.filename):
            return jsonify({"errors": {"file": "Formato no soportado. Usa PDF, JPG o PNG"}}), 400
        if _file_size(file) > current_app.config["MAX_PORTFOLIO_SIZE"]:
            return jsonify({"errors": {"file": "El archivo supera 10 MB"}}), 400
        name = save_upload(file, current_app.config["UPLOAD_FOLDER"])
        item = PortfolioItem(student_id=sp.id, tipo="archivo", titulo=titulo, archivo_url=name)
    elif enlace:
        if not is_valid_url(enlace):
            return jsonify({"errors": {"enlace": "Enlace no válido"}}), 400
        item = PortfolioItem(student_id=sp.id, tipo="enlace", titulo=titulo, enlace_url=enlace)
    else:
        return jsonify({"errors": {"file": "Debes adjuntar un archivo o ingresar un enlace"}}), 400

    db.session.add(item)
    db.session.commit()
    return jsonify({"message": "Portafolio guardado", "item": portfolio_item_to_dict(item)}), 201


@portfolio_bp.route("/<int:item_id>", methods=["PUT"])
@require_role("estudiante")
def update_item(item_id):
    user = get_current_user()
    sp = user.student_profile
    item = PortfolioItem.query.filter_by(id=item_id, student_id=sp.id).first()
    if item is None:
        return jsonify({"errors": {"general": "Documento no encontrado"}}), 404

    titulo = (request.form.get("titulo") or "").strip()
    enlace = (request.form.get("enlace") or "").strip()
    file = request.files.get("file")

    if not titulo:
        return jsonify({"errors": {"titulo": "Este campo es obligatorio"}}), 400

    if file and file.filename != "":
        if not allowed_portfolio_file(file.filename):
            return jsonify({"errors": {"file": "Formato no soportado"}}), 400
        if _file_size(file) > current_app.config["MAX_PORTFOLIO_SIZE"]:
            return jsonify({"errors": {"file": "Supera 10 MB"}}), 400
        if item.archivo_url:
            remove_file(item.archivo_url, current_app.config["UPLOAD_FOLDER"])
        name = save_upload(file, current_app.config["UPLOAD_FOLDER"])
        item.tipo = "archivo"
        item.archivo_url = name
        item.enlace_url = None
    elif enlace:
        if not is_valid_url(enlace):
            return jsonify({"errors": {"enlace": "Enlace no válido"}}), 400
        if item.archivo_url:
            remove_file(item.archivo_url, current_app.config["UPLOAD_FOLDER"])
        item.tipo = "enlace"
        item.enlace_url = enlace
        item.archivo_url = None

    item.titulo = titulo
    db.session.commit()
    return jsonify({"message": "Portafolio actualizado", "item": portfolio_item_to_dict(item)}), 200


@portfolio_bp.route("/<int:item_id>", methods=["DELETE"])
@require_role("estudiante")
def delete_item(item_id):
    user = get_current_user()
    sp = user.student_profile
    item = PortfolioItem.query.filter_by(id=item_id, student_id=sp.id).first()
    if item is None:
        return jsonify({"errors": {"general": "Documento no encontrado"}}), 404

    # Check if linked to active application
    active = (
        db.session.query(ApplicationDocument)
        .join(Application)
        .filter(
            ApplicationDocument.portfolio_item_id == item.id,
            Application.estado.in_(ACTIVE_STATES),
        )
        .first()
    )
    force = request.args.get("force") == "true"
    if active is not None and not force:
        return jsonify({
            "warning": "Este documento está vinculado a una postulación en curso"
        }), 409

    if item.archivo_url:
        remove_file(item.archivo_url, current_app.config["UPLOAD_FOLDER"])
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Documento eliminado"}), 200

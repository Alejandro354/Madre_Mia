import os

from flask import Blueprint, current_app, jsonify, request

from extensions import db
from helpers import get_current_user, portfolio_item_to_dict, require_user
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
@require_user
def list_items():
    user = get_current_user()
    items = (
        PortfolioItem.query.filter_by(user_id=user.id)
        .order_by(PortfolioItem.created_at.desc())
        .all()
    )
    return jsonify({"items": [portfolio_item_to_dict(i) for i in items]}), 200


@portfolio_bp.route("", methods=["POST"])
@require_user
def create_item():
    user = get_current_user()

    titulo = (request.form.get("titulo") or "").strip()
    enlace = (request.form.get("enlace") or "").strip()
    file = request.files.get("file")

    if not titulo:
        return jsonify({"errors": {"titulo": "Este campo es obligatorio"}}), 400

    if file and file.filename != "":
        if not allowed_portfolio_file(file.filename):
            return (
                jsonify(
                    {
                        "errors": {
                            "file": "Formato no soportado. Usa PDF, JPG, PNG o un enlace válido"
                        }
                    }
                ),
                400,
            )
        if _file_size(file) > current_app.config["MAX_PORTFOLIO_SIZE"]:
            return (
                jsonify(
                    {"errors": {"file": "El archivo supera el tamaño máximo de 10 MB"}}
                ),
                400,
            )
        name = save_upload(file, current_app.config["UPLOAD_FOLDER"])
        item = PortfolioItem(
            user_id=user.id, tipo="archivo", titulo=titulo, archivo_url=name
        )
    elif enlace:
        if not is_valid_url(enlace):
            return (
                jsonify(
                    {
                        "errors": {
                            "enlace": "Formato no soportado. Usa PDF, JPG, PNG o un enlace válido"
                        }
                    }
                ),
                400,
            )
        item = PortfolioItem(user_id=user.id, tipo="enlace", titulo=titulo, enlace_url=enlace)
    else:
        return (
            jsonify(
                {
                    "errors": {
                        "file": "Debes adjuntar un archivo o ingresar un enlace válido"
                    }
                }
            ),
            400,
        )

    db.session.add(item)
    db.session.commit()
    return (
        jsonify(
            {
                "message": "Portafolio guardado correctamente",
                "item": portfolio_item_to_dict(item),
            }
        ),
        201,
    )


@portfolio_bp.route("/<int:item_id>", methods=["PUT"])
@require_user
def update_item(item_id):
    user = get_current_user()
    item = PortfolioItem.query.filter_by(id=item_id, user_id=user.id).first()
    if item is None:
        return jsonify({"errors": {"general": "Documento no encontrado"}}), 404

    titulo = (request.form.get("titulo") or "").strip()
    enlace = (request.form.get("enlace") or "").strip()
    file = request.files.get("file")

    if not titulo:
        return jsonify({"errors": {"titulo": "Este campo es obligatorio"}}), 400

    if file and file.filename != "":
        if not allowed_portfolio_file(file.filename):
            return (
                jsonify(
                    {
                        "errors": {
                            "file": "Formato no soportado. Usa PDF, JPG, PNG o un enlace válido"
                        }
                    }
                ),
                400,
            )
        if _file_size(file) > current_app.config["MAX_PORTFOLIO_SIZE"]:
            return (
                jsonify(
                    {"errors": {"file": "El archivo supera el tamaño máximo de 10 MB"}}
                ),
                400,
            )
        if item.archivo_url:
            remove_file(item.archivo_url, current_app.config["UPLOAD_FOLDER"])
        name = save_upload(file, current_app.config["UPLOAD_FOLDER"])
        item.tipo = "archivo"
        item.archivo_url = name
        item.enlace_url = None
    elif enlace:
        if not is_valid_url(enlace):
            return (
                jsonify(
                    {
                        "errors": {
                            "enlace": "Formato no soportado. Usa PDF, JPG, PNG o un enlace válido"
                        }
                    }
                ),
                400,
            )
        if item.archivo_url:
            remove_file(item.archivo_url, current_app.config["UPLOAD_FOLDER"])
        item.tipo = "enlace"
        item.enlace_url = enlace
        item.archivo_url = None
    else:
        return (
            jsonify(
                {
                    "errors": {
                        "file": "Debes adjuntar un archivo o ingresar un enlace válido"
                    }
                }
            ),
            400,
        )

    item.titulo = titulo
    db.session.commit()
    return (
        jsonify(
            {
                "message": "Portafolio guardado correctamente",
                "item": portfolio_item_to_dict(item),
            }
        ),
        200,
    )


@portfolio_bp.route("/<int:item_id>", methods=["DELETE"])
@require_user
def delete_item(item_id):
    user = get_current_user()
    item = PortfolioItem.query.filter_by(id=item_id, user_id=user.id).first()
    if item is None:
        return jsonify({"errors": {"general": "Documento no encontrado"}}), 404

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
        return (
            jsonify(
                {
                    "warning": "Este documento está vinculado a una postulación en curso. Eliminarlo puede afectar su evaluación"
                }
            ),
            409,
        )

    if item.archivo_url:
        remove_file(item.archivo_url, current_app.config["UPLOAD_FOLDER"])
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Documento eliminado"}), 200

import os
from datetime import date

from flask import Blueprint, current_app, jsonify, request

from extensions import db
from helpers import get_current_user, profile_to_dict, require_user
from models import Profile
from utils import PHONE_RE, allowed_file, remove_file, save_photo, utcnow

profile_bp = Blueprint("profile", __name__, url_prefix="/api/profile")

REQUIRED_FIELDS = [
    "fecha_nacimiento",
    "telefono",
    "institucion",
    "programa",
    "semestre",
    "ciudad",
]


def parse_date(value):
    try:
        return date.fromisoformat(value)
    except (ValueError, TypeError):
        return None


@profile_bp.route("", methods=["GET"])
@require_user
def get_profile():
    user = get_current_user()
    if user.profile is None:
        return jsonify({"profile": None}), 200
    return jsonify({"profile": profile_to_dict(user.profile)}), 200


@profile_bp.route("", methods=["PUT"])
@require_user
def upsert_profile():
    user = get_current_user()
    data = request.get_json(silent=True) or {}

    errors = {}
    cleaned = {}
    for field in REQUIRED_FIELDS:
        raw = data.get(field)
        value = raw.strip() if isinstance(raw, str) else raw
        if not value:
            errors[field] = "Este campo es obligatorio"
        cleaned[field] = value

    fecha = None
    if "fecha_nacimiento" not in errors:
        fecha = parse_date(cleaned["fecha_nacimiento"])
        if fecha is None:
            errors["fecha_nacimiento"] = "Fecha de nacimiento inválida"
        elif fecha > utcnow().date():
            errors["fecha_nacimiento"] = "La fecha de nacimiento no puede ser futura"

    if "telefono" not in errors and not PHONE_RE.match(str(cleaned["telefono"]).strip()):
        errors["telefono"] = (
            "El teléfono debe contener solo números y tener entre 7 y 15 dígitos"
        )

    if "semestre" not in errors:
        try:
            semestre = int(str(cleaned["semestre"]).strip())
            if semestre < 1 or semestre > 12:
                raise ValueError
        except (ValueError, TypeError):
            errors["semestre"] = "El semestre debe ser un número entre 1 y 12"

    if errors:
        return jsonify({"errors": errors}), 400

    profile = user.profile
    if profile is None:
        profile = Profile(user_id=user.id)
        db.session.add(profile)

    profile.fecha_nacimiento = fecha
    profile.telefono = str(cleaned["telefono"]).strip()
    profile.institucion = str(cleaned["institucion"]).strip()
    profile.programa = str(cleaned["programa"]).strip()
    profile.semestre = str(cleaned["semestre"]).strip()
    profile.ciudad = str(cleaned["ciudad"]).strip()
    descripcion = data.get("descripcion")
    profile.descripcion = descripcion.strip() if isinstance(descripcion, str) else None
    db.session.commit()

    return jsonify(
        {"message": "Perfil actualizado correctamente", "profile": profile_to_dict(profile)}
    ), 200


@profile_bp.route("/photo", methods=["POST"])
@require_user
def upload_photo():
    user = get_current_user()

    if "file" not in request.files:
        return jsonify({"errors": {"file": "No se envió ningún archivo"}}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"errors": {"file": "No se seleccionó ningún archivo"}}), 400

    if not allowed_file(file.filename):
        return (
            jsonify(
                {
                    "errors": {
                        "file": "Formato no válido o archivo demasiado pesado. Usa JPG o PNG de máximo 5 MB"
                    }
                }
            ),
            400,
        )

    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    if size > current_app.config["MAX_PHOTO_SIZE"]:
        return (
            jsonify(
                {
                    "errors": {
                        "file": "Formato no válido o archivo demasiado pesado. Usa JPG o PNG de máximo 5 MB"
                    }
                }
            ),
            400,
        )

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    name = save_photo(file, upload_folder)

    profile = user.profile
    if profile is None:
        profile = Profile(user_id=user.id)
        db.session.add(profile)

    if profile.foto_url:
        remove_file(profile.foto_url, upload_folder)
    profile.foto_url = name
    db.session.commit()

    return (
        jsonify(
            {
                "message": "Foto de perfil actualizada",
                "foto_url": f"/uploads/{name}",
            }
        ),
        200,
    )

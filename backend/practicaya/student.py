import os
from datetime import date

from flask import Blueprint, current_app, jsonify, request

from extensions import db
from helpers import (
    get_current_user,
    require_role,
    student_profile_to_dict,
    social_link_to_dict,
    portfolio_item_to_dict,
)
from models import StudentProfile, SocialLink
from utils import PHONE_RE, allowed_photo, remove_file, save_photo

student_bp = Blueprint("student", __name__, url_prefix="/api/student")


def _parse_date(value):
    try:
        return date.fromisoformat(value)
    except (ValueError, TypeError):
        return None


@student_bp.route("/profile", methods=["GET"])
@require_role("estudiante")
def get_profile():
    user = get_current_user()
    profile = user.student_profile
    if not profile:
        return jsonify({"profile": None}), 200

    # Include socials inline
    data = student_profile_to_dict(profile)
    socials = {s.red: s.url for s in profile.social_links}
    data["linkedin"] = socials.get("linkedin", "")
    data["github"] = socials.get("github", "")
    data["instagram"] = socials.get("instagram", "")
    return jsonify(data), 200


@student_bp.route("/profile", methods=["PUT"])
@require_role("estudiante")
def update_profile():
    user = get_current_user()
    data = request.get_json(silent=True) or {}

    profile = user.student_profile
    if not profile:
        profile = StudentProfile(user_id=user.id, nombre=data.get("nombre", "Mi Perfil"))
        db.session.add(profile)

    profile.nombre = data.get("nombre", profile.nombre)
    profile.rol = data.get("rol", profile.rol)
    profile.telefono = data.get("telefono", profile.telefono)
    profile.ciudad = data.get("ciudad", profile.ciudad)
    profile.institucion = data.get("institucion", profile.institucion)
    profile.programa = data.get("programa", profile.programa)
    profile.semestre = data.get("semestre", profile.semestre)
    profile.descripcion = data.get("descripcion", profile.descripcion)
    profile.habilidades = data.get("habilidades", profile.habilidades)

    if "fecha_nacimiento" in data and data["fecha_nacimiento"]:
        fecha = _parse_date(data["fecha_nacimiento"])
        if fecha:
            profile.fecha_nacimiento = fecha

    if "foto_url" in data:
        profile.foto_url = data.get("foto_url")

    # Handle social links inline
    def set_social(red, url_val):
        link = next((s for s in profile.social_links if s.red == red), None)
        url_val = (url_val or "").strip()
        if url_val:
            if link:
                link.url = url_val
            else:
                db.session.add(SocialLink(student_id=profile.id, red=red, url=url_val))
        elif link:
            db.session.delete(link)

    for red in ("linkedin", "github", "instagram"):
        if red in data:
            set_social(red, data.get(red))

    db.session.commit()
    return jsonify({"msg": "Perfil actualizado exitosamente"}), 200


@student_bp.route("/profile/photo", methods=["POST"])
@require_role("estudiante")
def upload_photo():
    user = get_current_user()

    if "file" not in request.files:
        return jsonify({"msg": "No se envió ningún archivo"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"msg": "No se seleccionó ningún archivo"}), 400

    if not allowed_photo(file.filename):
        return jsonify({"msg": "Formato no válido. Usa JPG o PNG"}), 400

    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    if size > current_app.config["MAX_PHOTO_SIZE"]:
        return jsonify({"msg": "El archivo supera 5 MB"}), 400

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    name = save_photo(file, upload_folder)

    profile = user.student_profile
    if not profile:
        profile = StudentProfile(user_id=user.id, nombre="Mi Perfil")
        db.session.add(profile)

    if profile.foto_url:
        remove_file(profile.foto_url, upload_folder)
    profile.foto_url = name
    db.session.commit()

    return jsonify({"msg": "Foto actualizada", "foto_url": name}), 200

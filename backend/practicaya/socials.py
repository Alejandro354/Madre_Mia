from flask import Blueprint, jsonify, request

from extensions import db
from helpers import get_current_user, require_role, social_link_to_dict
from models import SocialLink
from utils import is_valid_social_url

socials_bp = Blueprint("socials", __name__, url_prefix="/api/socials")

ALLOWED_NETWORKS = {"linkedin", "github", "instagram"}


@socials_bp.route("", methods=["GET"])
@require_role("estudiante")
def list_socials():
    user = get_current_user()
    sp = user.student_profile
    if not sp:
        return jsonify({"socials": []}), 200
    links = SocialLink.query.filter_by(student_id=sp.id).all()
    return jsonify({"socials": [social_link_to_dict(l) for l in links]}), 200


@socials_bp.route("", methods=["POST"])
@require_role("estudiante")
def upsert_social():
    user = get_current_user()
    sp = user.student_profile
    if not sp:
        return jsonify({"msg": "Perfil no encontrado"}), 404

    data = request.get_json(silent=True) or {}
    red = (data.get("red") or "").strip().lower()
    url = (data.get("url") or "").strip()

    if red not in ALLOWED_NETWORKS:
        return jsonify({"errors": {"red": "Red social no soportada"}}), 400

    if not is_valid_social_url(red, url):
        return jsonify({"errors": {"url": "El enlace ingresado no es válido"}}), 400

    link = SocialLink.query.filter_by(student_id=sp.id, red=red).first()
    if link is None:
        link = SocialLink(student_id=sp.id, red=red)
        db.session.add(link)
    link.url = url
    db.session.commit()

    return jsonify({"social": social_link_to_dict(link)}), 200


@socials_bp.route("/<red>", methods=["DELETE"])
@require_role("estudiante")
def delete_social(red):
    user = get_current_user()
    sp = user.student_profile
    if not sp:
        return jsonify({"msg": "Perfil no encontrado"}), 404

    link = SocialLink.query.filter_by(student_id=sp.id, red=red).first()
    if link is None:
        return jsonify({"errors": {"general": "Red social no encontrada"}}), 404

    db.session.delete(link)
    db.session.commit()
    return jsonify({"message": "Red social desvinculada"}), 200

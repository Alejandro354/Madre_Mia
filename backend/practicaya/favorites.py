from flask import Blueprint, jsonify, request

from extensions import db
from helpers import get_current_user, require_role, vacancy_summary
from models import Vacancy, VacancyFavorite

favorites_bp = Blueprint("favorites", __name__, url_prefix="/api/favorites")


@favorites_bp.route("", methods=["GET"])
@require_role("estudiante")
def list_favorites():
    user = get_current_user()
    sp = user.student_profile
    if not sp:
        return jsonify({"vacancies": []}), 200
    favorites = (
        VacancyFavorite.query.filter_by(student_id=sp.id)
        .order_by(VacancyFavorite.created_at.desc())
        .all()
    )
    return jsonify({
        "vacancies": [
            vacancy_summary(f.vacancy) for f in favorites if f.vacancy is not None
        ]
    }), 200


@favorites_bp.route("", methods=["POST"])
@require_role("estudiante")
def add_favorite():
    user = get_current_user()
    sp = user.student_profile
    if not sp:
        return jsonify({"msg": "Perfil no encontrado"}), 404

    data = request.get_json(silent=True) or {}
    vacancy_id = data.get("vacancy_id")

    vacancy = Vacancy.query.get(vacancy_id) if vacancy_id else None
    if vacancy is None:
        return jsonify({"msg": "Vacante no encontrada"}), 404

    existing = VacancyFavorite.query.filter_by(student_id=sp.id, vacancy_id=vacancy.id).first()
    if existing:
        return jsonify({"msg": "Vacante ya guardada"}), 200

    db.session.add(VacancyFavorite(student_id=sp.id, vacancy_id=vacancy.id))
    db.session.commit()
    return jsonify({"msg": "Vacante guardada"}), 201


@favorites_bp.route("/<int:vacancy_id>", methods=["DELETE"])
@require_role("estudiante")
def remove_favorite(vacancy_id):
    user = get_current_user()
    sp = user.student_profile
    if not sp:
        return jsonify({"msg": "Perfil no encontrado"}), 404

    fav = VacancyFavorite.query.filter_by(student_id=sp.id, vacancy_id=vacancy_id).first()
    if fav is None:
        return jsonify({"msg": "Vacante no guardada"}), 404

    db.session.delete(fav)
    db.session.commit()
    return jsonify({"msg": "Vacante eliminada de guardadas"}), 200

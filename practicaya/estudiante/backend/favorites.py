from flask import Blueprint, jsonify, request

from extensions import db
from helpers import get_current_user, require_user, vacancy_summary
from models import Vacancy, VacancyFavorite

favorites_bp = Blueprint("favorites", __name__, url_prefix="/api/favorites")


@favorites_bp.route("", methods=["GET"])
@require_user
def list_favorites():
    user = get_current_user()
    favorites = (
        VacancyFavorite.query.filter_by(user_id=user.id)
        .order_by(VacancyFavorite.created_at.desc())
        .all()
    )
    return (
        jsonify(
            {
                "vacancies": [
                    vacancy_summary(f.vacancy)
                    for f in favorites
                    if f.vacancy is not None
                ]
            }
        ),
        200,
    )


@favorites_bp.route("", methods=["POST"])
@require_user
def add_favorite():
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    vacancy_id = data.get("vacancy_id")

    vacancy = Vacancy.query.get(vacancy_id) if vacancy_id else None
    if vacancy is None:
        return jsonify({"errors": {"general": "Vacante no encontrada"}}), 404

    existing = VacancyFavorite.query.filter_by(
        user_id=user.id, vacancy_id=vacancy.id
    ).first()
    if existing is not None:
        return jsonify({"message": "Vacante ya guardada"}), 200

    favorite = VacancyFavorite(user_id=user.id, vacancy_id=vacancy.id)
    db.session.add(favorite)
    db.session.commit()
    return jsonify({"message": "Vacante guardada"}), 201


@favorites_bp.route("/<int:vacancy_id>", methods=["DELETE"])
@require_user
def remove_favorite(vacancy_id):
    user = get_current_user()
    favorite = VacancyFavorite.query.filter_by(
        user_id=user.id, vacancy_id=vacancy_id
    ).first()
    if favorite is None:
        return jsonify({"errors": {"general": "Vacante no guardada"}}), 404

    db.session.delete(favorite)
    db.session.commit()
    return jsonify({"message": "Vacante eliminada de guardadas"}), 200

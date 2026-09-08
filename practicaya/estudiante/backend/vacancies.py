from flask import Blueprint, jsonify

from helpers import get_current_user, require_user, vacancy_detail, vacancy_summary
from models import Application, Vacancy, VacancyFavorite

vacancies_bp = Blueprint("vacancies", __name__, url_prefix="/api/vacancies")


def _with_flags(vacancy, user):
    data = vacancy_summary(vacancy)
    data["guardada"] = (
        VacancyFavorite.query.filter_by(
            user_id=user.id, vacancy_id=vacancy.id
        ).first()
        is not None
    )
    data["aplicada"] = (
        Application.query.filter_by(user_id=user.id, vacancy_id=vacancy.id).first()
        is not None
    )
    return data


@vacancies_bp.route("", methods=["GET"])
@require_user
def list_vacancies():
    user = get_current_user()
    vacancies = (
        Vacancy.query.filter_by(activa=True)
        .order_by(Vacancy.fecha_publicacion.desc())
        .all()
    )
    return jsonify({"vacancies": [_with_flags(v, user) for v in vacancies]}), 200


@vacancies_bp.route("/<int:vacancy_id>", methods=["GET"])
@require_user
def get_vacancy(vacancy_id):
    user = get_current_user()
    vacancy = Vacancy.query.get_or_404(vacancy_id)
    data = vacancy_detail(vacancy)
    data["guardada"] = (
        VacancyFavorite.query.filter_by(
            user_id=user.id, vacancy_id=vacancy.id
        ).first()
        is not None
    )
    data["aplicada"] = (
        Application.query.filter_by(user_id=user.id, vacancy_id=vacancy.id).first()
        is not None
    )
    return jsonify({"vacancy": data}), 200

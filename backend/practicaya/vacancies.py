from flask import Blueprint, jsonify

from helpers import (
    get_current_user,
    require_user,
    vacancy_detail,
    vacancy_summary,
)
from models import Application, Vacancy, VacancyFavorite

vacancies_bp = Blueprint("vacancies", __name__, url_prefix="/api/vacancies")


def _with_flags(vacancy, user):
    """Add saved/applied flags for a student viewing vacancies."""
    data = vacancy_summary(vacancy)
    sp = user.student_profile if user.role == "estudiante" else None
    if sp:
        data["guardada"] = (
            VacancyFavorite.query.filter_by(student_id=sp.id, vacancy_id=vacancy.id).first()
            is not None
        )
        data["aplicada"] = (
            Application.query.filter_by(student_id=sp.id, vacancy_id=vacancy.id).first()
            is not None
        )
    else:
        data["guardada"] = False
        data["aplicada"] = False
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

    sp = user.student_profile if user.role == "estudiante" else None
    if sp:
        data["guardada"] = (
            VacancyFavorite.query.filter_by(student_id=sp.id, vacancy_id=vacancy.id).first()
            is not None
        )
        data["aplicada"] = (
            Application.query.filter_by(student_id=sp.id, vacancy_id=vacancy.id).first()
            is not None
        )
    else:
        data["guardada"] = False
        data["aplicada"] = False

    return jsonify({"vacancy": data}), 200

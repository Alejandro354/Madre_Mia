from flask import Blueprint, jsonify, request

from extensions import db
from helpers import application_to_dict, get_current_user, require_user
from models import Application, ApplicationDocument, PortfolioItem, Vacancy

applications_bp = Blueprint("applications", __name__, url_prefix="/api/applications")

PROFILE_REQUIRED = [
    "fecha_nacimiento",
    "telefono",
    "institucion",
    "programa",
    "semestre",
    "ciudad",
]


def _profile_missing(profile):
    if profile is None:
        return True
    for field in PROFILE_REQUIRED:
        if not getattr(profile, field):
            return True
    return False


@applications_bp.route("", methods=["GET"])
@require_user
def list_applications():
    user = get_current_user()
    apps = (
        Application.query.filter_by(user_id=user.id)
        .order_by(Application.created_at.desc())
        .all()
    )
    return jsonify({"applications": [application_to_dict(a) for a in apps]}), 200


@applications_bp.route("", methods=["POST"])
@require_user
def apply():
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    vacancy_id = data.get("vacancy_id")

    vacancy = Vacancy.query.get(vacancy_id) if vacancy_id else None
    if vacancy is None:
        return jsonify({"errors": {"general": "Vacante no encontrada"}}), 404

    existing = Application.query.filter_by(user_id=user.id, vacancy_id=vacancy.id).first()
    if existing is not None:
        return jsonify({"errors": {"general": "Ya te has postulado a esta vacante"}}), 409

    if _profile_missing(user.profile):
        return (
            jsonify(
                {
                    "errors": {
                        "general": "Completa tu perfil antes de postularte",
                        "missing_section": "perfil",
                    }
                }
            ),
            400,
        )

    portfolio_items = PortfolioItem.query.filter_by(user_id=user.id).all()

    application = Application(user_id=user.id, vacancy_id=vacancy.id, estado="Enviada")
    db.session.add(application)
    db.session.flush()

    for item in portfolio_items:
        db.session.add(
            ApplicationDocument(
                application_id=application.id, portfolio_item_id=item.id
            )
        )

    db.session.commit()
    return (
        jsonify(
            {
                "message": "Postulación enviada con éxito",
                "application": application_to_dict(application),
            }
        ),
        201,
    )


@applications_bp.route("/<int:application_id>", methods=["DELETE"])
@require_user
def delete_application(application_id):
    user = get_current_user()
    application = Application.query.filter_by(id=application_id, user_id=user.id).first()
    if application is None:
        return jsonify({"errors": {"general": "Postulación no encontrada"}}), 404

    db.session.delete(application)
    db.session.commit()
    return jsonify({"message": "Postulación eliminada"}), 200

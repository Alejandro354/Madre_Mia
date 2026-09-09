from flask import Blueprint, jsonify, request

from extensions import db
from helpers import get_current_user, require_role, application_to_dict, create_notification
from models import Application, ApplicationDocument, PortfolioItem, Vacancy

applications_bp = Blueprint("applications", __name__, url_prefix="/api/applications")

PROFILE_REQUIRED = ["fecha_nacimiento", "telefono", "institucion", "programa", "semestre", "ciudad"]


def _profile_incomplete(sp):
    if sp is None:
        return True
    for field in PROFILE_REQUIRED:
        if not getattr(sp, field):
            return True
    return False


@applications_bp.route("", methods=["GET"])
@require_role("estudiante")
def list_applications():
    user = get_current_user()
    sp = user.student_profile
    if not sp:
        return jsonify({"applications": []}), 200
    apps = (
        Application.query.filter_by(student_id=sp.id)
        .order_by(Application.fecha_postulacion.desc())
        .all()
    )
    return jsonify({"applications": [application_to_dict(a) for a in apps]}), 200


@applications_bp.route("", methods=["POST"])
@require_role("estudiante")
def apply():
    user = get_current_user()
    sp = user.student_profile
    data = request.get_json(silent=True) or {}
    vacancy_id = data.get("vacancy_id")

    vacancy = Vacancy.query.get(vacancy_id) if vacancy_id else None
    if vacancy is None:
        return jsonify({"msg": "Vacante no encontrada"}), 404

    if _profile_incomplete(sp):
        return jsonify({
            "msg": "Completa tu perfil antes de postularte",
            "missing_section": "perfil",
        }), 400

    existing = Application.query.filter_by(student_id=sp.id, vacancy_id=vacancy.id).first()
    if existing:
        return jsonify({"msg": "Ya te postulaste a esta vacante"}), 409

    application = Application(student_id=sp.id, vacancy_id=vacancy.id, estado="Enviada")
    db.session.add(application)
    db.session.flush()

    # Attach all portfolio items as documents
    portfolio_items = PortfolioItem.query.filter_by(student_id=sp.id).all()
    for item in portfolio_items:
        db.session.add(
            ApplicationDocument(application_id=application.id, portfolio_item_id=item.id)
        )

    if vacancy.company and vacancy.company.user_id:
        create_notification(
            user_id=vacancy.company.user_id,
            tipo="postulacion_nueva",
            mensaje=f"{sp.nombre} se postuló a tu vacante \"{vacancy.cargo}\"",
            link="/empresa/postulaciones",
        )

    db.session.commit()
    return jsonify({
        "msg": "Postulación enviada con éxito",
        "application": application_to_dict(application),
    }), 201


@applications_bp.route("/<int:application_id>", methods=["DELETE"])
@require_role("estudiante")
def delete_application(application_id):
    user = get_current_user()
    sp = user.student_profile
    if not sp:
        return jsonify({"msg": "Perfil no encontrado"}), 404

    application = Application.query.filter_by(id=application_id, student_id=sp.id).first()
    if application is None:
        return jsonify({"msg": "Postulación no encontrada"}), 404

    db.session.delete(application)
    db.session.commit()
    return jsonify({"msg": "Postulación eliminada"}), 200

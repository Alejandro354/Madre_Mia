from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request
from sqlalchemy import desc

from extensions import db
from helpers import (
    get_current_user,
    require_role,
    company_profile_to_dict,
    student_profile_to_dict,
)
from models import (
    CompanyProfile,
    User,
    StudentProfile,
    Vacancy,
    Application,
    SelectedCandidate,
)
from helpers import student_profile_to_dict, create_notification
from utils import utcnow

company_bp = Blueprint("company", __name__, url_prefix="/api/company")


# ─────────────── COMPANY PROFILE ───────────────
@company_bp.route("/profile", methods=["GET"])
@require_role("empresa")
def get_profile():
    user = get_current_user()
    profile = user.company_profile
    if not profile:
        profile = CompanyProfile(user_id=user.id, nombre_empresa="Mi Empresa")
        db.session.add(profile)
        db.session.commit()
    return jsonify(company_profile_to_dict(profile)), 200


@company_bp.route("/profile", methods=["PUT"])
@require_role("empresa")
def update_profile():
    user = get_current_user()
    data = request.get_json(silent=True) or {}

    profile = user.company_profile
    if not profile:
        profile = CompanyProfile(user_id=user.id, nombre_empresa="Mi Empresa")
        db.session.add(profile)

    profile.nombre_empresa = data.get("nombre_empresa", profile.nombre_empresa)
    desc_val = data.get("descripcion")
    profile.descripcion = desc_val[:350] if desc_val else profile.descripcion
    profile.ubicacion = data.get("ubicacion", profile.ubicacion)
    profile.sitio_web = data.get("sitio_web", profile.sitio_web)
    profile.industria = data.get("industria", profile.industria)
    profile.tamano_empresa = data.get("tamano_empresa", profile.tamano_empresa)
    profile.anio_fundacion = data.get("anio_fundacion", profile.anio_fundacion)
    profile.logo_url = data.get("logo_url", profile.logo_url)
    if "banner_url" in data:
        profile.banner_url = data.get("banner_url")
    profile.linkedin = data.get("linkedin", profile.linkedin)
    profile.instagram = data.get("instagram", profile.instagram)

    db.session.commit()
    return jsonify({"msg": "Perfil actualizado exitosamente"}), 200


# ─────────────── DASHBOARD STATS ───────────────
@company_bp.route("/dashboard/stats", methods=["GET"])
@require_role("empresa")
def dashboard_stats():
    user = get_current_user()
    profile = user.company_profile
    if not profile:
        return jsonify({"msg": "Perfil de empresa no encontrado"}), 404

    company_id = profile.id
    vacancies = Vacancy.query.filter_by(company_id=company_id).all()
    vacancy_ids = [v.id for v in vacancies]

    applications = (
        Application.query.filter(Application.vacancy_id.in_(vacancy_ids)).all()
        if vacancy_ids
        else []
    )

    # Postulaciones por vacante
    postulaciones_por_vacante = []
    for v in vacancies:
        count = sum(1 for a in applications if a.vacancy_id == v.id)
        postulaciones_por_vacante.append({"vacante": v.cargo, "count": count})
    postulaciones_por_vacante.sort(key=lambda x: x["count"], reverse=True)

    # Estado de postulaciones
    estado_labels = ["Enviada", "En revisión", "Aceptada", "Rechazada"]
    estado_postulaciones = {e: 0 for e in estado_labels}
    for a in applications:
        if a.estado in estado_postulaciones:
            estado_postulaciones[a.estado] += 1

    # Postulaciones últimos 30 días
    today = utcnow().date()
    days = [today - timedelta(days=i) for i in range(29, -1, -1)]
    counts_by_day = {d.isoformat(): 0 for d in days}
    for a in applications:
        if a.fecha_postulacion:
            day_key = a.fecha_postulacion.date().isoformat()
            if day_key in counts_by_day:
                counts_by_day[day_key] += 1
    postulaciones_por_dia = [
        {"date": d.isoformat(), "count": counts_by_day[d.isoformat()]} for d in days
    ]

    selected_count = SelectedCandidate.query.filter_by(company_id=company_id).count()

    return jsonify({
        "vacantes_activas": len(vacancies),
        "postulaciones_totales": len(applications),
        "candidatos_seleccionados": selected_count,
        "postulaciones_por_vacante": postulaciones_por_vacante,
        "estado_postulaciones": estado_postulaciones,
        "postulaciones_por_dia": postulaciones_por_dia,
    }), 200


# ─────────────── COMPANY VACANCIES ───────────────
@company_bp.route("/vacancies", methods=["GET"])
@require_role("empresa")
def list_vacancies():
    user = get_current_user()
    profile = user.company_profile
    if not profile:
        return jsonify({"msg": "Perfil no encontrado"}), 404

    vacancies = (
        Vacancy.query.filter_by(company_id=profile.id)
        .order_by(desc(Vacancy.fecha_publicacion))
        .all()
    )
    result = []
    for v in vacancies:
        result.append({
            "id": v.id,
            "cargo": v.cargo,
            "descripcion": v.descripcion,
            "requisitos": v.requisitos,
            "beneficios": v.beneficios,
            "ubicacion": v.ubicacion,
            "modalidad": v.modalidad or "Presencial",
            "tipo_contrato": v.tipo_contrato or "Tiempo completo",
            "fecha_publicacion": (
                v.fecha_publicacion.strftime("%Y-%m-%d") if v.fecha_publicacion else None
            ),
            "postulaciones_count": len(v.applications),
        })
    return jsonify(result), 200


@company_bp.route("/vacancies", methods=["POST"])
@require_role("empresa")
def create_vacancy():
    user = get_current_user()
    profile = user.company_profile
    if not profile:
        return jsonify({"msg": "Perfil no encontrado"}), 404

    data = request.get_json(silent=True) or {}
    cargo = (data.get("cargo") or "").strip()
    descripcion = (data.get("descripcion") or "").strip()
    requisitos = (data.get("requisitos") or "").strip()
    modalidad = data.get("modalidad") or "Presencial"
    tipo_contrato = data.get("tipo_contrato") or "Tiempo completo"

    if not cargo or not descripcion or not requisitos:
        return jsonify({"msg": "Cargo, descripción y requisitos son obligatorios"}), 400

    if modalidad not in ("Presencial", "Remoto", "Híbrido"):
        return jsonify({"msg": "Modalidad inválida"}), 400

    if tipo_contrato not in ("Tiempo completo", "Medio tiempo", "Práctica"):
        return jsonify({"msg": "Tipo de contrato inválido"}), 400

    vacancy = Vacancy(
        company_id=profile.id,
        cargo=cargo,
        descripcion=descripcion,
        requisitos=requisitos,
        beneficios=(data.get("beneficios") or "").strip() or None,
        ubicacion=(data.get("ubicacion") or "").strip() or None,
        modalidad=modalidad,
        tipo_contrato=tipo_contrato,
        skills=(data.get("skills") or "").strip() or None,
        experiencia=(data.get("experiencia") or "").strip() or None,
        nivel_estudios=(data.get("nivel_estudios") or "").strip() or None,
        area=(data.get("area") or "").strip() or None,
        industria=(data.get("industria") or "").strip() or None,
    )
    db.session.add(vacancy)
    db.session.commit()
    return jsonify({"msg": "Vacante publicada exitosamente", "id": vacancy.id}), 201


@company_bp.route("/vacancies/<int:vacancy_id>", methods=["PUT"])
@require_role("empresa")
def update_vacancy(vacancy_id):
    user = get_current_user()
    profile = user.company_profile
    vacancy = Vacancy.query.get(vacancy_id)
    if not vacancy or not profile or vacancy.company_id != profile.id:
        return jsonify({"msg": "Vacante no encontrada"}), 404

    data = request.get_json(silent=True) or {}
    cargo = (data.get("cargo") or "").strip()
    descripcion = (data.get("descripcion") or "").strip()
    requisitos = (data.get("requisitos") or "").strip()
    modalidad = data.get("modalidad") or "Presencial"
    tipo_contrato = data.get("tipo_contrato") or "Tiempo completo"

    if not cargo or not descripcion or not requisitos:
        return jsonify({"msg": "Cargo, descripción y requisitos son obligatorios"}), 400

    if modalidad not in ("Presencial", "Remoto", "Híbrido"):
        return jsonify({"msg": "Modalidad inválida"}), 400

    if tipo_contrato not in ("Tiempo completo", "Medio tiempo", "Práctica"):
        return jsonify({"msg": "Tipo de contrato inválido"}), 400

    vacancy.cargo = cargo
    vacancy.descripcion = descripcion
    vacancy.requisitos = requisitos
    vacancy.beneficios = (data.get("beneficios") or "").strip() or None
    vacancy.ubicacion = (data.get("ubicacion") or "").strip() or None
    vacancy.modalidad = modalidad
    vacancy.tipo_contrato = tipo_contrato
    vacancy.skills = (data.get("skills") or "").strip() or None
    vacancy.experiencia = (data.get("experiencia") or "").strip() or None
    vacancy.nivel_estudios = (data.get("nivel_estudios") or "").strip() or None
    vacancy.area = (data.get("area") or "").strip() or None
    vacancy.industria = (data.get("industria") or "").strip() or None

    db.session.commit()
    return jsonify({"msg": "Vacante actualizada exitosamente"}), 200


@company_bp.route("/vacancies/<int:vacancy_id>", methods=["DELETE"])
@require_role("empresa")
def delete_vacancy(vacancy_id):
    user = get_current_user()
    profile = user.company_profile
    vacancy = Vacancy.query.get(vacancy_id)
    if not vacancy or vacancy.company_id != profile.id:
        return jsonify({"msg": "Vacante no encontrada"}), 404

    db.session.delete(vacancy)
    db.session.commit()
    return jsonify({"msg": "Vacante eliminada exitosamente"}), 200


# ─────────────────── VACANCY APPLICANTS ───────────────────
APPLICATION_STATES = ("En revisión", "Aceptada", "Rechazada")


@company_bp.route("/applications", methods=["GET"])
@require_role("empresa")
def list_all_applications():
    """Todas las postulaciones recibidas en cualquier vacante de la empresa."""
    user = get_current_user()
    profile = user.company_profile
    if not profile:
        return jsonify({"applications": []}), 200

    vacancy_ids = [v.id for v in Vacancy.query.filter_by(company_id=profile.id).all()]
    if not vacancy_ids:
        return jsonify({"applications": []}), 200

    apps = (
        Application.query.filter(Application.vacancy_id.in_(vacancy_ids))
        .order_by(Application.fecha_postulacion.desc())
        .all()
    )
    result = []
    for a in apps:
        sp = a.student
        result.append({
            "id": a.id,
            "estado": a.estado,
            "fecha_postulacion": (
                a.fecha_postulacion.strftime("%Y-%m-%d") if a.fecha_postulacion else None
            ),
            "vacancy_id": a.vacancy_id,
            "cargo": a.vacancy.cargo if a.vacancy else None,
            "student": {
                "user_id": sp.user_id,
                **student_profile_to_dict(sp),
            } if sp else None,
        })
    return jsonify({"applications": result}), 200


@company_bp.route("/vacancies/<int:vacancy_id>/applications", methods=["GET"])
@require_role("empresa")
def list_vacancy_applications(vacancy_id):
    user = get_current_user()
    profile = user.company_profile
    vacancy = Vacancy.query.get(vacancy_id)
    if not vacancy or not profile or vacancy.company_id != profile.id:
        return jsonify({"msg": "Vacante no encontrada"}), 404

    apps = (
        Application.query.filter_by(vacancy_id=vacancy.id)
        .order_by(Application.fecha_postulacion.desc())
        .all()
    )
    result = []
    for a in apps:
        sp = a.student
        result.append({
            "id": a.id,
            "estado": a.estado,
            "fecha_postulacion": (
                a.fecha_postulacion.strftime("%Y-%m-%d") if a.fecha_postulacion else None
            ),
            "student": {
                "user_id": sp.user_id,
                **student_profile_to_dict(sp),
            } if sp else None,
        })
    return jsonify({"vacancy": {"id": vacancy.id, "cargo": vacancy.cargo}, "applications": result}), 200


@company_bp.route("/applications/<int:application_id>", methods=["PUT"])
@require_role("empresa")
def update_application_status(application_id):
    user = get_current_user()
    profile = user.company_profile

    application = Application.query.get(application_id)
    if not application or not profile or application.vacancy.company_id != profile.id:
        return jsonify({"msg": "Postulación no encontrada"}), 404

    data = request.get_json(silent=True) or {}
    estado = (data.get("estado") or "").strip()
    if estado not in APPLICATION_STATES:
        return jsonify({"msg": "Estado inválido"}), 400

    application.estado = estado

    sp = application.student
    if sp and sp.user_id:
        create_notification(
            user_id=sp.user_id,
            tipo="postulacion_actualizada",
            mensaje=f"Tu postulación a \"{application.vacancy.cargo}\" cambió a {estado}",
            link="/estudiante/postulaciones",
        )

    db.session.commit()
    return jsonify({"msg": "Estado actualizado exitosamente", "estado": estado}), 200


# ─────────────── STUDENTS LIST ───────────────
@company_bp.route("/students", methods=["GET"])
@require_role("empresa")
def list_students():
    user = get_current_user()
    profile = user.company_profile

    saved_ids = set()
    if profile:
        saved = SelectedCandidate.query.filter_by(company_id=profile.id).all()
        saved_ids = {s.student_id for s in saved}

    students = User.query.filter_by(role="estudiante").all()
    result = []
    for s in students:
        sp = s.student_profile
        if sp:
            result.append({
                "id": s.id,
                "email": s.email,
                "nombre": sp.nombre,
                "foto_url": sp.foto_url,
                "carrera": sp.programa,
                "semestre": sp.semestre,
                "universidad": sp.institucion,
                "habilidades": sp.habilidades or "",
                "ubicacion": sp.ciudad,
                "estado": "Activo",
                "is_saved": sp.id in saved_ids,
            })
    return jsonify(result), 200


@company_bp.route("/students/<int:user_id>", methods=["GET"])
@require_role("empresa")
def get_student(user_id):
    student_user = User.query.get(user_id)
    if not student_user or student_user.role != "estudiante":
        return jsonify({"msg": "Estudiante no encontrado"}), 404

    sp = student_user.student_profile
    if not sp:
        return jsonify({"msg": "Perfil incompleto"}), 404

    portfolios = [
        {"id": p.id, "tipo": p.tipo, "titulo": p.titulo, "archivo_url": p.archivo_url, "enlace_url": p.enlace_url}
        for p in sp.portfolios
    ]
    socials = [{"id": s.id, "red": s.red, "url": s.url} for s in sp.social_links]

    return jsonify({
        "id": student_user.id,
        "email": student_user.email,
        "nombre": sp.nombre,
        "foto_url": sp.foto_url,
        "carrera": sp.programa,
        "semestre": sp.semestre,
        "universidad": sp.institucion,
        "ubicacion": sp.ciudad,
        "telefono": sp.telefono,
        "fecha_nacimiento": sp.fecha_nacimiento.isoformat() if sp.fecha_nacimiento else None,
        "portfolios": portfolios,
        "social_links": socials,
        "rol": sp.rol,
        "descripcion": sp.descripcion,
        "habilidades": sp.habilidades or "",
        "estado": "Activo",
    }), 200


# ─────────────── SAVED CANDIDATES ───────────────
@company_bp.route("/saved_candidates", methods=["GET"])
@require_role("empresa")
def list_saved_candidates():
    user = get_current_user()
    profile = user.company_profile
    if not profile:
        return jsonify({"msg": "Perfil no encontrado"}), 404

    saved = SelectedCandidate.query.filter_by(company_id=profile.id).all()
    result = []
    for s in saved:
        sp = StudentProfile.query.get(s.student_id)
        if sp:
            user_email = User.query.get(sp.user_id).email
            result.append({
                "id": sp.user_id,
                "student_profile_id": sp.id,
                "email": user_email,
                "nombre": sp.nombre,
                "carrera": sp.programa,
                "semestre": sp.semestre,
                "universidad": sp.institucion,
                "habilidades": sp.habilidades or "",
                "estado": s.estado,
                "ubicacion": sp.ciudad,
                "foto_url": sp.foto_url,
            })
    return jsonify(result), 200


@company_bp.route("/saved_candidates", methods=["POST"])
@require_role("empresa")
def save_candidate():
    user = get_current_user()
    profile = user.company_profile
    data = request.get_json(silent=True) or {}
    student_user_id = data.get("student_id")

    student_user = User.query.get(student_user_id)
    if not student_user or not student_user.student_profile:
        return jsonify({"msg": "Estudiante no encontrado"}), 404

    sp_id = student_user.student_profile.id
    exists = SelectedCandidate.query.filter_by(company_id=profile.id, student_id=sp_id).first()
    if exists:
        return jsonify({"msg": "El candidato ya está en la lista"}), 400

    db.session.add(SelectedCandidate(company_id=profile.id, student_id=sp_id))
    db.session.commit()
    return jsonify({"msg": "Candidato guardado exitosamente"}), 201


CANDIDATE_STATES = ("En proceso", "Contactado", "Entrevista", "Contratado", "Descartado")


@company_bp.route("/saved_candidates", methods=["PUT"])
@require_role("empresa")
def update_saved_candidate():
    user = get_current_user()
    profile = user.company_profile
    data = request.get_json(silent=True) or {}
    student_user_id = data.get("student_id")
    estado = (data.get("estado") or "").strip()

    if estado not in CANDIDATE_STATES:
        return jsonify({"msg": "Estado inválido"}), 400

    student_user = User.query.get(student_user_id)
    if not student_user or not student_user.student_profile:
        return jsonify({"msg": "Estudiante no encontrado"}), 404

    sp_id = student_user.student_profile.id
    saved = SelectedCandidate.query.filter_by(company_id=profile.id, student_id=sp_id).first()
    if not saved:
        return jsonify({"msg": "Candidato no encontrado en guardados"}), 404

    saved.estado = estado
    db.session.commit()
    return jsonify({"msg": "Estado actualizado exitosamente", "estado": estado}), 200


@company_bp.route("/saved_candidates", methods=["DELETE"])
@require_role("empresa")
def remove_candidate():
    user = get_current_user()
    profile = user.company_profile
    student_user_id = request.args.get("student_id")

    student_user = User.query.get(student_user_id)
    if not student_user or not student_user.student_profile:
        return jsonify({"msg": "Estudiante no encontrado"}), 404

    sp_id = student_user.student_profile.id
    saved = SelectedCandidate.query.filter_by(company_id=profile.id, student_id=sp_id).first()
    if saved:
        db.session.delete(saved)
        db.session.commit()
        return jsonify({"msg": "Candidato removido exitosamente"}), 200
    return jsonify({"msg": "Candidato no encontrado en guardados"}), 404

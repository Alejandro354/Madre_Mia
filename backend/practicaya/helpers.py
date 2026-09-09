from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from extensions import db
from models import User, Notification


def get_current_user():
    identity = get_jwt_identity()
    if identity is None:
        return None
    return User.query.get(int(identity))


def require_user(fn):
    """Decorator: JWT + user existence check."""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        if get_current_user() is None:
            return jsonify({"msg": "Sesión inválida o usuario no encontrado"}), 401
        return fn(*args, **kwargs)
    return wrapper


def require_role(role):
    """Decorator factory: ensures user has the given role."""
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            user = get_current_user()
            if user is None:
                return jsonify({"msg": "Sesión inválida"}), 401
            if user.role != role:
                return jsonify({"msg": "Acceso no autorizado"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


# ─────────── Serializers ───────────

def user_to_dict(user, include_profile=False):
    data = {
        "id": user.id,
        "email": user.email,
        "role": user.role,
    }
    if user.role == "estudiante" and user.student_profile:
        data["nombre"] = user.student_profile.nombre
        if include_profile:
            data["profile"] = student_profile_to_dict(user.student_profile)
    elif user.role == "empresa" and user.company_profile:
        data["nombre_empresa"] = user.company_profile.nombre_empresa
        if include_profile:
            data["profile"] = company_profile_to_dict(user.company_profile)
    return data


def student_profile_to_dict(profile):
    return {
        "nombre": profile.nombre,
        "rol": profile.rol,
        "telefono": profile.telefono,
        "fecha_nacimiento": (
            profile.fecha_nacimiento.isoformat() if profile.fecha_nacimiento else None
        ),
        "ciudad": profile.ciudad,
        "institucion": profile.institucion,
        "programa": profile.programa,
        "semestre": profile.semestre,
        "descripcion": profile.descripcion,
        "habilidades": profile.habilidades or "",
        "foto_url": profile.foto_url,
    }


def company_profile_to_dict(profile):
    return {
        "nombre_empresa": profile.nombre_empresa,
        "descripcion": profile.descripcion,
        "ubicacion": profile.ubicacion,
        "sitio_web": profile.sitio_web,
        "industria": profile.industria,
        "tamano_empresa": profile.tamano_empresa,
        "anio_fundacion": profile.anio_fundacion,
        "logo_url": profile.logo_url,
        "banner_url": profile.banner_url,
        "linkedin": profile.linkedin,
        "instagram": profile.instagram,
    }


def vacancy_summary(v):
    company = v.company
    return {
        "id": v.id,
        "cargo": v.cargo,
        "empresa": company.nombre_empresa if company else "Empresa",
        "ubicacion": v.ubicacion,
        "modalidad": v.modalidad or "Presencial",
        "tipo_contrato": v.tipo_contrato or "Tiempo completo",
        "descripcion": v.descripcion,
        "fecha_publicacion": (
            v.fecha_publicacion.strftime("%Y-%m-%d") if v.fecha_publicacion else "Reciente"
        ),
        "logo_url": company.logo_url if company and company.logo_url else None,
    }


def vacancy_detail(v):
    data = vacancy_summary(v)
    data.update({
        "requisitos": v.requisitos,
        "beneficios": v.beneficios,
        "fecha_limite": v.fecha_limite.isoformat() if v.fecha_limite else None,
        "skills": [s.strip() for s in (v.skills or "").split(",") if s.strip()],
        "experiencia": v.experiencia,
        "nivel_estudios": v.nivel_estudios,
        "area": v.area,
        "industria": v.industria,
    })
    return data


def portfolio_item_to_dict(item):
    return {
        "id": item.id,
        "tipo": item.tipo,
        "titulo": item.titulo,
        "archivo_url": item.archivo_url,
        "enlace_url": item.enlace_url,
        "created_at": item.created_at.isoformat() if item.created_at else None,
    }


def social_link_to_dict(link):
    return {"id": link.id, "red": link.red, "url": link.url}


def notification_to_dict(n):
    return {
        "id": n.id,
        "tipo": n.tipo,
        "mensaje": n.mensaje,
        "link": n.link,
        "leido": n.leido,
        "created_at": n.created_at.isoformat() if n.created_at else None,
    }


def create_notification(user_id, tipo, mensaje, link=None):
    notification = Notification(user_id=user_id, tipo=tipo, mensaje=mensaje, link=link)
    db.session.add(notification)
    return notification


def application_to_dict(app):
    v = app.vacancy
    company = v.company if v else None
    return {
        "id": app.id,
        "vacancy_id": v.id if v else None,
        "cargo": v.cargo if v else None,
        "empresa": company.nombre_empresa if company else "Empresa",
        "ubicacion": v.ubicacion if v else None,
        "estado": app.estado,
        "fecha_postulacion": (
            app.fecha_postulacion.strftime("%Y-%m-%d") if app.fecha_postulacion else "Reciente"
        ),
        "logo_url": company.logo_url if company and company.logo_url else None,
    }

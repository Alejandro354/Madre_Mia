from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from models import Application, PortfolioItem, SocialLink, User, VacancyFavorite


def get_current_user():
    identity = get_jwt_identity()
    if identity is None:
        return None
    return User.query.get(int(identity))


def require_user(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        if get_current_user() is None:
            return jsonify({"errors": {"general": "Sesión inválida o usuario no encontrado"}}), 401
        return fn(*args, **kwargs)

    return wrapper


def user_to_dict(user, include_profile=False):
    data = {
        "id": user.id,
        "nombre_completo": user.nombre_completo,
        "email": user.email,
    }
    if include_profile and user.profile is not None:
        data["profile"] = profile_to_dict(user.profile)
    return data


def profile_to_dict(profile):
    return {
        "fecha_nacimiento": (
            profile.fecha_nacimiento.isoformat() if profile.fecha_nacimiento else None
        ),
        "telefono": profile.telefono,
        "institucion": profile.institucion,
        "programa": profile.programa,
        "semestre": profile.semestre,
        "ciudad": profile.ciudad,
        "descripcion": profile.descripcion,
        "foto_url": f"/uploads/{profile.foto_url}" if profile.foto_url else None,
    }


def vacancy_summary(v):
    return {
        "id": v.id,
        "empresa": v.empresa,
        "cargo": v.cargo,
        "ubicacion": v.ubicacion,
        "modalidad": v.modalidad,
        "jornada": v.jornada,
        "fecha_publicacion": v.fecha_publicacion.isoformat(),
        "descripcion": v.descripcion,
    }


def vacancy_detail(v):
    data = vacancy_summary(v)
    data.update(
        {
            "descripcion": v.descripcion,
            "requisitos": v.requisitos,
            "beneficios": v.beneficios,
            "fecha_limite": v.fecha_limite.isoformat() if v.fecha_limite else None,
            # El frontend recibe ya la lista partida; la columna guarda un
            # texto separado por comas.
            "skills": [s.strip() for s in (v.skills or "").split(",") if s.strip()],
            "experiencia": v.experiencia,
            "nivel_estudios": v.nivel_estudios,
            "area": v.area,
            "industria": v.industria,
        }
    )
    return data


def portfolio_item_to_dict(item):
    return {
        "id": item.id,
        "tipo": item.tipo,
        "titulo": item.titulo,
        "archivo_url": f"/uploads/{item.archivo_url}" if item.archivo_url else None,
        "enlace_url": item.enlace_url,
        "created_at": item.created_at.isoformat() if item.created_at else None,
    }


def social_link_to_dict(link):
    return {"red": link.red, "url": link.url}


def application_to_dict(application):
    v = application.vacancy
    return {
        "id": application.id,
        "vacancy_id": v.id,
        "empresa": v.empresa,
        "cargo": v.cargo,
        "ubicacion": v.ubicacion,
        "estado": application.estado,
        "created_at": application.created_at.isoformat()
        if application.created_at
        else None,
    }


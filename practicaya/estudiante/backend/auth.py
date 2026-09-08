from datetime import timedelta

from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)
from werkzeug.security import check_password_hash, generate_password_hash

from extensions import db
from helpers import get_current_user, require_user, user_to_dict
from models import User
from utils import is_valid_email, utcnow, validate_password

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def create_tokens(user):
    access = create_access_token(identity=str(user.id))
    refresh = create_refresh_token(identity=str(user.id))
    return access, refresh


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    errors = {}

    nombre = (data.get("nombre_completo") or "").strip()
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""
    confirm = data.get("confirm_password") or ""

    if not nombre:
        errors["nombre_completo"] = "Este campo es obligatorio"

    if not email:
        errors["email"] = "Este campo es obligatorio"
    elif not is_valid_email(email):
        errors["email"] = "Formato de correo inválido"

    if not password:
        errors["password"] = "Este campo es obligatorio"
    elif not validate_password(password):
        errors["password"] = (
            "La contraseña debe tener mínimo 8 caracteres, incluyendo letras y números"
        )

    if not confirm:
        errors["confirm_password"] = "Este campo es obligatorio"
    elif confirm != password:
        errors["confirm_password"] = "Las contraseñas no coinciden"

    if errors:
        return jsonify({"errors": errors}), 400

    if User.query.filter_by(email=email.lower()).first():
        return (
            jsonify(
                {
                    "errors": {
                        "email": "Este correo ya está registrado. Inicia sesión o usa otro correo"
                    }
                }
            ),
            409,
        )

    user = User(
        nombre_completo=nombre,
        email=email.lower(),
        password_hash=generate_password_hash(password),
    )
    db.session.add(user)
    db.session.commit()

    access, refresh = create_tokens(user)
    return (
        jsonify(
            {
                "message": "Cuenta creada",
                "user": user_to_dict(user),
                "access_token": access,
                "refresh_token": refresh,
            }
        ),
        201,
    )


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    errors = {}
    if not email:
        errors["email"] = "Este campo es obligatorio"
    if not password:
        errors["password"] = "Este campo es obligatorio"
    if errors:
        return jsonify({"errors": errors}), 400

    user = User.query.filter_by(email=email.lower()).first()
    now = utcnow()

    if user and user.lockout_until and user.lockout_until > now:
        remaining = int((user.lockout_until - now).total_seconds())
        minutes = max(1, (remaining + 59) // 60)
        return (
            jsonify(
                {
                    "errors": {
                        "general": f"Cuenta bloqueada temporalmente. Intenta de nuevo en {minutes} minuto(s)"
                    }
                }
            ),
            429,
        )

    if not user or not check_password_hash(user.password_hash, password):
        if user:
            user.failed_attempts += 1
            if user.failed_attempts >= 5:
                user.lockout_until = now + timedelta(minutes=5)
                user.failed_attempts = 0
                db.session.commit()
                return (
                    jsonify(
                        {
                            "errors": {
                                "general": "Demasiados intentos fallidos. Cuenta bloqueada por 5 minutos"
                            }
                        }
                    ),
                    429,
                )
            db.session.commit()
            return (
                jsonify(
                    {
                        "errors": {"general": "Correo o contraseña incorrectos"},
                        "account_exists": True,
                    }
                ),
                401,
            )
        return (
            jsonify(
                {
                    "errors": {"general": "Correo o contraseña incorrectos"},
                    "account_exists": False,
                }
            ),
            401,
        )

    user.failed_attempts = 0
    user.lockout_until = None
    db.session.commit()

    access, refresh = create_tokens(user)
    return (
        jsonify(
            {
                "user": user_to_dict(user),
                "access_token": access,
                "refresh_token": refresh,
            }
        ),
        200,
    )


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    user = User.query.get(int(identity)) if identity else None
    if user is None:
        return jsonify({"errors": {"general": "Sesión inválida o usuario no encontrado"}}), 401
    access = create_access_token(identity=identity)
    return jsonify({"access_token": access}), 200


@auth_bp.route("/me", methods=["GET"])
@require_user
def me():
    user = get_current_user()
    return jsonify({"user": user_to_dict(user, include_profile=True)}), 200

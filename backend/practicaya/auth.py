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
from models import User, StudentProfile
from utils import is_valid_email, utcnow, validate_password

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def _create_tokens(user):
    access = create_access_token(identity=str(user.id))
    refresh = create_refresh_token(identity=str(user.id))
    return access, refresh


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""
    confirm = data.get("confirm_password") or ""
    nombre = (data.get("nombre") or "").strip()
    # El registro público solo crea cuentas de estudiante; se ignora cualquier
    # "role" que envíe el cliente (las cuentas de empresa se crean por seed.py
    # o un futuro panel administrativo, nunca desde este endpoint).
    role = "estudiante"

    if not all([email, password, confirm, nombre]):
        return jsonify({"msg": "Todos los campos son obligatorios"}), 400

    if not is_valid_email(email):
        return jsonify({"msg": "Formato de correo inválido"}), 400

    if password != confirm:
        return jsonify({"msg": "Las contraseñas no coinciden"}), 400

    if not validate_password(password):
        return jsonify({"msg": "La contraseña debe tener mínimo 8 caracteres, incluyendo letras y números"}), 400

    if User.query.filter_by(email=email.lower()).first():
        return jsonify({"msg": "Este correo ya está registrado. Inicia sesión o usa otro correo"}), 409

    user = User(
        email=email.lower(),
        password_hash=generate_password_hash(password),
        role=role,
    )
    db.session.add(user)
    db.session.commit()

    profile = StudentProfile(user_id=user.id, nombre=nombre)
    db.session.add(profile)
    db.session.commit()

    access, refresh = _create_tokens(user)
    return jsonify({
        "msg": "Usuario registrado exitosamente",
        "user": user_to_dict(user),
        "access_token": access,
        "refresh_token": refresh,
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"msg": "Correo y contraseña son obligatorios"}), 400

    user = User.query.filter_by(email=email.lower()).first()
    now = utcnow()

    # Check lockout
    if user and user.lockout_until and user.lockout_until > now:
        remaining = int((user.lockout_until - now).total_seconds())
        minutes = max(1, (remaining + 59) // 60)
        return jsonify({"msg": f"Cuenta bloqueada temporalmente. Intenta en {minutes} minuto(s)"}), 429

    if not user or not check_password_hash(user.password_hash, password):
        if user:
            user.failed_attempts += 1
            if user.failed_attempts >= 5:
                user.lockout_until = now + timedelta(minutes=5)
                user.failed_attempts = 0
                db.session.commit()
                return jsonify({"msg": "Demasiados intentos fallidos. Cuenta bloqueada por 5 minutos"}), 429
            db.session.commit()
        return jsonify({"msg": "Correo o contraseña incorrectos"}), 401

    # Reset on success
    user.failed_attempts = 0
    user.lockout_until = None
    db.session.commit()

    access, refresh = _create_tokens(user)
    return jsonify({
        "user": user_to_dict(user),
        "access_token": access,
        "refresh_token": refresh,
    }), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    user = User.query.get(int(identity)) if identity else None
    if user is None:
        return jsonify({"msg": "Sesión inválida"}), 401
    access = create_access_token(identity=identity)
    return jsonify({"access_token": access}), 200


@auth_bp.route("/me", methods=["GET"])
@require_user
def me():
    user = get_current_user()
    return jsonify({"user": user_to_dict(user, include_profile=True)}), 200

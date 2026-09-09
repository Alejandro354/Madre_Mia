import os

from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash

from extensions import db
from models import CompanyProfile, User
from utils import is_valid_email, validate_password

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

# Secreto compartido solo entre backends (nunca llega al navegador). Quien
# llama esta ruta es el backend de innovacion-social, ya verificó su propio
# admin, y actúa en su nombre para dar de alta una empresa.
INTERNAL_KEY = os.environ.get("INTERNAL_GATEWAY_KEY", "dev-internal-key-practicaya")


@admin_bp.route("/companies", methods=["POST"])
def create_company():
    if request.headers.get("X-Internal-Key") != INTERNAL_KEY:
        return jsonify({"msg": "No autorizado"}), 403

    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""
    nombre = (data.get("nombre") or "").strip()

    if not email or not password or not nombre:
        return jsonify({"msg": "Todos los campos son obligatorios"}), 400

    if not is_valid_email(email):
        return jsonify({"msg": "Formato de correo inválido"}), 400

    if not validate_password(password):
        return jsonify({"msg": "La contraseña debe tener mínimo 8 caracteres, incluyendo letras y números"}), 400

    if User.query.filter_by(email=email.lower()).first():
        return jsonify({"msg": "Este correo ya está registrado"}), 409

    user = User(
        email=email.lower(),
        password_hash=generate_password_hash(password),
        role="empresa",
    )
    db.session.add(user)
    db.session.commit()

    profile = CompanyProfile(user_id=user.id, nombre_empresa=nombre)
    db.session.add(profile)
    db.session.commit()

    return jsonify({"msg": "Empresa creada exitosamente", "user_id": user.id}), 201

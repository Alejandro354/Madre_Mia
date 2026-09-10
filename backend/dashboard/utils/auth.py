"""Guard de autenticación para los blueprints del dashboard.

Exige un header `Authorization: Bearer <token>` firmado con la misma clave
que usa el backend de practicaya (ver `config.JWT_SECRET_KEY`), así que
cualquier sesión ya iniciada ahí sirve para entrar al panel de reportes.
"""
from functools import wraps

import jwt
from flask import current_app, jsonify, request


def _extract_token():
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    return header[len("Bearer "):].strip() or None


def require_auth(view):
    """Exige un Bearer token válido (firmado con JWT_SECRET_KEY) antes de ejecutar la vista."""

    @wraps(view)
    def wrapped(*args, **kwargs):
        token = _extract_token()
        if not token:
            return jsonify({"errors": {"general": "No autenticado."}}), 401

        secret = current_app.config.get("JWT_SECRET_KEY")
        try:
            jwt.decode(token, secret, algorithms=["HS256"])
        except Exception:
            return jsonify({"errors": {"general": "Sesión inválida o expirada."}}), 401

        return view(*args, **kwargs)

    return wrapped

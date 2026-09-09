"""Guard de autenticación para los blueprints del dashboard.

Este backend se documenta a sí mismo (ver README.md) como un módulo pensado
para integrarse dentro de una app Flask existente que ya tiene su propio
login (`/api/auth/login`, JWT en localStorage — ver `frontend/src/api/client.js`).
Sin embargo, tal como estaba, ni las rutas del dashboard exigían token, ni el
frontend se lo mandaba (ver fix en `frontend/src/api/adminClient.js`), así
que el panel completo quedaba abierto a cualquiera con la URL.

Este decorador cierra el lado del servidor: exige un header
`Authorization: Bearer <token>` y, si se configura `JWT_SECRET_KEY` (la misma
clave que use tu servicio de login), valida la firma del JWT con PyJWT. Si no
se configura la clave, al menos exige que el token esté presente — mejor que
nada, pero se recomienda encarecidamente configurar `JWT_SECRET_KEY` en
producción para tener verificación real.
"""
import os
from functools import wraps

from flask import current_app, jsonify, request

JWT_SECRET_ENV = "JWT_SECRET_KEY"
JWT_ALGORITHMS = ["HS256"]


def _extract_token():
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    return header[len("Bearer "):].strip() or None


def require_auth(view):
    """Exige un Bearer token válido antes de ejecutar la vista.

    - Si `JWT_SECRET_KEY` está configurado (env var o app.config) y PyJWT
      está instalado, valida firma y expiración del token.
    - Si no, solo exige que el header Authorization esté presente
      (comportamiento mínimo de respaldo; no reemplaza una verificación real).
    """

    @wraps(view)
    def wrapped(*args, **kwargs):
        token = _extract_token()
        if not token:
            return jsonify({"errors": {"general": "No autenticado."}}), 401

        secret = current_app.config.get(JWT_SECRET_ENV) or os.environ.get(JWT_SECRET_ENV)
        if secret:
            try:
                import jwt  # PyJWT — agregar a requirements.txt si se usa esta ruta

                jwt.decode(token, secret, algorithms=JWT_ALGORITHMS)
            except ImportError:
                current_app.logger.warning(
                    "JWT_SECRET_KEY configurado pero PyJWT no está instalado; "
                    "se aceptó el token solo por estar presente. "
                    "Ejecuta: pip install PyJWT"
                )
            except Exception:
                return jsonify({"errors": {"general": "Sesión inválida o expirada."}}), 401

        return view(*args, **kwargs)

    return wrapped

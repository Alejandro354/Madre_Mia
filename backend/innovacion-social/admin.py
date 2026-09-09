import os

import requests
from flask import Blueprint, jsonify, request

from blog import token_required

admin_bp = Blueprint('admin', __name__)

# En el gateway unificado, practicaya vive bajo el mismo proceso/puerto en
# el prefijo /practicaya. Si este backend corre solo (sin el gateway), este
# valor se puede sobreescribir con la variable de entorno correspondiente.
PRACTICAYA_INTERNAL_URL = os.environ.get(
    'PRACTICAYA_INTERNAL_URL', 'http://localhost:5000/practicaya/api/admin/companies'
)
INTERNAL_KEY = os.environ.get('INTERNAL_GATEWAY_KEY', 'dev-internal-key-practicaya')


@admin_bp.route('/api/admin/companies', methods=['POST'])
@token_required
def create_company():
    data = request.get_json(silent=True) or {}
    nombre = (data.get('nombre') or '').strip()
    email = (data.get('email') or '').strip()
    password = data.get('password') or ''

    if not nombre or not email or not password:
        return jsonify({'error': 'Todos los campos son obligatorios'}), 400

    try:
        resp = requests.post(
            PRACTICAYA_INTERNAL_URL,
            json={'nombre': nombre, 'email': email, 'password': password},
            headers={'X-Internal-Key': INTERNAL_KEY},
            timeout=10,
        )
    except requests.RequestException:
        return jsonify({'error': 'No se pudo conectar con PracticaYa. Intenta de nuevo.'}), 502

    try:
        payload = resp.json()
    except ValueError:
        payload = {}

    if resp.status_code >= 400:
        return jsonify({'error': payload.get('msg', 'Error al crear la empresa')}), resp.status_code

    return jsonify({'ok': True, 'msg': payload.get('msg', 'Empresa creada exitosamente')}), 201

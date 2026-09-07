from datetime import datetime, timedelta

import jwt
from flask import Blueprint, current_app, jsonify, request
from werkzeug.security import check_password_hash

from models import Admin, db

auth_bp = Blueprint('auth', __name__)

MAX_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    admin = Admin.query.filter_by(email=email).first()
    if not admin:
        return jsonify({'error': 'Credenciales inválidas'}), 401

    if admin.locked_until and admin.locked_until > datetime.utcnow():
        remaining = int((admin.locked_until - datetime.utcnow()).total_seconds() // 60) + 1
        return jsonify({'error': f'Cuenta bloqueada temporalmente. Intenta de nuevo en {remaining} min.'}), 423

    if not check_password_hash(admin.password_hash, password):
        admin.failed_attempts = (admin.failed_attempts or 0) + 1
        if admin.failed_attempts >= MAX_ATTEMPTS:
            admin.locked_until = datetime.utcnow() + timedelta(minutes=LOCKOUT_MINUTES)
            admin.failed_attempts = 0
            db.session.commit()
            return jsonify({
                'error': f'Demasiados intentos fallidos. Cuenta bloqueada por {LOCKOUT_MINUTES} minutos.'
            }), 423
        db.session.commit()
        return jsonify({'error': 'Credenciales inválidas'}), 401

    admin.failed_attempts = 0
    admin.locked_until = None
    db.session.commit()

    token = jwt.encode(
        {
            'sub': admin.id,
            'email': admin.email,
            'exp': datetime.utcnow() + timedelta(hours=24),
        },
        current_app.config['JWT_SECRET'],
        algorithm='HS256',
    )
    return jsonify({'token': token, 'email': admin.email})

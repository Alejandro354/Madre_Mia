import sys
from getpass import getpass

from werkzeug.security import generate_password_hash

from app import app
from models import Admin, db


def main():
    if len(sys.argv) >= 3:
        email = sys.argv[1].strip().lower()
        password = sys.argv[2]
    else:
        email = input('Email de Mónica: ').strip().lower()
        password = getpass('Contraseña: ')

    if not email or not password:
        print('Email y contraseña son obligatorios.')
        sys.exit(1)

    with app.app_context():
        existing = Admin.query.filter_by(email=email).first()
        if existing:
            existing.password_hash = generate_password_hash(password)
            existing.failed_attempts = 0
            existing.locked_until = None
            db.session.commit()
            print(f'Contraseña actualizada para {email}')
        else:
            admin = Admin(email=email, password_hash=generate_password_hash(password))
            db.session.add(admin)
            db.session.commit()
            print(f'Cuenta creada para {email}')


if __name__ == '__main__':
    main()

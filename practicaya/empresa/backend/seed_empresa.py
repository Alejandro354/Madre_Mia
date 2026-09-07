from app import app, db
from models import User, CompanyProfile
from werkzeug.security import generate_password_hash

def seed_empresa():
    with app.app_context():
        email = 'empresa@practicompu.com'
        existing = User.query.filter_by(email=email).first()
        if not existing:
            new_user = User(
                email=email,
                password_hash=generate_password_hash('empresa123'),
                role='empresa'
            )
            db.session.add(new_user)
            db.session.flush() # get new_user.id
            
            new_empresa = CompanyProfile(
                user_id=new_user.id,
                nombre_empresa='Tech Solutions S.A.',
                descripcion='Empresa de tecnología'
            )
            db.session.add(new_empresa)
            db.session.commit()
            print("=========================================")
            print("✅ Cuenta de EMPRESA creada con éxito:")
            print("Correo: empresa@practicompu.com")
            print("Contraseña: empresa123")
            print("=========================================")
        else:
            print("La empresa ya existe en la base de datos con el correo: empresa@practicompu.com")

if __name__ == '__main__':
    seed_empresa()

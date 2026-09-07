from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False) # 'estudiante' or 'empresa'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    student_profile = db.relationship('StudentProfile', backref='user', uselist=False)
    company_profile = db.relationship('CompanyProfile', backref='user', uselist=False)

class StudentProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    telefono = db.Column(db.String(20))
    fecha_nacimiento = db.Column(db.String(20))
    institucion = db.Column(db.String(100))
    programa = db.Column(db.String(100))
    semestre = db.Column(db.String(20))
    ciudad = db.Column(db.String(50))
    foto_url = db.Column(db.String(255))
    rol = db.Column(db.String(100))
    descripcion = db.Column(db.Text)
    habilidades = db.Column(db.String(255))

    # Relationships
    portfolios = db.relationship('PortfolioItem', backref='student', lazy=True)
    social_links = db.relationship('SocialLink', backref='student', lazy=True)
    applications = db.relationship('Application', backref='student', lazy=True)

class CompanyProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    nombre_empresa = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    logo_url = db.Column(db.String(255))
    ubicacion = db.Column(db.String(100))
    sitio_web = db.Column(db.String(255))
    industria = db.Column(db.String(100))
    tamano_empresa = db.Column(db.String(50))
    anio_fundacion = db.Column(db.String(10))
    banner_url = db.Column(db.Text)
    linkedin = db.Column(db.String(255))
    instagram = db.Column(db.String(255))
    
    # Relationships
    vacancies = db.relationship('Vacancy', backref='company', lazy=True)

class PortfolioItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student_profile.id'), nullable=False)
    tipo = db.Column(db.String(20), nullable=False) # 'archivo' or 'enlace'
    url_o_path = db.Column(db.String(255), nullable=False)
    nombre_archivo = db.Column(db.String(100))

class SocialLink(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student_profile.id'), nullable=False)
    red_social = db.Column(db.String(50), nullable=False) # 'github', 'linkedin', 'instagram'
    url = db.Column(db.String(255), nullable=False)

class Vacancy(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('company_profile.id'), nullable=False)
    cargo = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    requisitos = db.Column(db.Text, nullable=False)
    beneficios = db.Column(db.Text)
    ubicacion = db.Column(db.String(100))
    modalidad = db.Column(db.String(20), default='Presencial') # 'Presencial', 'Remoto', 'Híbrido'
    tipo_contrato = db.Column(db.String(20), default='Tiempo completo') # 'Tiempo completo', 'Medio tiempo', 'Práctica'
    fecha_publicacion = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    applications = db.relationship('Application', backref='vacancy', lazy=True)

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student_profile.id'), nullable=False)
    vacancy_id = db.Column(db.Integer, db.ForeignKey('vacancy.id'), nullable=False)
    estado = db.Column(db.String(20), default='Enviada') # 'Enviada', 'En revisión', 'Rechazada', 'Aceptada'
    fecha_postulacion = db.Column(db.DateTime, default=datetime.utcnow)

class SavedVacancy(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student_profile.id'), nullable=False)
    vacancy_id = db.Column(db.Integer, db.ForeignKey('vacancy.id'), nullable=False)

class SelectedCandidate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('company_profile.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('student_profile.id'), nullable=False)
    estado = db.Column(db.String(20), default="En proceso")

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    contenido = db.Column(db.Text, nullable=False)
    fecha_envio = db.Column(db.DateTime, default=datetime.utcnow)
    leido = db.Column(db.Boolean, default=False)

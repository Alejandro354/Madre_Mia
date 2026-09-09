from extensions import db
from utils import utcnow


# ─────────────────────── USER ───────────────────────
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'estudiante' | 'empresa'
    failed_attempts = db.Column(db.Integer, default=0)
    lockout_until = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=utcnow)

    # Relationships
    student_profile = db.relationship(
        "StudentProfile", backref="user", uselist=False, cascade="all, delete-orphan"
    )
    company_profile = db.relationship(
        "CompanyProfile", backref="user", uselist=False, cascade="all, delete-orphan"
    )


# ─────────────────── STUDENT PROFILE ───────────────────
class StudentProfile(db.Model):
    __tablename__ = "student_profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False
    )
    nombre = db.Column(db.String(150), nullable=False)
    telefono = db.Column(db.String(30))
    fecha_nacimiento = db.Column(db.Date, nullable=True)
    institucion = db.Column(db.String(150))
    programa = db.Column(db.String(150))
    semestre = db.Column(db.String(30))
    ciudad = db.Column(db.String(100))
    foto_url = db.Column(db.String(255))
    rol = db.Column(db.String(100))          # rol profesional que busca
    descripcion = db.Column(db.Text)
    habilidades = db.Column(db.String(255))  # separadas por comas

    # Relationships
    portfolios = db.relationship("PortfolioItem", backref="student", lazy=True, cascade="all, delete-orphan")
    social_links = db.relationship("SocialLink", backref="student", lazy=True, cascade="all, delete-orphan")
    applications = db.relationship("Application", backref="student", lazy=True, cascade="all, delete-orphan")
    saved_vacancies = db.relationship("VacancyFavorite", backref="student", lazy=True, cascade="all, delete-orphan")


# ─────────────────── COMPANY PROFILE ───────────────────
class CompanyProfile(db.Model):
    __tablename__ = "company_profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False
    )
    nombre_empresa = db.Column(db.String(150), nullable=False)
    descripcion = db.Column(db.Text)
    logo_url = db.Column(db.Text)
    ubicacion = db.Column(db.String(100))
    sitio_web = db.Column(db.String(255))
    industria = db.Column(db.String(100))
    tamano_empresa = db.Column(db.String(50))
    anio_fundacion = db.Column(db.String(10))
    banner_url = db.Column(db.Text)
    linkedin = db.Column(db.String(255))
    instagram = db.Column(db.String(255))

    # Relationships
    vacancies = db.relationship("Vacancy", backref="company", lazy=True, cascade="all, delete-orphan")
    selected_candidates = db.relationship("SelectedCandidate", backref="company", lazy=True, cascade="all, delete-orphan")


# ─────────────────── VACANCY ───────────────────
class Vacancy(db.Model):
    __tablename__ = "vacancies"

    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(
        db.Integer, db.ForeignKey("company_profiles.id"), nullable=False
    )
    cargo = db.Column(db.String(150), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    requisitos = db.Column(db.Text, nullable=False)
    beneficios = db.Column(db.Text)
    ubicacion = db.Column(db.String(150))
    modalidad = db.Column(db.String(50), default="Presencial")
    tipo_contrato = db.Column(db.String(50), default="Tiempo completo")
    fecha_publicacion = db.Column(db.DateTime, default=utcnow)
    activa = db.Column(db.Boolean, default=True)

    # Campos extra de detalle
    fecha_limite = db.Column(db.Date, nullable=True)
    skills = db.Column(db.Text, nullable=True)          # separadas por comas
    experiencia = db.Column(db.String(100), nullable=True)
    nivel_estudios = db.Column(db.String(100), nullable=True)
    area = db.Column(db.String(100), nullable=True)
    industria = db.Column(db.String(100), nullable=True)

    # Relationships
    applications = db.relationship("Application", backref="vacancy", lazy=True, cascade="all, delete-orphan")
    favorites = db.relationship("VacancyFavorite", backref="vacancy", lazy=True, cascade="all, delete-orphan")


# ─────────────────── PORTFOLIO ───────────────────
class PortfolioItem(db.Model):
    __tablename__ = "portfolio_items"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(
        db.Integer, db.ForeignKey("student_profiles.id"), nullable=False
    )
    tipo = db.Column(db.String(20), nullable=False)       # 'archivo' | 'enlace'
    titulo = db.Column(db.String(150), nullable=False)
    archivo_url = db.Column(db.String(255), nullable=True)
    enlace_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=utcnow)


# ─────────────────── SOCIAL LINKS ───────────────────
class SocialLink(db.Model):
    __tablename__ = "social_links"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(
        db.Integer, db.ForeignKey("student_profiles.id"), nullable=False
    )
    red = db.Column(db.String(20), nullable=False)        # linkedin | github | instagram
    url = db.Column(db.String(500), nullable=False)

    __table_args__ = (db.UniqueConstraint("student_id", "red"),)


# ─────────────────── APPLICATION ───────────────────
class Application(db.Model):
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(
        db.Integer, db.ForeignKey("student_profiles.id"), nullable=False
    )
    vacancy_id = db.Column(
        db.Integer, db.ForeignKey("vacancies.id"), nullable=False
    )
    estado = db.Column(db.String(30), default="Enviada")
    fecha_postulacion = db.Column(db.DateTime, default=utcnow)

    __table_args__ = (db.UniqueConstraint("student_id", "vacancy_id"),)

    documents = db.relationship(
        "ApplicationDocument", cascade="all, delete-orphan", backref="application"
    )


# ─────────────────── APPLICATION DOCUMENT ───────────────────
class ApplicationDocument(db.Model):
    __tablename__ = "application_documents"

    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(
        db.Integer, db.ForeignKey("applications.id"), nullable=False
    )
    portfolio_item_id = db.Column(
        db.Integer, db.ForeignKey("portfolio_items.id"), nullable=False
    )


# ─────────────────── VACANCY FAVORITES ───────────────────
class VacancyFavorite(db.Model):
    __tablename__ = "vacancy_favorites"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(
        db.Integer, db.ForeignKey("student_profiles.id"), nullable=False
    )
    vacancy_id = db.Column(
        db.Integer, db.ForeignKey("vacancies.id"), nullable=False
    )
    created_at = db.Column(db.DateTime, default=utcnow)

    __table_args__ = (db.UniqueConstraint("student_id", "vacancy_id"),)


# ─────────────────── SELECTED CANDIDATES ───────────────────
class SelectedCandidate(db.Model):
    __tablename__ = "selected_candidates"

    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(
        db.Integer, db.ForeignKey("company_profiles.id"), nullable=False
    )
    student_id = db.Column(
        db.Integer, db.ForeignKey("student_profiles.id"), nullable=False
    )
    estado = db.Column(db.String(20), default="En proceso")

    __table_args__ = (db.UniqueConstraint("company_id", "student_id"),)


# ─────────────────── NOTIFICATIONS ───────────────────
class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    mensaje = db.Column(db.Text, nullable=False)
    link = db.Column(db.String(255), nullable=True)
    leido = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=utcnow)


# ─────────────────── MESSAGES (CHAT) ───────────────────
class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    contenido = db.Column(db.Text, nullable=False)
    fecha_envio = db.Column(db.DateTime, default=utcnow)
    leido = db.Column(db.Boolean, default=False)

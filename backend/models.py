from extensions import db
from utils import utcnow


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    nombre_completo = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    failed_attempts = db.Column(db.Integer, default=0)
    lockout_until = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=utcnow)

    profile = db.relationship(
        "Profile", backref="user", uselist=False, cascade="all, delete-orphan"
    )


class Profile(db.Model):
    __tablename__ = "profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False
    )
    fecha_nacimiento = db.Column(db.Date, nullable=True)
    telefono = db.Column(db.String(30), nullable=True)
    institucion = db.Column(db.String(150), nullable=True)
    programa = db.Column(db.String(150), nullable=True)
    semestre = db.Column(db.String(30), nullable=True)
    ciudad = db.Column(db.String(100), nullable=True)
    descripcion = db.Column(db.Text, nullable=True)
    foto_url = db.Column(db.String(255), nullable=True)


class Vacancy(db.Model):
    __tablename__ = "vacancies"

    id = db.Column(db.Integer, primary_key=True)
    empresa = db.Column(db.String(150), nullable=False)
    cargo = db.Column(db.String(150), nullable=False)
    ubicacion = db.Column(db.String(150), nullable=False)
    modalidad = db.Column(db.String(50), nullable=True)
    jornada = db.Column(db.String(50), nullable=True)
    fecha_publicacion = db.Column(db.DateTime, nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    requisitos = db.Column(db.Text, nullable=False)
    beneficios = db.Column(db.Text, nullable=False)
    activa = db.Column(db.Boolean, default=True)

    # Detalle de la vacante. Todos opcionales: las vacantes creadas antes de
    # estas columnas siguen siendo válidas y el frontend omite lo que falte.
    fecha_limite = db.Column(db.Date, nullable=True)
    skills = db.Column(db.Text, nullable=True)  # separadas por comas
    experiencia = db.Column(db.String(100), nullable=True)
    nivel_estudios = db.Column(db.String(100), nullable=True)
    area = db.Column(db.String(100), nullable=True)
    industria = db.Column(db.String(100), nullable=True)


class VacancyFavorite(db.Model):
    __tablename__ = "vacancy_favorites"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    vacancy_id = db.Column(db.Integer, db.ForeignKey("vacancies.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=utcnow)

    __table_args__ = (db.UniqueConstraint("user_id", "vacancy_id"),)

    vacancy = db.relationship("Vacancy")


class Application(db.Model):
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    vacancy_id = db.Column(db.Integer, db.ForeignKey("vacancies.id"), nullable=False)
    estado = db.Column(db.String(30), default="Enviada")
    created_at = db.Column(db.DateTime, default=utcnow)

    __table_args__ = (db.UniqueConstraint("user_id", "vacancy_id"),)

    vacancy = db.relationship("Vacancy")
    documents = db.relationship(
        "ApplicationDocument", cascade="all, delete-orphan", backref="application"
    )


class ApplicationDocument(db.Model):
    __tablename__ = "application_documents"

    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(
        db.Integer, db.ForeignKey("applications.id"), nullable=False
    )
    portfolio_item_id = db.Column(
        db.Integer, db.ForeignKey("portfolio_items.id"), nullable=False
    )


class PortfolioItem(db.Model):
    __tablename__ = "portfolio_items"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)  # 'archivo' | 'enlace'
    titulo = db.Column(db.String(150), nullable=False)
    archivo_url = db.Column(db.String(255), nullable=True)
    enlace_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=utcnow)


class SocialLink(db.Model):
    __tablename__ = "social_links"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    red = db.Column(db.String(20), nullable=False)  # linkedin | github | instagram
    url = db.Column(db.String(500), nullable=False)

    __table_args__ = (db.UniqueConstraint("user_id", "red"),)

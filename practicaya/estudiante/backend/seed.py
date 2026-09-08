from datetime import date, timedelta

from app import create_app
from extensions import db
from models import Vacancy
from utils import utcnow

VACANCIES = [
    {
        "empresa": "TechNova",
        "cargo": "Desarrollador Frontend Junior",
        "ubicacion": "Bogotá, Colombia",
        "modalidad": "Presencial",
        "jornada": "Tiempo completo",
        "descripcion": "Desarrolla interfaces modernas y escalables con las mejores tecnologías. Buscamos un desarrollador frontend junior apasionado por React para unirse a nuestro equipo de producto.",
        "requisitos": "Conocimientos de JavaScript y React. Manejo de HTML, CSS y Git. Inglés básico.",
        "beneficios": "Trabajo remoto, horario flexible, plan de capacitación y ambiente de crecimiento.",
        "fecha_limite": date(2026, 10, 15),
        "skills": "React, JavaScript, HTML, CSS, Git",
        "experiencia": "1 - 2 años",
        "nivel_estudios": "Profesional / Técnico",
        "area": "Desarrollo",
        "industria": "Tecnología",
    },
    {
        "empresa": "DataSur",
        "cargo": "Analista de Datos",
        "ubicacion": "Medellín, Colombia",
        "modalidad": "Híbrido",
        "jornada": "Tiempo completo",
        "descripcion": "Analiza y transforma datos para apoyar decisiones de negocio en clientes de retail.",
        "requisitos": "Manejo de SQL y Excel avanzado. Conocimiento de Python o R es un plus.",
        "beneficios": "Salario competitivo, seguro de salud y bonos por desempeño.",
        "fecha_limite": date(2026, 10, 30),
        "skills": "SQL, Excel, Python, Power BI",
        "experiencia": "2 - 3 años",
        "nivel_estudios": "Profesional",
        "area": "Datos",
        "industria": "Retail",
    },
    {
        "empresa": "CreativoLab",
        "cargo": "Diseñador Gráfico",
        "ubicacion": "Cali, Colombia",
        "modalidad": "Remoto",
        "jornada": "Medio tiempo",
        "descripcion": "Crea piezas visuales para campañas digitales de marcas nacionales e internacionales.",
        "requisitos": "Dominio de Illustrator y Photoshop. Portafolio demostrable.",
        "beneficios": "Modalidad híbrida, equipo creativo y capacitaciones constantes.",
        "fecha_limite": date(2026, 9, 30),
        "skills": "Illustrator, Photoshop, Figma, Branding",
        "experiencia": "1 - 2 años",
        "nivel_estudios": "Técnico / Tecnólogo",
        "area": "Diseño",
        "industria": "Publicidad",
    },
    {
        "empresa": "FinanzasPro",
        "cargo": "Practicante de Finanzas",
        "ubicacion": "Bogotá, Colombia",
        "modalidad": "Presencial",
        "jornada": "Medio tiempo",
        "descripcion": "Apoya al equipo de finanzas en conciliaciones, reportes y análisis de estados financieros.",
        "requisitos": "Estudiante de últimos semestres de administración, economía o finanzas. Excel intermedio.",
        "beneficios": "Auxilio de transporte, posibilidad de contratación y mentoría.",
        "fecha_limite": date(2026, 11, 20),
        "skills": "Excel, Análisis financiero, Conciliaciones",
        "experiencia": "Sin experiencia",
        "nivel_estudios": "Estudiante últimos semestres",
        "area": "Finanzas",
        "industria": "Servicios financieros",
    },
]


def run():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()

        base = utcnow()
        for i, data in enumerate(VACANCIES):
            db.session.add(
                Vacancy(
                    empresa=data["empresa"],
                    cargo=data["cargo"],
                    ubicacion=data["ubicacion"],
                    modalidad=data.get("modalidad"),
                    jornada=data.get("jornada"),
                    fecha_publicacion=base - timedelta(days=i * 2),
                    descripcion=data["descripcion"],
                    requisitos=data["requisitos"],
                    beneficios=data["beneficios"],
                    activa=True,
                    fecha_limite=data.get("fecha_limite"),
                    skills=data.get("skills"),
                    experiencia=data.get("experiencia"),
                    nivel_estudios=data.get("nivel_estudios"),
                    area=data.get("area"),
                    industria=data.get("industria"),
                )
            )
        db.session.commit()
        print("Base de datos creada y vacantes de ejemplo insertadas.")


if __name__ == "__main__":
    run()

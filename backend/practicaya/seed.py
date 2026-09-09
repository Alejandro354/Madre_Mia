from datetime import date, timedelta

from werkzeug.security import generate_password_hash

from app import create_app
from extensions import db
from models import (
    User, StudentProfile, CompanyProfile, Vacancy,
    PortfolioItem, SocialLink,
)
from utils import utcnow

OTHER_COMPANIES = [
    {
        "email": "contacto@technova.com",
        "password": "technova123",
        "nombre_empresa": "TechNova",
        "descripcion": "Consultora de software especializada en productos digitales para startups.",
        "ubicacion": "Medellín, Colombia",
        "industria": "Tecnología",
        "tamano_empresa": "11-50 empleados",
        "anio_fundacion": "2020",
        "sitio_web": "https://technova.co",
        "vacancy": {
            "cargo": "Practicante de Desarrollo Backend",
            "descripcion": "Apoya al equipo de ingeniería en el desarrollo de APIs para nuestros clientes.",
            "requisitos": "Conocimientos de Python o Node.js. Bases de datos relacionales. Ganas de aprender.",
            "beneficios": "Mentoría técnica, horario flexible y posibilidad de contratación.",
            "ubicacion": "Medellín, Colombia",
            "modalidad": "Híbrido",
            "tipo_contrato": "Práctica",
            "fecha_limite": date(2026, 11, 5),
            "skills": "Python, Node.js, SQL, Git",
            "experiencia": "Sin experiencia",
            "nivel_estudios": "Estudiante últimos semestres",
            "area": "Desarrollo",
            "industria": "Tecnología",
        },
    },
    {
        "email": "contacto@datasur.com",
        "password": "datasur123",
        "nombre_empresa": "DataSur",
        "descripcion": "Empresa de analítica de datos para el sector retail y financiero.",
        "ubicacion": "Cali, Colombia",
        "industria": "Datos",
        "tamano_empresa": "51-200 empleados",
        "anio_fundacion": "2016",
        "sitio_web": "https://datasur.co",
        "vacancy": {
            "cargo": "Analista de Datos Junior",
            "descripcion": "Apoya la construcción de dashboards y reportes para clientes del sector retail.",
            "requisitos": "SQL, Excel avanzado. Power BI o Tableau es un plus.",
            "beneficios": "Salario competitivo, seguro de salud y capacitación continua.",
            "ubicacion": "Cali, Colombia",
            "modalidad": "Presencial",
            "tipo_contrato": "Tiempo completo",
            "fecha_limite": date(2026, 10, 25),
            "skills": "SQL, Excel, Power BI",
            "experiencia": "1 - 2 años",
            "nivel_estudios": "Profesional / Técnico",
            "area": "Datos",
            "industria": "Retail",
        },
    },
]

OTHER_STUDENTS = [
    {
        "email": "estudiante2@practicaya.com",
        "password": "estudiante123",
        "nombre": "Valentina Rojas",
        "telefono": "3009876543",
        "fecha_nacimiento": date(2003, 2, 20),
        "institucion": "Universidad Icesi",
        "programa": "Diseño Gráfico",
        "semestre": "6",
        "ciudad": "Cali",
        "rol": "Diseñadora UX/UI",
        "descripcion": "Estudiante de diseño interesada en experiencia de usuario y branding digital.",
        "habilidades": "Figma, Illustrator, Photoshop, Branding",
        "portfolio": {"titulo": "Portafolio en Behance", "enlace_url": "https://behance.net/valentinarojas"},
        "socials": {"linkedin": "https://linkedin.com/in/valentinarojas"},
    },
]

VACANCIES = [
    {
        "cargo": "Desarrollador Frontend Junior",
        "descripcion": "Desarrolla interfaces modernas y escalables con las mejores tecnologías. Buscamos un desarrollador frontend junior apasionado por React para unirse a nuestro equipo de producto.",
        "requisitos": "Conocimientos de JavaScript y React. Manejo de HTML, CSS y Git. Inglés básico.",
        "beneficios": "Trabajo remoto, horario flexible, plan de capacitación y ambiente de crecimiento.",
        "ubicacion": "Bogotá, Colombia",
        "modalidad": "Presencial",
        "tipo_contrato": "Práctica",
        "fecha_limite": date(2026, 10, 15),
        "skills": "React, JavaScript, HTML, CSS, Git",
        "experiencia": "1 - 2 años",
        "nivel_estudios": "Profesional / Técnico",
        "area": "Desarrollo",
        "industria": "Tecnología",
    },
    {
        "cargo": "Analista de Datos",
        "descripcion": "Analiza y transforma datos para apoyar decisiones de negocio en clientes de retail.",
        "requisitos": "Manejo de SQL y Excel avanzado. Conocimiento de Python o R es un plus.",
        "beneficios": "Salario competitivo, seguro de salud y bonos por desempeño.",
        "ubicacion": "Medellín, Colombia",
        "modalidad": "Híbrido",
        "tipo_contrato": "Tiempo completo",
        "fecha_limite": date(2026, 10, 30),
        "skills": "SQL, Excel, Python, Power BI",
        "experiencia": "2 - 3 años",
        "nivel_estudios": "Profesional",
        "area": "Datos",
        "industria": "Retail",
    },
    {
        "cargo": "Diseñador Gráfico",
        "descripcion": "Crea piezas visuales para campañas digitales de marcas nacionales e internacionales.",
        "requisitos": "Dominio de Illustrator y Photoshop. Portafolio demostrable.",
        "beneficios": "Modalidad híbrida, equipo creativo y capacitaciones constantes.",
        "ubicacion": "Cali, Colombia",
        "modalidad": "Remoto",
        "tipo_contrato": "Medio tiempo",
        "fecha_limite": date(2026, 9, 30),
        "skills": "Illustrator, Photoshop, Figma, Branding",
        "experiencia": "1 - 2 años",
        "nivel_estudios": "Técnico / Tecnólogo",
        "area": "Diseño",
        "industria": "Publicidad",
    },
    {
        "cargo": "Practicante de Finanzas",
        "descripcion": "Apoya al equipo de finanzas en conciliaciones, reportes y análisis de estados financieros.",
        "requisitos": "Estudiante de últimos semestres de administración, economía o finanzas. Excel intermedio.",
        "beneficios": "Auxilio de transporte, posibilidad de contratación y mentoría.",
        "ubicacion": "Bogotá, Colombia",
        "modalidad": "Presencial",
        "tipo_contrato": "Práctica",
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

        # ── Empresa ──
        empresa_user = User(
            email="empresa@practicaya.com",
            password_hash=generate_password_hash("empresa123"),
            role="empresa",
        )
        db.session.add(empresa_user)
        db.session.flush()

        empresa_profile = CompanyProfile(
            user_id=empresa_user.id,
            nombre_empresa="Tech Solutions S.A.",
            descripcion="Empresa de tecnología enfocada en soluciones digitales innovadoras para el sector empresarial.",
            ubicacion="Bogotá, Colombia",
            industria="Tecnología",
            tamano_empresa="50-100",
            anio_fundacion="2018",
            sitio_web="https://techsolutions.co",
        )
        db.session.add(empresa_profile)
        db.session.flush()

        # Vacantes
        base = utcnow()
        for i, data in enumerate(VACANCIES):
            db.session.add(
                Vacancy(
                    company_id=empresa_profile.id,
                    cargo=data["cargo"],
                    descripcion=data["descripcion"],
                    requisitos=data["requisitos"],
                    beneficios=data["beneficios"],
                    ubicacion=data["ubicacion"],
                    modalidad=data["modalidad"],
                    tipo_contrato=data["tipo_contrato"],
                    fecha_publicacion=base - timedelta(days=i * 2),
                    activa=True,
                    fecha_limite=data.get("fecha_limite"),
                    skills=data.get("skills"),
                    experiencia=data.get("experiencia"),
                    nivel_estudios=data.get("nivel_estudios"),
                    area=data.get("area"),
                    industria=data.get("industria"),
                )
            )

        # ── Estudiante ──
        estudiante_user = User(
            email="estudiante@practicaya.com",
            password_hash=generate_password_hash("estudiante123"),
            role="estudiante",
        )
        db.session.add(estudiante_user)
        db.session.flush()

        student_profile = StudentProfile(
            user_id=estudiante_user.id,
            nombre="Carlos Martínez",
            telefono="3001234567",
            fecha_nacimiento=date(2002, 5, 15),
            institucion="Universidad del Valle",
            programa="Ingeniería de Sistemas",
            semestre="8",
            ciudad="Cali",
            rol="Desarrollador Full Stack",
            descripcion="Estudiante apasionado por el desarrollo web y las tecnologías emergentes.",
            habilidades="React, Python, Node.js, SQL, Git",
        )
        db.session.add(student_profile)
        db.session.flush()

        # Portfolio
        db.session.add(
            PortfolioItem(
                student_id=student_profile.id,
                tipo="enlace",
                titulo="Mi portafolio web",
                enlace_url="https://carlosmartinez.dev",
            )
        )

        # Social links
        db.session.add(SocialLink(student_id=student_profile.id, red="github", url="https://github.com/carlosmartinez"))
        db.session.add(SocialLink(student_id=student_profile.id, red="linkedin", url="https://linkedin.com/in/carlosmartinez"))

        # ── Empresas y estudiantes adicionales (más variedad para probar
        # el buscador de candidatos y el listado de vacantes) ──
        for company_data in OTHER_COMPANIES:
            other_user = User(
                email=company_data["email"],
                password_hash=generate_password_hash(company_data["password"]),
                role="empresa",
            )
            db.session.add(other_user)
            db.session.flush()

            other_profile = CompanyProfile(
                user_id=other_user.id,
                nombre_empresa=company_data["nombre_empresa"],
                descripcion=company_data["descripcion"],
                ubicacion=company_data["ubicacion"],
                industria=company_data["industria"],
                tamano_empresa=company_data["tamano_empresa"],
                anio_fundacion=company_data["anio_fundacion"],
                sitio_web=company_data["sitio_web"],
            )
            db.session.add(other_profile)
            db.session.flush()

            v = company_data["vacancy"]
            db.session.add(
                Vacancy(
                    company_id=other_profile.id,
                    cargo=v["cargo"],
                    descripcion=v["descripcion"],
                    requisitos=v["requisitos"],
                    beneficios=v["beneficios"],
                    ubicacion=v["ubicacion"],
                    modalidad=v["modalidad"],
                    tipo_contrato=v["tipo_contrato"],
                    fecha_publicacion=base,
                    activa=True,
                    fecha_limite=v.get("fecha_limite"),
                    skills=v.get("skills"),
                    experiencia=v.get("experiencia"),
                    nivel_estudios=v.get("nivel_estudios"),
                    area=v.get("area"),
                    industria=v.get("industria"),
                )
            )

        for student_data in OTHER_STUDENTS:
            other_student_user = User(
                email=student_data["email"],
                password_hash=generate_password_hash(student_data["password"]),
                role="estudiante",
            )
            db.session.add(other_student_user)
            db.session.flush()

            other_student_profile = StudentProfile(
                user_id=other_student_user.id,
                nombre=student_data["nombre"],
                telefono=student_data["telefono"],
                fecha_nacimiento=student_data["fecha_nacimiento"],
                institucion=student_data["institucion"],
                programa=student_data["programa"],
                semestre=student_data["semestre"],
                ciudad=student_data["ciudad"],
                rol=student_data["rol"],
                descripcion=student_data["descripcion"],
                habilidades=student_data["habilidades"],
            )
            db.session.add(other_student_profile)
            db.session.flush()

            pf = student_data.get("portfolio")
            if pf:
                db.session.add(
                    PortfolioItem(
                        student_id=other_student_profile.id,
                        tipo="enlace",
                        titulo=pf["titulo"],
                        enlace_url=pf["enlace_url"],
                    )
                )

            for red, url in student_data.get("socials", {}).items():
                db.session.add(SocialLink(student_id=other_student_profile.id, red=red, url=url))

        db.session.commit()
        print("=" * 50)
        print("✅ Base de datos creada exitosamente!")
        print("=" * 50)
        print()
        print("👤 EMPRESA:")
        print("   Correo: empresa@practicaya.com")
        print("   Contraseña: empresa123")
        print()
        print("👨‍🎓 ESTUDIANTE:")
        print("   Correo: estudiante@practicaya.com")
        print("   Contraseña: estudiante123")
        print()
        print("   (+ %d empresas y %d estudiantes adicionales de prueba)" % (
            len(OTHER_COMPANIES), len(OTHER_STUDENTS)
        ))
        print()
        print(f"📋 {len(VACANCIES) + len(OTHER_COMPANIES)} vacantes creadas")
        print("=" * 50)


if __name__ == "__main__":
    run()

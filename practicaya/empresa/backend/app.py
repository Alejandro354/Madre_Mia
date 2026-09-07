from flask import Flask, request, jsonify
from sqlalchemy import or_, desc
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_socketio import SocketIO, emit, join_room, leave_room
from werkzeug.security import generate_password_hash, check_password_hash
import os
import re
from datetime import timedelta, datetime

from models import db, User, StudentProfile, CompanyProfile, PortfolioItem, SocialLink, Vacancy, Application, SavedVacancy, SelectedCandidate, Message

app = Flask(__name__)
app.config['SECRET_KEY'] = 'super-secret-key-practicompu'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///practicompu.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'jwt-super-secret-key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__name__)), 'uploads')

CORS(app)
db.init_app(app)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Create uploads folder if not exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

with app.app_context():
    db.create_all()

# --- UTILS ---
def is_valid_password(password):
    # Minimum 8 characters, at least one letter and one number
    if len(password) < 8:
        return False
    if not re.search(r"[a-zA-Z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    return True

def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

# --- AUTH ROUTES ---
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')
    role = data.get('role') # 'estudiante' or 'empresa'
    nombre = data.get('nombre') # For student or company name

    if not all([email, password, confirm_password, role, nombre]):
        return jsonify({"msg": "Todos los campos son obligatorios"}), 400

    if not is_valid_email(email):
        return jsonify({"msg": "Formato de correo inválido"}), 400

    if password != confirm_password:
        return jsonify({"msg": "Las contraseñas no coinciden"}), 400

    if not is_valid_password(password):
        return jsonify({"msg": "La contraseña debe tener mínimo 8 caracteres, incluyendo letras y números"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Este correo ya está registrado. Inicia sesión o usa otro correo"}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(email=email, password_hash=hashed_password, role=role)
    db.session.add(new_user)
    db.session.commit()

    if role == 'estudiante':
        profile = StudentProfile(user_id=new_user.id, nombre=nombre)
        db.session.add(profile)
    elif role == 'empresa':
        profile = CompanyProfile(user_id=new_user.id, nombre_empresa=nombre)
        db.session.add(profile)
    
    db.session.commit()

    return jsonify({"msg": "Usuario registrado exitosamente"}), 201

# Dictionary to track failed login attempts {email: {"attempts": int, "locked_until": datetime}}
failed_logins = {}
from datetime import datetime

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"msg": "Correo y contraseña son obligatorios"}), 400

    # Check lock
    now = datetime.utcnow()
    if email in failed_logins:
        if failed_logins[email]['locked_until'] and now < failed_logins[email]['locked_until']:
            return jsonify({"msg": "Cuenta bloqueada temporalmente. Intenta en 5 minutos."}), 403
        elif failed_logins[email]['locked_until'] and now >= failed_logins[email]['locked_until']:
            # Reset lock if time passed
            failed_logins[email] = {"attempts": 0, "locked_until": None}

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        # Record failed attempt
        if email not in failed_logins:
            failed_logins[email] = {"attempts": 1, "locked_until": None}
        else:
            failed_logins[email]["attempts"] += 1
            if failed_logins[email]["attempts"] >= 5:
                failed_logins[email]["locked_until"] = now + timedelta(minutes=5)
                return jsonify({"msg": "Demasiados intentos fallidos. Cuenta bloqueada por 5 minutos."}), 403
                
        return jsonify({"msg": "Correo o contraseña incorrectos"}), 401

    # Reset failed attempts on success
    if email in failed_logins:
        del failed_logins[email]

    access_token = create_access_token(identity=str(user.id))
    return jsonify(access_token=access_token, user={'id': user.id, 'role': user.role, 'email': user.email}), 200

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_me():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    profile_data = {}
    if user.role == 'estudiante':
        profile = user.student_profile
        if profile:
            profile_data = {
                "nombre": profile.nombre,
                "foto_url": profile.foto_url
            }
    elif user.role == 'empresa':
        profile = user.company_profile
        if profile:
            profile_data = {
                "nombre_empresa": profile.nombre_empresa,
                "logo_url": profile.logo_url
            }

    return jsonify({
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "profile": profile_data
    }), 200

# --- COMPANY AND STUDENT ROUTES ---
@app.route('/api/students', methods=['GET'])
@jwt_required()
def get_students():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    saved_student_ids = set()
    if user and user.role == 'empresa' and user.company_profile:
        saved = SelectedCandidate.query.filter_by(company_id=user.company_profile.id).all()
        saved_student_ids = {s.student_id for s in saved}

    # Return all users with role 'estudiante' and their profiles
    students = User.query.filter_by(role='estudiante').all()
    result = []
    for s in students:
        if s.student_profile:
            result.append({
                "id": s.id,
                "email": s.email,
                "nombre": s.student_profile.nombre,
                "foto_url": s.student_profile.foto_url,
                "carrera": s.student_profile.programa,
                "semestre": s.student_profile.semestre,
                "universidad": s.student_profile.institucion,
                "habilidades": s.student_profile.habilidades or "",
                "promedio": "N/A",
                "disponibilidad": "N/A",
                "ubicacion": s.student_profile.ciudad,
                "estado": "Activo",
                "is_saved": s.student_profile.id in saved_student_ids
            })
    return jsonify(result), 200

@app.route('/api/students/<int:user_id>', methods=['GET'])
@jwt_required()
def get_student(user_id):
    student_user = User.query.get(user_id)
    if not student_user or student_user.role != 'estudiante':
        return jsonify({"msg": "Estudiante no encontrado"}), 404
        
    profile = student_user.student_profile
    if not profile:
        return jsonify({"msg": "Perfil incompleto"}), 404

    # Extract portfolios and social links
    portfolios = [{"id": p.id, "type": p.tipo, "name": p.nombre_archivo or p.url_o_path, "url": p.url_o_path} for p in profile.portfolios]
    social_links = [{"id": s.id, "red_social": s.red_social, "url": s.url} for s in profile.social_links]

    student_data = {
        "id": student_user.id,
        "email": student_user.email,
        "nombre": profile.nombre,
        "foto_url": profile.foto_url,
        "carrera": profile.programa,
        "semestre": profile.semestre,
        "universidad": profile.institucion,
        "ubicacion": profile.ciudad,
        "telefono": profile.telefono,
        "fecha_nacimiento": profile.fecha_nacimiento,
        "portfolios": portfolios,
        "social_links": social_links,
        "rol": profile.rol,
        "descripcion": profile.descripcion,
        "habilidades": profile.habilidades or "",
        # Default/Mock fields until added to model
        "promedio": "N/A",
        "disponibilidad": "N/A",
        "estado": "Activo"
    }
    return jsonify(student_data), 200

@app.route('/api/student/profile', methods=['GET', 'PUT'])
@jwt_required()
def student_own_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))

    if user.role != 'estudiante':
        return jsonify({"msg": "Acceso no autorizado"}), 403

    profile = user.student_profile
    if not profile:
        profile = StudentProfile(user_id=user.id, nombre="Mi Perfil")
        db.session.add(profile)
        db.session.commit()

    def get_social(red_social):
        link = next((s for s in profile.social_links if s.red_social == red_social), None)
        return link.url if link else ''

    def set_social(red_social, url):
        link = next((s for s in profile.social_links if s.red_social == red_social), None)
        url = (url or '').strip()
        if url:
            if link:
                link.url = url
            else:
                db.session.add(SocialLink(student_id=profile.id, red_social=red_social, url=url))
        elif link:
            db.session.delete(link)

    if request.method == 'GET':
        return jsonify({
            "nombre": profile.nombre,
            "rol": profile.rol,
            "telefono": profile.telefono,
            "fecha_nacimiento": profile.fecha_nacimiento,
            "ciudad": profile.ciudad,
            "institucion": profile.institucion,
            "programa": profile.programa,
            "semestre": profile.semestre,
            "descripcion": profile.descripcion,
            "habilidades": profile.habilidades or "",
            "foto_url": profile.foto_url,
            "linkedin": get_social('linkedin'),
            "instagram": get_social('instagram')
        }), 200

    if request.method == 'PUT':
        data = request.get_json()
        profile.nombre = data.get('nombre', profile.nombre)
        profile.rol = data.get('rol', profile.rol)
        profile.telefono = data.get('telefono', profile.telefono)
        profile.fecha_nacimiento = data.get('fecha_nacimiento', profile.fecha_nacimiento)
        profile.ciudad = data.get('ciudad', profile.ciudad)
        profile.institucion = data.get('institucion', profile.institucion)
        profile.programa = data.get('programa', profile.programa)
        profile.semestre = data.get('semestre', profile.semestre)
        profile.descripcion = data.get('descripcion', profile.descripcion)
        profile.habilidades = data.get('habilidades', profile.habilidades)
        if 'foto_url' in data:
            profile.foto_url = data.get('foto_url')

        if 'linkedin' in data:
            set_social('linkedin', data.get('linkedin'))
        if 'instagram' in data:
            set_social('instagram', data.get('instagram'))

        db.session.commit()
        return jsonify({"msg": "Perfil actualizado exitosamente"}), 200

@app.route('/api/vacancies', methods=['GET'])
@jwt_required()
def get_vacancies():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    # Get saved and applied vacancy IDs for students
    saved_ids = set()
    applied_ids = set()
    if user.role == 'estudiante' and user.student_profile:
        saved = SavedVacancy.query.filter_by(student_id=user.student_profile.id).all()
        saved_ids = {sv.vacancy_id for sv in saved}
        apps = Application.query.filter_by(student_id=user.student_profile.id).all()
        applied_ids = {a.vacancy_id for a in apps}
    
    vacancies = Vacancy.query.all()
    result = []
    for v in vacancies:
        company = v.company
        result.append({
            "id": v.id,
            "title": v.cargo,
            "company": company.nombre_empresa if company else "Empresa Desconocida",
            "location": v.ubicacion,
            "type1": v.modalidad or "Presencial",
            "type2": v.tipo_contrato or "Tiempo completo",
            "description": v.descripcion,
            "published": v.fecha_publicacion.strftime("%Y-%m-%d") if v.fecha_publicacion else "Reciente",
            "logo_url": company.logo_url if company and company.logo_url else None,
            "saved": v.id in saved_ids,
            "applied": v.id in applied_ids
        })
    return jsonify(result), 200

@app.route('/api/company/profile', methods=['GET', 'PUT'])
@jwt_required()
def company_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if user.role != 'empresa':
        return jsonify({"msg": "Acceso no autorizado"}), 403

    profile = user.company_profile
    if not profile:
        profile = CompanyProfile(user_id=user.id, nombre_empresa="Mi Empresa")
        db.session.add(profile)
        db.session.commit()

    if request.method == 'GET':
        return jsonify({
            "nombre_empresa": profile.nombre_empresa,
            "descripcion": profile.descripcion,
            "ubicacion": profile.ubicacion,
            "sitio_web": profile.sitio_web,
            "industria": profile.industria,
            "tamano_empresa": profile.tamano_empresa,
            "anio_fundacion": profile.anio_fundacion,
            "logo_url": profile.logo_url,
            "banner_url": profile.banner_url,
            "linkedin": profile.linkedin,
            "instagram": profile.instagram
        }), 200

    if request.method == 'PUT':
        data = request.get_json()
        profile.nombre_empresa = data.get('nombre_empresa', profile.nombre_empresa)
        profile.descripcion = data.get('descripcion', profile.descripcion)[:350] if data.get('descripcion') is not None else profile.descripcion
        profile.ubicacion = data.get('ubicacion', profile.ubicacion)
        profile.sitio_web = data.get('sitio_web', profile.sitio_web)
        profile.industria = data.get('industria', profile.industria)
        profile.tamano_empresa = data.get('tamano_empresa', profile.tamano_empresa)
        profile.anio_fundacion = data.get('anio_fundacion', profile.anio_fundacion)
        profile.logo_url = data.get('logo_url', profile.logo_url)
        if 'banner_url' in data:
            profile.banner_url = data.get('banner_url')
        profile.linkedin = data.get('linkedin', profile.linkedin)
        profile.instagram = data.get('instagram', profile.instagram)
        db.session.commit()
        return jsonify({"msg": "Perfil actualizado exitosamente"}), 200

@app.route('/api/company/dashboard/stats', methods=['GET'])
@jwt_required()
def company_dashboard_stats():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))

    if user.role != 'empresa' or not user.company_profile:
        return jsonify({"msg": "Acceso no autorizado"}), 403

    company_id = user.company_profile.id
    vacancies = Vacancy.query.filter_by(company_id=company_id).all()
    vacancy_ids = [v.id for v in vacancies]

    applications = Application.query.filter(Application.vacancy_id.in_(vacancy_ids)).all() if vacancy_ids else []

    # Postulaciones por vacante
    postulaciones_por_vacante = []
    for v in vacancies:
        count = sum(1 for a in applications if a.vacancy_id == v.id)
        postulaciones_por_vacante.append({"vacante": v.cargo, "count": count})
    postulaciones_por_vacante.sort(key=lambda x: x["count"], reverse=True)

    # Estado de postulaciones
    estado_labels = ["Enviada", "En revisión", "Aceptada", "Rechazada"]
    estado_postulaciones = {estado: 0 for estado in estado_labels}
    for a in applications:
        if a.estado in estado_postulaciones:
            estado_postulaciones[a.estado] += 1
        else:
            estado_postulaciones[a.estado] = estado_postulaciones.get(a.estado, 0) + 1

    # Postulaciones en los últimos 30 días
    today = datetime.utcnow().date()
    days = [today - timedelta(days=i) for i in range(29, -1, -1)]
    counts_by_day = {d.isoformat(): 0 for d in days}
    for a in applications:
        if a.fecha_postulacion:
            day_key = a.fecha_postulacion.date().isoformat()
            if day_key in counts_by_day:
                counts_by_day[day_key] += 1
    postulaciones_por_dia = [{"date": d.isoformat(), "count": counts_by_day[d.isoformat()]} for d in days]

    selected_count = SelectedCandidate.query.filter_by(company_id=company_id).count()

    return jsonify({
        "vacantes_activas": len(vacancies),
        "postulaciones_totales": len(applications),
        "candidatos_seleccionados": selected_count,
        "postulaciones_por_vacante": postulaciones_por_vacante,
        "estado_postulaciones": estado_postulaciones,
        "postulaciones_por_dia": postulaciones_por_dia
    }), 200

@app.route('/api/company/vacancies', methods=['GET', 'POST'])
@jwt_required()
def company_vacancies():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))

    if user.role != 'empresa' or not user.company_profile:
        return jsonify({"msg": "Acceso no autorizado"}), 403

    company_id = user.company_profile.id

    if request.method == 'GET':
        vacancies = Vacancy.query.filter_by(company_id=company_id).order_by(desc(Vacancy.fecha_publicacion)).all()
        result = []
        for v in vacancies:
            result.append({
                "id": v.id,
                "cargo": v.cargo,
                "descripcion": v.descripcion,
                "requisitos": v.requisitos,
                "beneficios": v.beneficios,
                "ubicacion": v.ubicacion,
                "modalidad": v.modalidad or "Presencial",
                "tipo_contrato": v.tipo_contrato or "Tiempo completo",
                "fecha_publicacion": v.fecha_publicacion.strftime("%Y-%m-%d") if v.fecha_publicacion else None,
                "postulaciones_count": len(v.applications)
            })
        return jsonify(result), 200

    if request.method == 'POST':
        data = request.get_json()
        cargo = (data.get('cargo') or '').strip()
        descripcion = (data.get('descripcion') or '').strip()
        requisitos = (data.get('requisitos') or '').strip()
        modalidad = data.get('modalidad') or 'Presencial'
        tipo_contrato = data.get('tipo_contrato') or 'Tiempo completo'

        if not cargo or not descripcion or not requisitos:
            return jsonify({"msg": "Cargo, descripción y requisitos son obligatorios"}), 400

        if modalidad not in ('Presencial', 'Remoto', 'Híbrido'):
            return jsonify({"msg": "Modalidad inválida"}), 400

        if tipo_contrato not in ('Tiempo completo', 'Medio tiempo', 'Práctica'):
            return jsonify({"msg": "Tipo de contrato inválido"}), 400

        new_vacancy = Vacancy(
            company_id=company_id,
            cargo=cargo,
            descripcion=descripcion,
            requisitos=requisitos,
            beneficios=(data.get('beneficios') or '').strip() or None,
            ubicacion=(data.get('ubicacion') or '').strip() or None,
            modalidad=modalidad,
            tipo_contrato=tipo_contrato
        )
        db.session.add(new_vacancy)
        db.session.commit()
        return jsonify({"msg": "Vacante publicada exitosamente", "id": new_vacancy.id}), 201

@app.route('/api/company/vacancies/<int:vacancy_id>', methods=['DELETE'])
@jwt_required()
def delete_company_vacancy(vacancy_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))

    if user.role != 'empresa' or not user.company_profile:
        return jsonify({"msg": "Acceso no autorizado"}), 403

    vacancy = Vacancy.query.get(vacancy_id)
    if not vacancy or vacancy.company_id != user.company_profile.id:
        return jsonify({"msg": "Vacante no encontrada"}), 404

    Application.query.filter_by(vacancy_id=vacancy.id).delete(synchronize_session=False)
    SavedVacancy.query.filter_by(vacancy_id=vacancy.id).delete(synchronize_session=False)
    db.session.delete(vacancy)
    db.session.commit()
    return jsonify({"msg": "Vacante eliminada exitosamente"}), 200

@app.route('/api/company/saved_candidates', methods=['GET', 'POST', 'DELETE'])
@jwt_required()
def saved_candidates():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if user.role != 'empresa':
        return jsonify({"msg": "Acceso no autorizado"}), 403
        
    company_profile_id = user.company_profile.id

    if request.method == 'GET':
        saved = SelectedCandidate.query.filter_by(company_id=company_profile_id).all()
        result = []
        for s in saved:
            student = StudentProfile.query.get(s.student_id)
            if student:
                user_email = User.query.get(student.user_id).email
                result.append({
                    "id": student.user_id, # return the user id of the student
                    "student_profile_id": student.id,
                    "email": user_email,
                    "nombre": student.nombre,
                    "carrera": student.programa,
                    "semestre": student.semestre,
                    "universidad": student.institucion,
                    "habilidades": student.habilidades or "",
                    "promedio": "N/A",
                    "disponibilidad": "N/A",
                    "estado": s.estado, # This state is from SelectedCandidate
                    "ubicacion": student.ciudad,
                    "foto_url": student.foto_url
                })
        return jsonify(result), 200

    if request.method == 'POST':
        data = request.get_json()
        student_id = data.get('student_id') # This should be the user_id of the student, let's map it to student_profile.id
        
        student_user = User.query.get(student_id)
        if not student_user or not student_user.student_profile:
             return jsonify({"msg": "Estudiante no encontrado"}), 404
             
        student_profile_id = student_user.student_profile.id
        
        exists = SelectedCandidate.query.filter_by(company_id=company_profile_id, student_id=student_profile_id).first()
        if exists:
            return jsonify({"msg": "El candidato ya está en la lista"}), 400
            
        new_saved = SelectedCandidate(company_id=company_profile_id, student_id=student_profile_id, estado="En proceso")
        db.session.add(new_saved)
        db.session.commit()
        return jsonify({"msg": "Candidato guardado exitosamente"}), 201
        
    if request.method == 'DELETE':
        student_id = request.args.get('student_id')
        student_user = User.query.get(student_id)
        if not student_user or not student_user.student_profile:
             return jsonify({"msg": "Estudiante no encontrado"}), 404
             
        student_profile_id = student_user.student_profile.id
        
        saved = SelectedCandidate.query.filter_by(company_id=company_profile_id, student_id=student_profile_id).first()
        if saved:
            db.session.delete(saved)
            db.session.commit()
            return jsonify({"msg": "Candidato removido exitosamente"}), 200
        return jsonify({"msg": "Candidato no encontrado en guardados"}), 404

# --- STUDENT: SAVED VACANCIES ---

@app.route('/api/student/saved_vacancies', methods=['GET', 'POST', 'DELETE'])
@jwt_required()
def student_saved_vacancies():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if user.role != 'estudiante':
        return jsonify({"msg": "Acceso no autorizado"}), 403
    
    student_profile = user.student_profile
    if not student_profile:
        return jsonify({"msg": "Perfil de estudiante no encontrado"}), 404
    
    if request.method == 'GET':
        saved = SavedVacancy.query.filter_by(student_id=student_profile.id).all()
        result = []
        for sv in saved:
            v = Vacancy.query.get(sv.vacancy_id)
            if v:
                company = v.company
                result.append({
                    "id": v.id,
                    "title": v.cargo,
                    "company": company.nombre_empresa if company else "Empresa",
                    "location": v.ubicacion,
                    "type1": v.modalidad or "Presencial",
                    "type2": v.tipo_contrato or "Tiempo completo",
                    "description": v.descripcion,
                    "published": v.fecha_publicacion.strftime("%Y-%m-%d") if v.fecha_publicacion else "Reciente",
                    "logo_url": company.logo_url if company and company.logo_url else None
                })
        return jsonify(result), 200
    
    if request.method == 'POST':
        data = request.get_json()
        vacancy_id = data.get('vacancy_id')
        
        exists = SavedVacancy.query.filter_by(student_id=student_profile.id, vacancy_id=vacancy_id).first()
        if exists:
            return jsonify({"msg": "Vacante ya guardada"}), 400
        
        new_saved = SavedVacancy(student_id=student_profile.id, vacancy_id=vacancy_id)
        db.session.add(new_saved)
        db.session.commit()
        return jsonify({"msg": "Vacante guardada exitosamente"}), 201
    
    if request.method == 'DELETE':
        vacancy_id = request.args.get('vacancy_id')
        saved = SavedVacancy.query.filter_by(student_id=student_profile.id, vacancy_id=int(vacancy_id)).first()
        if saved:
            db.session.delete(saved)
            db.session.commit()
            return jsonify({"msg": "Vacante removida de guardados"}), 200
        return jsonify({"msg": "Vacante no encontrada en guardados"}), 404

# --- STUDENT: APPLICATIONS ---

@app.route('/api/student/applications', methods=['GET', 'POST'])
@jwt_required()
def student_applications():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if user.role != 'estudiante':
        return jsonify({"msg": "Acceso no autorizado"}), 403
    
    student_profile = user.student_profile
    if not student_profile:
        return jsonify({"msg": "Perfil de estudiante no encontrado"}), 404
    
    if request.method == 'GET':
        apps = Application.query.filter_by(student_id=student_profile.id).all()
        result = []
        for a in apps:
            v = Vacancy.query.get(a.vacancy_id)
            if v:
                company = v.company
                result.append({
                    "id": a.id,
                    "vacancy_id": v.id,
                    "title": v.cargo,
                    "company": company.nombre_empresa if company else "Empresa",
                    "location": v.ubicacion,
                    "estado": a.estado,
                    "fecha_postulacion": a.fecha_postulacion.strftime("%Y-%m-%d") if a.fecha_postulacion else "Reciente",
                    "logo_url": company.logo_url if company and company.logo_url else None
                })
        return jsonify(result), 200
    
    if request.method == 'POST':
        data = request.get_json()
        vacancy_id = data.get('vacancy_id')
        
        exists = Application.query.filter_by(student_id=student_profile.id, vacancy_id=vacancy_id).first()
        if exists:
            return jsonify({"msg": "Ya te postulaste a esta vacante"}), 400
        
        new_app = Application(student_id=student_profile.id, vacancy_id=vacancy_id, estado="Enviada")
        db.session.add(new_app)
        db.session.commit()
        return jsonify({"msg": "Postulación enviada exitosamente"}), 201

# --- CHAT APIS ---

@app.route('/api/chat/contacts', methods=['GET'])
@jwt_required()
def get_chat_contacts():
    user_id = int(get_jwt_identity())

    # Find all users that have exchanged messages with this user
    messages = Message.query.filter(
        or_(Message.sender_id == user_id, Message.receiver_id == user_id)
    ).order_by(desc(Message.fecha_envio)).all()

    contacts_dict = {}

    for msg in messages:
        # Determine the other user
        other_user_id = msg.receiver_id if msg.sender_id == user_id else msg.sender_id

        if other_user_id not in contacts_dict:
            # Fetch user details
            other_user = User.query.get(other_user_id)
            if not other_user: continue

            name = "Usuario"
            photo = ""
            if other_user.role == 'estudiante' and other_user.student_profile:
                name = other_user.student_profile.nombre
                photo = other_user.student_profile.foto_url or ""
            elif other_user.role == 'empresa' and other_user.company_profile:
                name = other_user.company_profile.nombre_empresa
                photo = other_user.company_profile.logo_url or ""

            unread_count = Message.query.filter_by(
                sender_id=other_user_id, receiver_id=user_id, leido=False
            ).count()

            contacts_dict[other_user_id] = {
                "id": other_user_id,
                "name": name,
                "initial": name[0] if name else "?",
                "color": "#638FE9",
                "lastMessage": msg.contenido,
                "time": msg.fecha_envio.strftime("%I:%M %p"),
                "unread": unread_count > 0,
                "unreadCount": unread_count,
                "avatarUrl": photo
            }

    # Return as list
    contacts_list = list(contacts_dict.values())
    return jsonify(contacts_list), 200

@app.route('/api/chat/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    user_id = int(get_jwt_identity())
    count = Message.query.filter_by(receiver_id=user_id, leido=False).count()
    return jsonify({"unread_count": count}), 200

@app.route('/api/chat/messages/<int:other_user_id>', methods=['GET'])
@jwt_required()
def get_chat_messages(other_user_id):
    user_id = int(get_jwt_identity())
        
    messages = Message.query.filter(
        or_(
            (Message.sender_id == user_id) & (Message.receiver_id == other_user_id),
            (Message.sender_id == other_user_id) & (Message.receiver_id == user_id)
        )
    ).order_by(Message.fecha_envio).all()

    # Mark incoming messages from this contact as read
    Message.query.filter_by(sender_id=other_user_id, receiver_id=user_id, leido=False).update({"leido": True})
    db.session.commit()

    result = []
    for msg in messages:
        result.append({
            "id": msg.id,
            "sender_id": msg.sender_id,
            "receiver_id": msg.receiver_id,
            "text": msg.contenido,
            "time": msg.fecha_envio.strftime("%I:%M %p"),
            "isMine": msg.sender_id == user_id,
        })
        
    return jsonify(result), 200

@app.route('/api/chat/user-info/<int:user_id>', methods=['GET'])
@jwt_required()
def get_chat_user_info(user_id):
    """Get basic info about a user for starting a new chat"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    
    name = "Usuario"
    photo = ""
    if user.role == 'estudiante' and user.student_profile:
        name = user.student_profile.nombre
        photo = user.student_profile.foto_url or ""
    elif user.role == 'empresa' and user.company_profile:
        name = user.company_profile.nombre_empresa
        photo = user.company_profile.logo_url or ""
    
    return jsonify({
        "id": user.id,
        "name": name,
        "initial": name[0] if name else "?",
        "color": "#638FE9",
        "avatarUrl": photo
    }), 200

# --- SOCKET IO EVENTS ---
@socketio.on('connect')
def test_connect():
    print('Client connected')

@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')

@socketio.on('join')
def on_join(data):
    room = data['room'] # User ID as room
    join_room(room)
    print(f"User joined room {room}")

@socketio.on('send_message')
def handle_send_message(data):
    sender_id = data.get('sender_id')
    receiver_id = data.get('receiver_id')
    content = data.get('contenido')
    
    # Save to db
    msg = Message(sender_id=sender_id, receiver_id=receiver_id, contenido=content)
    db.session.add(msg)
    db.session.commit()
    
    message_data = {
        'id': msg.id,
        'sender_id': msg.sender_id,
        'receiver_id': msg.receiver_id,
        'contenido': msg.contenido,
        'fecha_envio': msg.fecha_envio.isoformat(),
        'leido': msg.leido
    }
    
    # Emit to receiver room
    emit('receive_message', message_data, room=str(receiver_id))
    # Emit back to sender to confirm
    emit('receive_message', message_data, room=str(sender_id))

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000, allow_unsafe_werkzeug=True)

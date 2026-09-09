import os
from datetime import datetime
from functools import wraps

from flask import Flask, request, jsonify, session, send_from_directory, abort
from flask_cors import CORS
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename

from database import get_connection, init_db, BASE_DIR

app = Flask(__name__)
app.secret_key = "clave-de-desarrollo-cambiar-en-produccion"
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

import re

# Acepta el frontend sin importar si se abre como localhost, 127.0.0.1 o una
# IP de red (ej. 10.x.x.x) — así frontend y backend siempre calzan como
# "mismo sitio" para el navegador, y la cookie de sesión no se pierde.
CORS(
    app,
    supports_credentials=True,
    origins=re.compile(r"^http://(localhost|127\.0\.0\.1|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):5175$"),
)

UPLOAD_DOCUMENTOS = BASE_DIR / "uploads" / "documentos"
UPLOAD_AVANCES = BASE_DIR / "uploads" / "avances"
UPLOAD_PERFILES = BASE_DIR / "uploads" / "perfiles"
EXT_DOCUMENTOS = {"pdf", "docx"}
EXT_AVANCES = {"pdf", "docx", "pptx", "xlsx", "jpg", "jpeg", "png"}
EXT_FOTO = {"jpg", "jpeg", "png", "webp"}
TAM_MAX_MB = 10
TIPOS_DOCUMENTO = ["Cédula de ciudadanía", "Tarjeta de identidad", "Cédula de extranjería", "Pasaporte"]


# --------------------------------------------------------------------------
# Utilidades
# --------------------------------------------------------------------------
def ext_permitida(nombre_archivo: str, permitidas: set[str]) -> bool:
    return "." in nombre_archivo and nombre_archivo.rsplit(".", 1)[1].lower() in permitidas


def registrar_historial(conn, practicante_id: int, evento: str, descripcion: str):
    conn.execute(
        "INSERT INTO historial (practicante_id, evento, descripcion) VALUES (?, ?, ?)",
        (practicante_id, evento, descripcion),
    )


def practicante_dict(p):
    return {
        "id": p["id"], "nombres": p["nombres"], "apellidos": p["apellidos"],
        "tipo_documento": p["tipo_documento"], "documento": p["documento"],
        "email": p["email"], "telefono": p["telefono"], "foto": p["foto"],
        "cohorte": p["cohorte"], "estado": p["estado"],
    }


def practicante_actual():
    pid = session.get("user_id")
    if session.get("rol") != "wil" or not pid:
        return None
    conn = get_connection()
    row = conn.execute("SELECT * FROM practicantes WHERE id = ?", (pid,)).fetchone()
    conn.close()
    return row


def requiere_rol(rol_esperado):
    def decorador(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            rol_actual = session.get("rol")
            if rol_actual == rol_esperado:
                # La sesión dice que eres frank/wil, pero verificamos que ese
                # usuario TODAVÍA exista en esta base de datos — si el backend
                # se reinició con datos distintos, la cookie puede quedar
                # apuntando a un id que ya no existe.
                conn = get_connection()
                if rol_esperado == "frank":
                    existe = conn.execute("SELECT 1 FROM admins WHERE id = ?", (session.get("user_id"),)).fetchone()
                else:
                    existe = conn.execute("SELECT 1 FROM practicantes WHERE id = ?", (session.get("user_id"),)).fetchone()
                conn.close()
                if not existe:
                    session.clear()
                    return jsonify({"error": "Tu sesión ya no es válida. Inicia sesión de nuevo."}), 401
                return func(*args, **kwargs)
            if rol_actual and rol_actual != rol_esperado:
                return jsonify({"error": "sesion_otro_rol", "rol_activo": rol_actual}), 403
            return jsonify({"error": "no_autenticado"}), 401
        return wrapper
    return decorador


def get_practicante_or_404(conn, pid):
    p = conn.execute("SELECT * FROM practicantes WHERE id = ?", (pid,)).fetchone()
    if p is None:
        conn.close()
        abort(404)
    return p


# ==========================================================================
# SESIÓN
# ==========================================================================
@app.route("/api/session")
def api_session():
    rol = session.get("rol")
    if rol == "frank":
        conn = get_connection()
        admin = conn.execute("SELECT * FROM admins WHERE id = ?", (session["user_id"],)).fetchone()
        conn.close()
        if admin is None:
            session.clear()
            return jsonify({"rol": None})
        return jsonify({"rol": "frank", "nombre": admin["nombre"]})
    if rol == "wil":
        p = practicante_actual()
        if p:
            return jsonify({"rol": "wil", "nombre": p["nombres"], "id": p["id"]})
        session.clear()
    return jsonify({"rol": None})


@app.route("/api/frank/login", methods=["POST"])
def frank_login():
    if session.get("rol") == "wil":
        return jsonify({"error": "sesion_otro_rol", "rol_activo": "wil"}), 403

    data = request.get_json(silent=True) or {}
    usuario = (data.get("usuario") or "").strip().lower()
    password = data.get("password") or ""
    if not usuario or not password:
        return jsonify({"error": "Ingresa usuario y contraseña."}), 400

    conn = get_connection()
    admin = conn.execute("SELECT * FROM admins WHERE lower(usuario) = ?", (usuario,)).fetchone()
    conn.close()

    if admin is None or not check_password_hash(admin["password_hash"], password):
        return jsonify({"error": "Usuario o contraseña incorrectos."}), 401

    session.clear()
    session["rol"] = "frank"
    session["user_id"] = admin["id"]
    return jsonify({"rol": "frank", "nombre": admin["nombre"]})


@app.route("/api/frank/logout", methods=["POST"])
def frank_logout():
    session.clear()
    return jsonify({"ok": True})


@app.route("/api/wil/login", methods=["POST"])
def wil_login():
    if session.get("rol") == "frank":
        return jsonify({"error": "sesion_otro_rol", "rol_activo": "frank"}), 403

    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not email or not password:
        return jsonify({"error": "Ingresa correo y contraseña."}), 400

    conn = get_connection()
    p = conn.execute("SELECT * FROM practicantes WHERE lower(email) = ?", (email,)).fetchone()
    conn.close()

    if p is None or not check_password_hash(p["password_hash"], password):
        return jsonify({"error": "Correo o contraseña incorrectos."}), 401

    session.clear()
    session["rol"] = "wil"
    session["user_id"] = p["id"]
    return jsonify({"rol": "wil", "nombre": p["nombres"], "id": p["id"]})


@app.route("/api/wil/logout", methods=["POST"])
def wil_logout():
    session.clear()
    return jsonify({"ok": True})


# ==========================================================================
# MÓDULO FRANK
# ==========================================================================
@app.route("/api/frank/practicantes")
@requiere_rol("frank")
def frank_practicantes():
    conn = get_connection()
    filas = conn.execute("SELECT * FROM practicantes ORDER BY nombres, apellidos").fetchall()
    conn.close()
    return jsonify([practicante_dict(p) for p in filas])


@app.route("/api/frank/practicantes/<int:pid>")
@requiere_rol("frank")
def frank_practicante_detalle(pid):
    conn = get_connection()
    p = get_practicante_or_404(conn, pid)
    conn.close()
    return jsonify(practicante_dict(p))


# --- Documentos (F-01) ------------------------------------------------------
@app.route("/api/frank/practicantes/<int:pid>/documentos")
@requiere_rol("frank")
def frank_documentos(pid):
    conn = get_connection()
    get_practicante_or_404(conn, pid)
    filas = conn.execute(
        "SELECT * FROM documentos WHERE practicante_id = ? ORDER BY creado_en DESC", (pid,)
    ).fetchall()
    conn.close()
    return jsonify([dict(d) for d in filas])


@app.route("/api/frank/practicantes/<int:pid>/documentos", methods=["POST"])
@requiere_rol("frank")
def frank_subir_documento(pid):
    conn = get_connection()
    get_practicante_or_404(conn, pid)

    archivo = request.files.get("archivo")
    if not archivo or archivo.filename == "":
        conn.close()
        return jsonify({"error": "Selecciona un archivo antes de continuar."}), 400
    if not ext_permitida(archivo.filename, EXT_DOCUMENTOS):
        conn.close()
        return jsonify({"error": f"Formato no permitido. Solo se aceptan: {', '.join(EXT_DOCUMENTOS).upper()}."}), 400

    archivo.seek(0, os.SEEK_END)
    tamano_kb = archivo.tell() / 1024
    archivo.seek(0)
    if tamano_kb > TAM_MAX_MB * 1024:
        conn.close()
        return jsonify({"error": f"El archivo supera el límite de {TAM_MAX_MB} MB."}), 400

    UPLOAD_DOCUMENTOS.mkdir(parents=True, exist_ok=True)
    ext = archivo.filename.rsplit(".", 1)[1].lower()
    nombre_guardado = f"{pid}_{datetime.now().strftime('%Y%m%d%H%M%S')}.{ext}"
    archivo.save(UPLOAD_DOCUMENTOS / nombre_guardado)
    cur = conn.execute(
        """INSERT INTO documentos (practicante_id, nombre_original, nombre_archivo, tipo, tamano_kb)
           VALUES (?, ?, ?, ?, ?)""",
        (pid, secure_filename(archivo.filename), nombre_guardado, ext, round(tamano_kb, 1)),
    )
    registrar_historial(conn, pid, "Documento cargado", f"Se adjuntó el archivo «{archivo.filename}».")
    conn.commit()
    nuevo = conn.execute("SELECT * FROM documentos WHERE id = ?", (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify({"ok": True, "documento": dict(nuevo)}), 201


@app.route("/api/frank/documentos/<int:doc_id>", methods=["DELETE"])
@requiere_rol("frank")
def frank_eliminar_documento(doc_id):
    conn = get_connection()
    doc = conn.execute("SELECT * FROM documentos WHERE id = ?", (doc_id,)).fetchone()
    if doc is None:
        conn.close()
        abort(404)
    pid = doc["practicante_id"]
    try:
        (UPLOAD_DOCUMENTOS / doc["nombre_archivo"]).unlink(missing_ok=True)
    except Exception:
        pass
    conn.execute("DELETE FROM documentos WHERE id = ?", (doc_id,))
    registrar_historial(conn, pid, "Documento eliminado", f"Se eliminó el archivo «{doc['nombre_original']}».")
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@app.route("/api/frank/documentos/<int:doc_id>/ver")
@requiere_rol("frank")
def frank_ver_documento(doc_id):
    conn = get_connection()
    doc = conn.execute("SELECT * FROM documentos WHERE id = ?", (doc_id,)).fetchone()
    conn.close()
    if doc is None:
        abort(404)
    return send_from_directory(UPLOAD_DOCUMENTOS, doc["nombre_archivo"], as_attachment=False)


# --- Notas (F-02) ------------------------------------------------------------
@app.route("/api/frank/practicantes/<int:pid>/notas")
@requiere_rol("frank")
def frank_notas(pid):
    conn = get_connection()
    get_practicante_or_404(conn, pid)
    filas = conn.execute(
        "SELECT * FROM notas WHERE practicante_id = ? ORDER BY creado_en DESC", (pid,)
    ).fetchall()
    conn.close()
    notas = [dict(n) for n in filas]
    promedio = round(sum(n["valor"] for n in notas) / len(notas), 2) if notas else None
    return jsonify({"notas": notas, "promedio": promedio})


@app.route("/api/frank/practicantes/<int:pid>/notas", methods=["POST"])
@requiere_rol("frank")
def frank_agregar_nota(pid):
    conn = get_connection()
    get_practicante_or_404(conn, pid)
    data = request.get_json(silent=True) or {}
    criterio = (data.get("criterio") or "").strip()
    periodo = (data.get("periodo") or "").strip()
    valor_raw = str(data.get("valor") or "").strip()

    if not criterio or not periodo or not valor_raw:
        conn.close()
        return jsonify({"error": "Completa el criterio, el periodo y la nota."}), 400
    try:
        valor = float(valor_raw.replace(",", "."))
        if valor < 0.0 or valor > 5.0:
            conn.close()
            return jsonify({"error": "La nota debe estar entre 0.0 y 5.0."}), 400
    except ValueError:
        conn.close()
        return jsonify({"error": "La nota debe ser un valor numérico."}), 400

    conn.execute(
        "INSERT INTO notas (practicante_id, criterio, periodo, valor) VALUES (?, ?, ?, ?)",
        (pid, criterio, periodo, valor),
    )
    registrar_historial(conn, pid, "Nota registrada", f"{criterio} ({periodo}): {valor:.1f}")
    conn.commit()
    conn.close()
    return jsonify({"ok": True}), 201


@app.route("/api/frank/notas/masivo", methods=["POST"])
@requiere_rol("frank")
def frank_notas_masivo():
    data = request.get_json(silent=True) or {}
    texto = data.get("lote", "")
    lineas = [l.strip() for l in texto.splitlines() if l.strip()]

    conn = get_connection()
    guardadas, errores = 0, []

    for i, linea in enumerate(lineas, start=1):
        partes = [p.strip() for p in linea.split(";")]
        if len(partes) != 4:
            errores.append(f"Línea {i}: formato inválido.")
            continue
        documento, criterio, periodo, valor_raw = partes
        practicante = conn.execute("SELECT id FROM practicantes WHERE documento = ?", (documento,)).fetchone()
        if practicante is None:
            errores.append(f"Línea {i}: no existe un practicante con documento {documento}.")
            continue
        try:
            valor = float(valor_raw.replace(",", "."))
            if valor < 0.0 or valor > 5.0:
                errores.append(f"Línea {i}: la nota {valor_raw} está fuera del rango 0.0–5.0.")
                continue
        except ValueError:
            errores.append(f"Línea {i}: «{valor_raw}» no es un valor numérico.")
            continue

        conn.execute(
            "INSERT INTO notas (practicante_id, criterio, periodo, valor) VALUES (?, ?, ?, ?)",
            (practicante["id"], criterio, periodo, valor),
        )
        registrar_historial(conn, practicante["id"], "Nota registrada (carga masiva)", f"{criterio} ({periodo}): {valor:.1f}")
        guardadas += 1

    conn.commit()
    conn.close()
    return jsonify({"guardadas": guardadas, "errores": errores})


# --- Observaciones (F-03) -----------------------------------------------------
@app.route("/api/frank/practicantes/<int:pid>/observaciones")
@requiere_rol("frank")
def frank_observaciones(pid):
    conn = get_connection()
    get_practicante_or_404(conn, pid)
    filas = conn.execute(
        "SELECT * FROM observaciones WHERE practicante_id = ? ORDER BY creado_en DESC", (pid,)
    ).fetchall()
    conn.close()
    return jsonify([dict(o) for o in filas])


@app.route("/api/frank/practicantes/<int:pid>/observaciones", methods=["POST"])
@requiere_rol("frank")
def frank_agregar_observacion(pid):
    conn = get_connection()
    get_practicante_or_404(conn, pid)
    data = request.get_json(silent=True) or {}
    texto = (data.get("texto") or "").strip()
    autor = (data.get("autor") or "").strip() or "Equipo de acompañamiento"

    if not texto:
        conn.close()
        return jsonify({"error": "Escribe una observación antes de guardar."}), 400

    conn.execute(
        "INSERT INTO observaciones (practicante_id, texto, autor) VALUES (?, ?, ?)",
        (pid, texto, autor),
    )
    registrar_historial(conn, pid, "Observación registrada", f"{autor} añadió una observación.")
    conn.commit()
    conn.close()
    return jsonify({"ok": True}), 201


# --- Avances (subidos por el practicante, Frank administra) ------------------
@app.route("/api/frank/practicantes/<int:pid>/avances")
@requiere_rol("frank")
def frank_avances(pid):
    conn = get_connection()
    get_practicante_or_404(conn, pid)
    filas = conn.execute(
        "SELECT * FROM avances WHERE practicante_id = ? ORDER BY creado_en DESC", (pid,)
    ).fetchall()
    conn.close()
    return jsonify([dict(a) for a in filas])


@app.route("/api/frank/avances/<int:avance_id>/ver")
@requiere_rol("frank")
def frank_ver_avance(avance_id):
    conn = get_connection()
    avance = conn.execute("SELECT * FROM avances WHERE id = ?", (avance_id,)).fetchone()
    conn.close()
    if avance is None:
        abort(404)
    return send_from_directory(UPLOAD_AVANCES, avance["nombre_archivo"], as_attachment=False)


@app.route("/api/frank/avances/<int:avance_id>", methods=["DELETE"])
@requiere_rol("frank")
def frank_eliminar_avance(avance_id):
    conn = get_connection()
    avance = conn.execute("SELECT * FROM avances WHERE id = ?", (avance_id,)).fetchone()
    if avance is None:
        conn.close()
        abort(404)
    pid = avance["practicante_id"]
    try:
        (UPLOAD_AVANCES / avance["nombre_archivo"]).unlink(missing_ok=True)
    except Exception:
        pass
    conn.execute("DELETE FROM avances WHERE id = ?", (avance_id,))
    registrar_historial(conn, pid, "Avance eliminado", f"Frank eliminó el avance «{avance['descripcion']}».")
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


# --- Historial (F-05) ---------------------------------------------------------
@app.route("/api/frank/practicantes/<int:pid>/historial")
@requiere_rol("frank")
def frank_historial(pid):
    conn = get_connection()
    get_practicante_or_404(conn, pid)
    filas = conn.execute(
        "SELECT * FROM historial WHERE practicante_id = ? ORDER BY creado_en DESC", (pid,)
    ).fetchall()
    conn.close()
    return jsonify([dict(h) for h in filas])


@app.route("/api/media/perfiles/<path:nombre_archivo>")
def media_perfil(nombre_archivo):
    return send_from_directory(UPLOAD_PERFILES, nombre_archivo)


@app.route("/api/frank/tipos-documento")
def tipos_documento():
    return jsonify(TIPOS_DOCUMENTO)


# ==========================================================================
# MÓDULO WIL
# ==========================================================================
@app.route("/api/wil/perfil")
@requiere_rol("wil")
def wil_perfil():
    p = practicante_actual()
    return jsonify(practicante_dict(p))


@app.route("/api/wil/perfil", methods=["PUT"])
@requiere_rol("wil")
def wil_perfil_editar():
    p = practicante_actual()
    nombres = (request.form.get("nombres") or "").strip()
    apellidos = (request.form.get("apellidos") or "").strip()
    tipo_documento = (request.form.get("tipo_documento") or "").strip()
    documento = (request.form.get("documento") or "").strip()
    telefono = (request.form.get("telefono") or "").strip()

    if not all([nombres, apellidos, tipo_documento, documento]):
        return jsonify({"error": "Completa todos los campos obligatorios."}), 400

    conn = get_connection()
    foto_nombre = p["foto"]
    archivo = request.files.get("foto")
    if archivo and archivo.filename:
        if not ext_permitida(archivo.filename, EXT_FOTO):
            conn.close()
            return jsonify({"error": "La foto debe ser JPG, PNG o WEBP."}), 400
        archivo.seek(0, os.SEEK_END)
        tamano_kb = archivo.tell() / 1024
        archivo.seek(0)
        if tamano_kb > TAM_MAX_MB * 1024:
            conn.close()
            return jsonify({"error": f"La foto supera el límite de {TAM_MAX_MB} MB."}), 400
        UPLOAD_PERFILES.mkdir(parents=True, exist_ok=True)
        ext = archivo.filename.rsplit(".", 1)[1].lower()
        foto_nombre = f"{p['id']}_{datetime.now().strftime('%Y%m%d%H%M%S')}.{ext}"
        archivo.save(UPLOAD_PERFILES / foto_nombre)

    try:
        conn.execute(
            """UPDATE practicantes SET nombres=?, apellidos=?, tipo_documento=?, documento=?,
               telefono=?, foto=? WHERE id=?""",
            (nombres, apellidos, tipo_documento, documento, telefono, foto_nombre, p["id"]),
        )
        registrar_historial(conn, p["id"], "Perfil actualizado", "Actualizaste la información de tu perfil.")
        conn.commit()
    except Exception:
        conn.close()
        return jsonify({"error": "Ya existe un practicante con ese número de documento."}), 409

    actualizado = conn.execute("SELECT * FROM practicantes WHERE id = ?", (p["id"],)).fetchone()
    conn.close()
    return jsonify(practicante_dict(actualizado))


@app.route("/api/wil/documentos")
@requiere_rol("wil")
def wil_documentos():
    p = practicante_actual()
    conn = get_connection()
    filas = conn.execute(
        "SELECT * FROM documentos WHERE practicante_id = ? ORDER BY creado_en DESC", (p["id"],)
    ).fetchall()
    conn.close()
    return jsonify([dict(d) for d in filas])


@app.route("/api/wil/documentos/<int:doc_id>/ver")
@requiere_rol("wil")
def wil_ver_documento(doc_id):
    p = practicante_actual()
    conn = get_connection()
    doc = conn.execute("SELECT * FROM documentos WHERE id = ? AND practicante_id = ?", (doc_id, p["id"])).fetchone()
    conn.close()
    if doc is None:
        abort(404)
    return send_from_directory(UPLOAD_DOCUMENTOS, doc["nombre_archivo"], as_attachment=False)


@app.route("/api/wil/documentos/<int:doc_id>/descargar")
@requiere_rol("wil")
def wil_descargar_documento(doc_id):
    p = practicante_actual()
    conn = get_connection()
    doc = conn.execute("SELECT * FROM documentos WHERE id = ? AND practicante_id = ?", (doc_id, p["id"])).fetchone()
    conn.close()
    if doc is None:
        abort(404)
    return send_from_directory(
        UPLOAD_DOCUMENTOS, doc["nombre_archivo"], as_attachment=True, download_name=doc["nombre_original"]
    )


@app.route("/api/wil/avances")
@requiere_rol("wil")
def wil_avances():
    p = practicante_actual()
    conn = get_connection()
    filas = conn.execute(
        "SELECT * FROM avances WHERE practicante_id = ? ORDER BY creado_en DESC", (p["id"],)
    ).fetchall()
    conn.close()
    return jsonify([dict(a) for a in filas])


@app.route("/api/wil/avances", methods=["POST"])
@requiere_rol("wil")
def wil_subir_avance():
    p = practicante_actual()
    descripcion = (request.form.get("descripcion") or "").strip()
    archivo = request.files.get("archivo")

    if not descripcion or not archivo or archivo.filename == "":
        return jsonify({"error": "Describe el avance y adjunta un archivo."}), 400
    if not ext_permitida(archivo.filename, EXT_AVANCES):
        return jsonify({"error": f"Formato no permitido. Formatos válidos: {', '.join(sorted(EXT_AVANCES)).upper()}."}), 400

    archivo.seek(0, os.SEEK_END)
    tamano_kb = archivo.tell() / 1024
    archivo.seek(0)
    if tamano_kb > TAM_MAX_MB * 1024:
        return jsonify({"error": f"El archivo supera el límite de {TAM_MAX_MB} MB."}), 400

    UPLOAD_AVANCES.mkdir(parents=True, exist_ok=True)
    ext = archivo.filename.rsplit(".", 1)[1].lower()
    nombre_guardado = f"{p['id']}_{datetime.now().strftime('%Y%m%d%H%M%S')}.{ext}"
    archivo.save(UPLOAD_AVANCES / nombre_guardado)

    conn = get_connection()
    cur = conn.execute(
        """INSERT INTO avances (practicante_id, descripcion, nombre_original, nombre_archivo, tipo)
           VALUES (?, ?, ?, ?, ?)""",
        (p["id"], descripcion, secure_filename(archivo.filename), nombre_guardado, ext),
    )
    registrar_historial(conn, p["id"], "Avance cargado", descripcion)
    conn.commit()
    nuevo = conn.execute("SELECT * FROM avances WHERE id = ?", (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify({"ok": True, "avance": dict(nuevo)}), 201


@app.route("/api/wil/avances/<int:avance_id>/ver")
@requiere_rol("wil")
def wil_ver_avance(avance_id):
    p = practicante_actual()
    conn = get_connection()
    avance = conn.execute("SELECT * FROM avances WHERE id = ? AND practicante_id = ?", (avance_id, p["id"])).fetchone()
    conn.close()
    if avance is None:
        abort(404)
    return send_from_directory(UPLOAD_AVANCES, avance["nombre_archivo"], as_attachment=False)


@app.route("/api/wil/avances/<int:avance_id>", methods=["DELETE"])
@requiere_rol("wil")
def wil_eliminar_avance(avance_id):
    p = practicante_actual()
    conn = get_connection()
    avance = conn.execute(
        "SELECT * FROM avances WHERE id = ? AND practicante_id = ?", (avance_id, p["id"])
    ).fetchone()
    if avance is None:
        conn.close()
        abort(404)
    try:
        (UPLOAD_AVANCES / avance["nombre_archivo"]).unlink(missing_ok=True)
    except Exception:
        pass
    conn.execute("DELETE FROM avances WHERE id = ?", (avance_id,))
    registrar_historial(conn, p["id"], "Avance eliminado", f"Eliminaste el avance «{avance['descripcion']}».")
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@app.route("/api/wil/calificaciones")
@requiere_rol("wil")
def wil_calificaciones():
    p = practicante_actual()
    conn = get_connection()
    filas = conn.execute(
        "SELECT * FROM notas WHERE practicante_id = ? ORDER BY periodo, criterio", (p["id"],)
    ).fetchall()
    conn.close()
    por_periodo: dict[str, list] = {}
    for n in filas:
        por_periodo.setdefault(n["periodo"], []).append(dict(n))
    return jsonify(por_periodo)


@app.route("/api/wil/historial")
@requiere_rol("wil")
def wil_historial():
    p = practicante_actual()
    conn = get_connection()
    filas = conn.execute(
        "SELECT * FROM historial WHERE practicante_id = ? ORDER BY creado_en DESC", (p["id"],)
    ).fetchall()
    conn.close()
    return jsonify([dict(h) for h in filas])


@app.errorhandler(404)
def not_found(_e):
    return jsonify({"error": "No encontrado"}), 404


# --------------------------------------------------------------------------
if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)

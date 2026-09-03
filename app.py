import os
from datetime import datetime
from functools import wraps

from flask import (
    Flask, render_template, request, redirect, url_for,
    flash, session, send_from_directory, abort
)
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename

from database import get_connection, init_db, BASE_DIR

# --------------------------------------------------------------------------
# Configuración
# --------------------------------------------------------------------------
app = Flask(__name__)
app.secret_key = "clave-de-desarrollo-cambiar-en-produccion"
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB

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


def practicante_actual():
    pid = session.get("user_id")
    if session.get("rol") != "wil" or not pid:
        return None
    conn = get_connection()
    row = conn.execute("SELECT * FROM practicantes WHERE id = ?", (pid,)).fetchone()
    conn.close()
    return row


def admin_actual():
    aid = session.get("user_id")
    if session.get("rol") != "frank" or not aid:
        return None
    conn = get_connection()
    row = conn.execute("SELECT * FROM admins WHERE id = ?", (aid,)).fetchone()
    conn.close()
    return row


def requiere_rol(rol_esperado):
    """Bloquea el acceso a un panel si hay una sesión activa del otro rol,
    o si no hay ninguna sesión: cada panel exige su propio login."""
    def decorador(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            rol_actual = session.get("rol")
            if rol_actual == rol_esperado:
                return func(*args, **kwargs)
            if rol_actual and rol_actual != rol_esperado:
                otro = "Panel Frank" if rol_actual == "frank" else "Portal Wil"
                flash(f"Ya tienes una sesión activa en {otro}. Cierra esa sesión para entrar aquí.", "error")
                return redirect(url_for("frank_dashboard") if rol_actual == "frank" else url_for("wil_perfil"))
            flash("Debes iniciar sesión para continuar.", "error")
            return redirect(url_for("frank_login") if rol_esperado == "frank" else url_for("wil_login"))
        return wrapper
    return decorador


def get_practicante_or_404(conn, pid):
    p = conn.execute("SELECT * FROM practicantes WHERE id = ?", (pid,)).fetchone()
    if p is None:
        conn.close()
        abort(404)
    return p


# --------------------------------------------------------------------------
# Portada
# --------------------------------------------------------------------------
@app.context_processor
def inject_session_nombre():
    if session.get("rol") == "wil":
        p = practicante_actual()
        if p:
            return {"session_nombre": p["nombres"]}
    return {}


@app.route("/")
def index():
    return render_template("index.html")


# ==========================================================================
# MÓDULO FRANK — login + gestión y evaluación del practicante
# ==========================================================================

@app.route("/frank/login", methods=["GET", "POST"])
def frank_login():
    if session.get("rol") == "frank":
        return redirect(url_for("frank_dashboard"))
    if session.get("rol") == "wil":
        flash("Ya tienes una sesión activa en Portal Wil. Cierra esa sesión para entrar aquí.", "error")
        return redirect(url_for("wil_perfil"))

    if request.method == "GET":
        return render_template("frank/login.html")

    usuario = (request.form.get("usuario") or "").strip().lower()
    password = request.form.get("password") or ""

    if not usuario or not password:
        flash("Ingresa usuario y contraseña.", "error")
        return render_template("frank/login.html")

    conn = get_connection()
    admin = conn.execute("SELECT * FROM admins WHERE lower(usuario) = ?", (usuario,)).fetchone()
    conn.close()

    if admin is None or not check_password_hash(admin["password_hash"], password):
        flash("Usuario o contraseña incorrectos.", "error")
        return render_template("frank/login.html")

    session.clear()
    session["rol"] = "frank"
    session["user_id"] = admin["id"]
    flash(f"Bienvenido/a, {admin['nombre']}.", "success")
    return redirect(url_for("frank_dashboard"))


@app.route("/frank/logout")
def frank_logout():
    session.clear()
    flash("Sesión cerrada.", "success")
    return redirect(url_for("frank_login"))


@app.route("/frank")
@requiere_rol("frank")
def frank_dashboard():
    conn = get_connection()
    practicantes = conn.execute("SELECT * FROM practicantes ORDER BY nombres, apellidos").fetchall()
    conn.close()
    cohortes = sorted({p["cohorte"] for p in practicantes})
    estados = sorted({p["estado"] for p in practicantes})
    return render_template(
        "frank/dashboard.html", practicantes=practicantes, cohortes=cohortes, estados=estados
    )


@app.route("/frank/practicante/<int:pid>")
@requiere_rol("frank")
def frank_practicante(pid):
    return redirect(url_for("frank_perfil", pid=pid))


# --- Perfil (ver, solo lectura para el administrador) ----------------------
@app.route("/frank/practicante/<int:pid>/perfil")
@requiere_rol("frank")
def frank_perfil(pid):
    conn = get_connection()
    p = get_practicante_or_404(conn, pid)
    conn.close()
    return render_template("frank/perfil.html", p=p, activo="perfil")


# --- F-01 Documentación -----------------------------------------------------
@app.route("/frank/practicante/<int:pid>/documentos")
@requiere_rol("frank")
def frank_documentos(pid):
    conn = get_connection()
    p = get_practicante_or_404(conn, pid)
    documentos = conn.execute(
        "SELECT * FROM documentos WHERE practicante_id = ? ORDER BY creado_en DESC", (pid,)
    ).fetchall()
    conn.close()
    return render_template("frank/documentos.html", p=p, documentos=documentos, activo="documentos")


@app.route("/frank/practicante/<int:pid>/documentos", methods=["POST"])
@requiere_rol("frank")
def frank_subir_documento(pid):
    conn = get_connection()
    p = get_practicante_or_404(conn, pid)

    archivo = request.files.get("archivo")
    if not archivo or archivo.filename == "":
        flash("Selecciona un archivo antes de continuar.", "error")
        conn.close()
        return redirect(url_for("frank_documentos", pid=pid))

    if not ext_permitida(archivo.filename, EXT_DOCUMENTOS):
        flash(f"Formato no permitido. Solo se aceptan: {', '.join(EXT_DOCUMENTOS).upper()}.", "error")
        conn.close()
        return redirect(url_for("frank_documentos", pid=pid))

    archivo.seek(0, os.SEEK_END)
    tamano_kb = archivo.tell() / 1024
    archivo.seek(0)
    if tamano_kb > TAM_MAX_MB * 1024:
        flash(f"El archivo supera el límite de {TAM_MAX_MB} MB.", "error")
        conn.close()
        return redirect(url_for("frank_documentos", pid=pid))

    UPLOAD_DOCUMENTOS.mkdir(parents=True, exist_ok=True)
    ext = archivo.filename.rsplit(".", 1)[1].lower()
    nombre_guardado = f"{pid}_{datetime.now().strftime('%Y%m%d%H%M%S')}.{ext}"
    try:
        archivo.save(UPLOAD_DOCUMENTOS / nombre_guardado)
        conn.execute(
            """INSERT INTO documentos (practicante_id, nombre_original, nombre_archivo, tipo, tamano_kb)
               VALUES (?, ?, ?, ?, ?)""",
            (pid, secure_filename(archivo.filename), nombre_guardado, ext, round(tamano_kb, 1)),
        )
        registrar_historial(conn, pid, "Documento cargado", f"Se adjuntó el archivo «{archivo.filename}».")
        conn.commit()
        flash("Documento cargado correctamente en el almacenamiento.", "success")
    except Exception:
        flash("Ocurrió un error al guardar el documento. Intenta nuevamente.", "error")
    finally:
        conn.close()

    return redirect(url_for("frank_documentos", pid=pid))


@app.route("/frank/documentos/<int:doc_id>/eliminar", methods=["POST"])
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
    flash("Documento eliminado.", "success")
    return redirect(url_for("frank_documentos", pid=pid))


@app.route("/frank/documentos/<int:doc_id>/ver")
@requiere_rol("frank")
def frank_ver_documento(doc_id):
    conn = get_connection()
    doc = conn.execute("SELECT * FROM documentos WHERE id = ?", (doc_id,)).fetchone()
    conn.close()
    if doc is None:
        abort(404)
    return send_from_directory(UPLOAD_DOCUMENTOS, doc["nombre_archivo"], as_attachment=False)


# --- F-02 Notas --------------------------------------------------------------
@app.route("/frank/practicante/<int:pid>/notas")
@requiere_rol("frank")
def frank_notas(pid):
    conn = get_connection()
    p = get_practicante_or_404(conn, pid)
    notas = conn.execute(
        "SELECT * FROM notas WHERE practicante_id = ? ORDER BY creado_en DESC", (pid,)
    ).fetchall()
    conn.close()
    promedio = round(sum(n["valor"] for n in notas) / len(notas), 2) if notas else None
    return render_template("frank/notas.html", p=p, notas=notas, promedio=promedio, activo="notas")


@app.route("/frank/practicante/<int:pid>/notas", methods=["POST"])
@requiere_rol("frank")
def frank_agregar_nota(pid):
    conn = get_connection()
    p = get_practicante_or_404(conn, pid)

    criterio = (request.form.get("criterio") or "").strip()
    periodo = (request.form.get("periodo") or "").strip()
    valor_raw = (request.form.get("valor") or "").strip()

    error = None
    if not criterio or not periodo or not valor_raw:
        error = "Completa el criterio, el periodo y la nota."
    else:
        try:
            valor = float(valor_raw.replace(",", "."))
            if valor < 0.0 or valor > 5.0:
                error = "La nota debe estar entre 0.0 y 5.0."
        except ValueError:
            error = "La nota debe ser un valor numérico."

    if error:
        flash(error, "error")
        conn.close()
        return redirect(url_for("frank_notas", pid=pid))

    conn.execute(
        "INSERT INTO notas (practicante_id, criterio, periodo, valor) VALUES (?, ?, ?, ?)",
        (pid, criterio, periodo, valor),
    )
    registrar_historial(conn, pid, "Nota registrada", f"{criterio} ({periodo}): {valor:.1f}")
    conn.commit()
    conn.close()
    flash("Nota guardada correctamente.", "success")
    return redirect(url_for("frank_notas", pid=pid))


@app.route("/frank/notas/masivo", methods=["GET"])
@requiere_rol("frank")
def frank_notas_masivo_pagina():
    return render_template("frank/notas_masivo.html")


@app.route("/frank/notas/masivo", methods=["POST"])
@requiere_rol("frank")
def frank_notas_masivo():
    texto = request.form.get("lote", "")
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

    if guardadas:
        flash(f"Se guardaron {guardadas} nota(s) correctamente.", "success")
    if errores:
        flash(" | ".join(errores[:5]) + (" …" if len(errores) > 5 else ""), "error")
    if not guardadas and not errores:
        flash("No se recibió ninguna fila para procesar.", "error")

    return redirect(url_for("frank_notas_masivo_pagina"))


# --- F-03 Observaciones -------------------------------------------------------
@app.route("/frank/practicante/<int:pid>/observaciones")
@requiere_rol("frank")
def frank_observaciones(pid):
    conn = get_connection()
    p = get_practicante_or_404(conn, pid)
    observaciones = conn.execute(
        "SELECT * FROM observaciones WHERE practicante_id = ? ORDER BY creado_en DESC", (pid,)
    ).fetchall()
    conn.close()
    return render_template("frank/observaciones.html", p=p, observaciones=observaciones, activo="observaciones")


@app.route("/frank/practicante/<int:pid>/observaciones", methods=["POST"])
@requiere_rol("frank")
def frank_agregar_observacion(pid):
    conn = get_connection()
    p = get_practicante_or_404(conn, pid)

    texto = (request.form.get("texto") or "").strip()
    autor = (request.form.get("autor") or "").strip() or "Equipo de acompañamiento"

    if not texto:
        flash("Escribe una observación antes de guardar.", "error")
        conn.close()
        return redirect(url_for("frank_observaciones", pid=pid))

    conn.execute(
        "INSERT INTO observaciones (practicante_id, texto, autor) VALUES (?, ?, ?)",
        (pid, texto, autor),
    )
    registrar_historial(conn, pid, "Observación registrada", f"{autor} añadió una observación.")
    conn.commit()
    conn.close()
    flash("Observación guardada y asociada al perfil.", "success")
    return redirect(url_for("frank_observaciones", pid=pid))


# --- Avances cargados por el practicante: Frank los administra ---------------
@app.route("/frank/practicante/<int:pid>/avances")
@requiere_rol("frank")
def frank_avances(pid):
    conn = get_connection()
    p = get_practicante_or_404(conn, pid)
    avances = conn.execute(
        "SELECT * FROM avances WHERE practicante_id = ? ORDER BY creado_en DESC", (pid,)
    ).fetchall()
    conn.close()
    return render_template("frank/avances.html", p=p, avances=avances, activo="avances")


@app.route("/frank/avances/<int:avance_id>/ver")
@requiere_rol("frank")
def frank_ver_avance(avance_id):
    conn = get_connection()
    avance = conn.execute("SELECT * FROM avances WHERE id = ?", (avance_id,)).fetchone()
    conn.close()
    if avance is None:
        abort(404)
    return send_from_directory(UPLOAD_AVANCES, avance["nombre_archivo"], as_attachment=False)


@app.route("/frank/avances/<int:avance_id>/eliminar", methods=["POST"])
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
    flash("Avance eliminado.", "success")
    return redirect(url_for("frank_avances", pid=pid))


# --- F-05 Historial ------------------------------------------------------------
@app.route("/frank/practicante/<int:pid>/historial")
@requiere_rol("frank")
def frank_historial(pid):
    conn = get_connection()
    p = get_practicante_or_404(conn, pid)
    historial = conn.execute(
        "SELECT * FROM historial WHERE practicante_id = ? ORDER BY creado_en DESC", (pid,)
    ).fetchall()
    conn.close()
    return render_template("frank/historial.html", p=p, historial=historial, activo="historial")


@app.route("/media/perfiles/<path:nombre_archivo>")
def media_perfil(nombre_archivo):
    return send_from_directory(UPLOAD_PERFILES, nombre_archivo)


# ==========================================================================
# MÓDULO WIL — portal de autogestión del practicante
# ==========================================================================

@app.route("/wil/login", methods=["GET", "POST"])
def wil_login():
    if session.get("rol") == "wil":
        return redirect(url_for("wil_perfil"))
    if session.get("rol") == "frank":
        flash("Ya tienes una sesión activa en Panel Frank. Cierra esa sesión para entrar aquí.", "error")
        return redirect(url_for("frank_dashboard"))

    if request.method == "GET":
        return render_template("wil/login.html")

    email = (request.form.get("email") or "").strip().lower()
    password = request.form.get("password") or ""

    if not email or not password:
        flash("Ingresa correo y contraseña.", "error")
        return render_template("wil/login.html")

    conn = get_connection()
    p = conn.execute("SELECT * FROM practicantes WHERE lower(email) = ?", (email,)).fetchone()
    conn.close()

    if p is None or not check_password_hash(p["password_hash"], password):
        flash("Correo o contraseña incorrectos.", "error")
        return render_template("wil/login.html")

    session.clear()
    session["rol"] = "wil"
    session["user_id"] = p["id"]
    flash(f"Bienvenido/a, {p['nombres']}.", "success")
    return redirect(url_for("wil_perfil"))


@app.route("/wil/logout")
def wil_logout():
    session.clear()
    flash("Sesión cerrada.", "success")
    return redirect(url_for("wil_login"))


@app.route("/wil")
@requiere_rol("wil")
def wil_home():
    return redirect(url_for("wil_perfil"))


# --- Perfil (ver y editar — el propio practicante) --------------------------
@app.route("/wil/perfil")
@requiere_rol("wil")
def wil_perfil():
    p = practicante_actual()
    return render_template("wil/perfil.html", p=p, activo="perfil")


@app.route("/wil/perfil/editar", methods=["GET", "POST"])
@requiere_rol("wil")
def wil_perfil_editar():
    p = practicante_actual()

    if request.method == "GET":
        return render_template("wil/perfil_editar.html", p=p, activo="perfil", tipos=TIPOS_DOCUMENTO)

    nombres = (request.form.get("nombres") or "").strip()
    apellidos = (request.form.get("apellidos") or "").strip()
    tipo_documento = (request.form.get("tipo_documento") or "").strip()
    documento = (request.form.get("documento") or "").strip()
    telefono = (request.form.get("telefono") or "").strip()

    if not all([nombres, apellidos, tipo_documento, documento]):
        flash("Completa todos los campos obligatorios.", "error")
        return redirect(url_for("wil_perfil_editar"))

    conn = get_connection()
    foto_nombre = p["foto"]
    archivo = request.files.get("foto")
    if archivo and archivo.filename:
        if not ext_permitida(archivo.filename, EXT_FOTO):
            flash("La foto debe ser JPG, PNG o WEBP.", "error")
            conn.close()
            return redirect(url_for("wil_perfil_editar"))

        archivo.seek(0, os.SEEK_END)
        tamano_kb = archivo.tell() / 1024
        archivo.seek(0)
        if tamano_kb > TAM_MAX_MB * 1024:
            flash(f"La foto supera el límite de {TAM_MAX_MB} MB.", "error")
            conn.close()
            return redirect(url_for("wil_perfil_editar"))

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
        flash("Perfil actualizado correctamente.", "success")
    except Exception:
        flash("Ya existe un practicante con ese número de documento.", "error")
    finally:
        conn.close()

    return redirect(url_for("wil_perfil"))


# --- W-03 Documentos ---------------------------------------------------------
@app.route("/wil/documentos")
@requiere_rol("wil")
def wil_documentos():
    p = practicante_actual()
    conn = get_connection()
    documentos = conn.execute(
        "SELECT * FROM documentos WHERE practicante_id = ? ORDER BY creado_en DESC", (p["id"],)
    ).fetchall()
    conn.close()
    return render_template("wil/documentos.html", p=p, documentos=documentos, activo="documentos")


@app.route("/wil/documentos/<int:doc_id>/ver")
@requiere_rol("wil")
def wil_ver_documento(doc_id):
    p = practicante_actual()
    conn = get_connection()
    doc = conn.execute("SELECT * FROM documentos WHERE id = ? AND practicante_id = ?", (doc_id, p["id"])).fetchone()
    conn.close()
    if doc is None:
        abort(404)
    return send_from_directory(UPLOAD_DOCUMENTOS, doc["nombre_archivo"], as_attachment=False)


@app.route("/wil/documentos/<int:doc_id>/descargar")
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


# --- W-04 Avances -------------------------------------------------------------
@app.route("/wil/avances")
@requiere_rol("wil")
def wil_avances():
    p = practicante_actual()
    conn = get_connection()
    avances = conn.execute(
        "SELECT * FROM avances WHERE practicante_id = ? ORDER BY creado_en DESC", (p["id"],)
    ).fetchall()
    conn.close()
    return render_template("wil/avances.html", p=p, avances=avances, activo="avances")


@app.route("/wil/avances", methods=["POST"])
@requiere_rol("wil")
def wil_subir_avance():
    p = practicante_actual()
    descripcion = (request.form.get("descripcion") or "").strip()
    archivo = request.files.get("archivo")

    if not descripcion or not archivo or archivo.filename == "":
        flash("Describe el avance y adjunta un archivo.", "error")
        return redirect(url_for("wil_avances"))

    if not ext_permitida(archivo.filename, EXT_AVANCES):
        flash(f"Formato no permitido. Formatos válidos: {', '.join(sorted(EXT_AVANCES)).upper()}.", "error")
        return redirect(url_for("wil_avances"))

    archivo.seek(0, os.SEEK_END)
    tamano_kb = archivo.tell() / 1024
    archivo.seek(0)
    if tamano_kb > TAM_MAX_MB * 1024:
        flash(f"El archivo supera el límite de {TAM_MAX_MB} MB.", "error")
        return redirect(url_for("wil_avances"))

    UPLOAD_AVANCES.mkdir(parents=True, exist_ok=True)
    ext = archivo.filename.rsplit(".", 1)[1].lower()
    nombre_guardado = f"{p['id']}_{datetime.now().strftime('%Y%m%d%H%M%S')}.{ext}"
    archivo.save(UPLOAD_AVANCES / nombre_guardado)

    conn = get_connection()
    conn.execute(
        """INSERT INTO avances (practicante_id, descripcion, nombre_original, nombre_archivo, tipo)
           VALUES (?, ?, ?, ?, ?)""",
        (p["id"], descripcion, secure_filename(archivo.filename), nombre_guardado, ext),
    )
    registrar_historial(conn, p["id"], "Avance cargado", descripcion)
    conn.commit()
    conn.close()

    flash("Avance cargado correctamente.", "success")
    return redirect(url_for("wil_avances"))


@app.route("/wil/avances/<int:avance_id>/ver")
@requiere_rol("wil")
def wil_ver_avance(avance_id):
    p = practicante_actual()
    conn = get_connection()
    avance = conn.execute("SELECT * FROM avances WHERE id = ? AND practicante_id = ?", (avance_id, p["id"])).fetchone()
    conn.close()
    if avance is None:
        abort(404)
    return send_from_directory(UPLOAD_AVANCES, avance["nombre_archivo"], as_attachment=False)


@app.route("/wil/avances/<int:avance_id>/eliminar", methods=["POST"])
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
    flash("Avance eliminado.", "success")
    return redirect(url_for("wil_avances"))


# --- W-05 Calificaciones ------------------------------------------------------
@app.route("/wil/calificaciones")
@requiere_rol("wil")
def wil_calificaciones():
    p = practicante_actual()
    conn = get_connection()
    notas = conn.execute(
        "SELECT * FROM notas WHERE practicante_id = ? ORDER BY periodo, criterio", (p["id"],)
    ).fetchall()
    conn.close()
    por_periodo = {}
    for n in notas:
        por_periodo.setdefault(n["periodo"], []).append(n)
    return render_template("wil/calificaciones.html", p=p, notas_por_periodo=por_periodo, activo="calificaciones")


# --- W-06 Historial ------------------------------------------------------------
@app.route("/wil/historial")
@requiere_rol("wil")
def wil_historial():
    p = practicante_actual()
    conn = get_connection()
    historial = conn.execute(
        "SELECT * FROM historial WHERE practicante_id = ? ORDER BY creado_en DESC", (p["id"],)
    ).fetchall()
    conn.close()
    return render_template("wil/historial.html", p=p, historial=historial, activo="historial")


# --------------------------------------------------------------------------
if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)

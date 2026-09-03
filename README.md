# Sistema de Seguimiento de Practicantes — Frank & Wil

App web funcional en **Flask + SQLite**. Cada módulo tiene su propio login
y su propia sesión: si entras a Frank no puedes entrar a Wil (ni viceversa)
sin cerrar sesión primero.

## Instalación y ejecución

```bash
python -m venv venv
```

Actívalo:
- **Windows:** `venv\Scripts\activate`
- **Mac/Linux:** `source venv/bin/activate`

Instala dependencias y corre:

```bash
pip install -r requirements.txt
python app.py
```

Abre: **http://localhost:5000**

La base de datos (`data/practicantes.db`) se crea sola la primera vez.

## Credenciales de prueba

| Panel | Usuario | Contraseña |
|---|---|---|
| Frank (admin) | `admin` | `admin123` |
| Wil (practicante) | `mariana.zapata@correo.com` | `1234` |
| Wil (practicante) | `julian.restrepo@correo.com` | `1234` |
| Wil (practicante) | `valentina.rios@correo.com` | `1234` |
| Wil (practicante) | `samuel.correa@correo.com` | `1234` |

## Qué cambió en esta versión

1. **Sesiones separadas por rol.** Frank ahora también tiene login
   (`/frank/login`). Mientras haya una sesión activa de un panel, el otro
   panel queda bloqueado hasta cerrar sesión.
2. **Botón "Perfil"** en cada tarjeta del panel Frank: muestra foto,
   nombres, apellidos, tipo de documento, documento, teléfono, correo,
   cohorte y estado, con botón **"Editar perfil"** (también permite subir foto).
3. **Ver archivos, no solo descargar.** Cada documento/avance tiene un
   botón "Ver" que lo abre en una pestaña nueva. Permisos:
   - Documentos subidos por Frank → el practicante solo puede **ver/descargar**, no puede eliminarlos.
   - Avances subidos por el practicante → Frank puede **ver y eliminar** normalmente.
4. **Cada sección es una página independiente**, no todo amontonado:
   - Frank: Perfil · Documentos · Notas · Observaciones · Avances · Historial (cada una con su propia URL).
   - Wil: Perfil · Documentos · Cargar avances · Calificaciones · Historial.

## Estructura

```
app.py                 → rutas y lógica de negocio
database.py             → esquema SQLite, conexión y datos de ejemplo
templates/frank/        → vistas del panel Frank (login, dashboard, y una página por sección)
templates/wil/           → vistas del portal Wil (login, y una página por sección)
static/style.css         → estilos compartidos
uploads/documentos/      → archivos subidos por Frank
uploads/avances/         → archivos subidos por el practicante
uploads/perfiles/        → fotos de perfil
data/practicantes.db     → base de datos (se genera al iniciar)
```

## Notas
- Contraseñas guardadas con hash (`werkzeug.security`), nunca en texto plano.
- `app.secret_key` está fijo para desarrollo; cámbialo antes de producción.
- Para reiniciar los datos, borra `data/practicantes.db` y corre `python app.py` de nuevo.

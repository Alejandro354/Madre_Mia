# Tablero de Practicantes — React + TypeScript + Tailwind + Flask API

Frontend reescrito completo en **React + TypeScript + Tailwind**, con la
paleta de colores solicitada. El backend Flask ya no renderiza HTML: ahora
es una **API JSON** (`/api/...`) que el frontend consume.

## Requisitos
- Python 3.10+
- Node.js 18+ (probado con Node 22)

## 1. Levantar el backend (API)

```bash
cd backend
python -m venv venv
```
- Windows: `venv\Scripts\activate`
- Mac/Linux: `source venv/bin/activate`

```bash
pip install -r requirements.txt
python app.py
```

Queda corriendo en **http://127.0.0.1:5000**. La base de datos
(`backend/data/practicantes.db`) se crea sola la primera vez.

## 2. Levantar el frontend (React)

En **otra terminal**, sin cerrar la del backend:

```bash
cd frontend
npm install
npm run dev
```

Abre **http://localhost:5173**

> Los dos deben estar corriendo al mismo tiempo: el frontend en el puerto
> 5173 le pide los datos al backend en el puerto 5000.

## Credenciales de prueba

| Panel | Usuario | Contraseña |
|---|---|---|
| Frank (admin) | `admin` | `admin123` |
| Wil (practicante) | `mariana.zapata@correo.com` | `1234` |

## Paleta de colores usada

Configurada en `frontend/tailwind.config.js` y `frontend/src/index.css`:

| Variable | Color |
|---|---|
| `primary` | `#FF1837` |
| `primary-light` | `#FDECEF` |
| `sidebar` | `#333333` |
| `background` | `#FFFFFF` |
| `surface` | `#F4F5FA` |
| `text-primary` | `#333333` |
| `text-secondary` | `#666666` |
| `border` | `#E9EBF4` |
| `disabled` | `#F0F2F7` |
| `disabled-text` | `#9A9FB5` |

## Qué se mantuvo del comportamiento anterior

- Sesiones separadas por rol: si tienes sesión activa en Frank, el backend
  rechaza (403) el login de Wil hasta que cierres sesión, y viceversa. El
  frontend lo muestra con una pantalla de aviso en vez de dejarte entrar.
- Editar perfil solo existe en el portal Wil (autogestión). Frank solo
  consulta.
- Documentos subidos por Frank: el practicante solo puede ver/descargar.
- Avances subidos por el practicante: Frank puede ver y eliminar; el
  practicante también puede eliminar los suyos si se equivocó.
- Filtro de practicantes en tiempo real (por nombre/documento, estado y
  cohorte), ignorando tildes, implementado con estado de React — no depende
  de CSS ni de atributos `hidden`.
- Cada sección (Perfil, Documentos, Notas, Observaciones, Avances,
  Historial / Calificaciones) es una ruta independiente de React Router,
  no una sola página larga.
- Foto de perfil recortada uniformemente + visor ampliado (lightbox) al
  hacer clic, que cierra con clic afuera o con Esc.

## Estructura

```
backend/
  app.py              → API Flask (endpoints /api/frank/... y /api/wil/...)
  database.py          → esquema SQLite, conexión y datos de ejemplo
  requirements.txt
  uploads/              → documentos, avances y fotos de perfil
  data/                 → base de datos (se genera al iniciar)

frontend/
  src/
    lib/api.ts           → cliente HTTP hacia el backend
    context/              → sesión (AuthContext) y notificaciones (ToastContext)
    components/           → Sidebar, Avatar, Lightbox, SectionTabs, etc.
    pages/frank/           → panel Frank (dashboard, practicante, notas masivas)
    pages/wil/              → portal Wil (perfil, documentos, avances, etc.)
  tailwind.config.js       → paleta de colores de la marca
```

## Notas
- CORS está configurado para aceptar solo `http://localhost:5173` /
  `http://127.0.0.1:5173` con credenciales (cookies de sesión). Si cambias
  el puerto del frontend, ajusta `origins` en `backend/app.py`.
- Para producción real habría que compilar el frontend (`npm run build`,
  genera `frontend/dist/`) y servirlo aparte, además de cambiar
  `app.secret_key` en el backend.

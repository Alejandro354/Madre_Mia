# Dashboard Administrativo — Backend (Flask + SQLite)

Módulo de **control y reportes** que integra `practicaya.db` y
`practicantes.db` mediante una conexión SQLite con bases adjuntas.

## Requisitos e instalación
```bash
cd backend
pip install -r requirements.txt
```

## Puesta en marcha
```bash
# 1) Usa las bases SQLite existentes con datos reales

# 2) Levanta el servidor (puerto 5000, que es el que espera el proxy de Vite)
python app.py
```

> Las rutas de las bases se pueden personalizar con `PRACTICAYA_DB_PATH` y
> `PRACTICANTES_DB_PATH`.

## Integración con un backend Flask ya existente
Registra los blueprints en tu app y reemplaza el decorador si ya tienes uno:
```python
from routes.dashboard_routes import dashboard_bp
from routes.reportes_routes import reportes_bp
app.register_blueprint(dashboard_bp)
app.register_blueprint(reportes_bp)
```

## Endpoints

Las rutas no implementan autenticación propia; deben registrarse detrás del
middleware de autenticación/autorización del backend que las integre.
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/dashboard/resumen` | Contadores (fecha_inicio, fecha_fin) |
| GET | `/api/dashboard/estadisticas` | Series para gráficos |
| GET | `/api/reportes/tipos` | Tipos de reporte disponibles |
| GET | `/api/reportes/<tipo>` | Listado paginado (page, limit, filtros) |
| GET | `/api/reportes/<tipo>/exportar?formato=pdf` | Descarga filtrada en PDF |

`<tipo>` ∈ `practicantes, postulaciones, vacantes, documentos, promedios, mensajes`.

## Datos y consultas
- **Consultas parametrizadas** (`?`) en todas las llamadas a SQLite.
- La exportación PDF se genera en memoria con la biblioteca estándar, sin Excel ni archivos temporales.
- Nombres de View/columna/filtro salen de un **whitelist** en el servidor
  (`services/reportes_service.py`); nunca del cliente → sin SQL Injection.
- Validación de `fecha_inicio`/`fecha_fin` (YYYY-MM-DD) y de `page`/`limit`.
